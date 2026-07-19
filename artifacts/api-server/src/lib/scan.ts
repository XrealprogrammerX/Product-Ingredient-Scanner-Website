import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import { db, usersTable, scannedProductsTable } from "@workspace/db";
import type { RawIngredient } from "@workspace/db";
import { eq } from "drizzle-orm";
import { lookupGlossary } from "./glossary";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface ScanIngredient {
  name: string;
  normalized_name: string;
  category: "allergen_match" | "avoid_match" | "allow_match" | "general_caution" | "neutral";
  severity: "high" | "medium" | "low" | "none";
  display_color: "red" | "green" | "amber" | "neutral";
  plain_explanation: string | null;
  reason?: string;
}

export interface ScanResult {
  product_name: string | null;
  scan_status: "success" | "partial" | "failed";
  ingredients: ScanIngredient[];
  summary: {
    overall_flag: "allergen_warning" | "avoid_warning" | "safe" | "insufficient_data";
    headline: string;
    matched_user_preferences: string[];
  };
  disclaimer: string;
  source: "cache" | "ai_model";
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const ALLERGEN_LABELS: Record<string, string> = {
  milk: "milk/dairy", dairy: "milk/dairy", eggs: "eggs", egg: "eggs",
  peanuts: "peanuts", peanut: "peanuts", "tree nuts": "tree nuts",
  shellfish: "shellfish", soy: "soy", wheat: "wheat/gluten",
  gluten: "wheat/gluten", sesame: "sesame", fish: "fish",
};

/** Fixed list for general_caution — everything else defaults to neutral */
const GENERAL_CAUTION_LIST = [
  "artificial flavoring", "artificial flavor", "artificial coloring", "artificial color",
  "artificial colour", "msg", "monosodium glutamate",
  "e621", "e627", "e631", "e635",
  "high fructose corn syrup", "high-fructose corn syrup",
  "added sugar", "added sugars",
];

// ────────────────────────────────────────────────────────────
// SHA-256 cache key
// ────────────────────────────────────────────────────────────

function imageCacheKey(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ────────────────────────────────────────────────────────────
// Profile-aware categorization (shared between cache and AI paths)
// ────────────────────────────────────────────────────────────

function categorize(
  normalizedRaw: string,
  profile: typeof usersTable.$inferSelect | null,
): {
  category: ScanIngredient["category"];
  severity: ScanIngredient["severity"];
  display_color: ScanIngredient["display_color"];
  reason?: string;
  matchedLabels: string[];
} {
  // Always compare lower-cased so AI-capitalised names match user profile entries
  const normalized = normalizedRaw.toLowerCase();

  const userAllergies = profile ? (profile.allergies as string[]).map((a) => a.toLowerCase()) : [];
  const toAvoid = profile ? (profile.ingredientsToAvoid as string[]).map((a) => a.toLowerCase()) : [];
  const toAllow = profile ? (profile.ingredientsToAllow as string[]).map((a) => a.toLowerCase()) : [];
  const dietPrefs = profile ? (profile.dietaryPreferences as string[]).map((d) => d.toLowerCase()) : [];

  const extraAvoids: string[] = [];
  if (dietPrefs.includes("vegan")) extraAvoids.push("carmine", "gelatin", "beeswax", "lanolin", "casein", "whey");
  if (dietPrefs.includes("vegetarian")) extraAvoids.push("gelatin", "carmine");
  if (dietPrefs.includes("halal")) extraAvoids.push("gelatin", "alcohol", "lard");

  const matchedLabels: string[] = [];

  // 1. Allergen
  for (const allergen of userAllergies) {
    if (normalized.includes(allergen) || allergen.includes(normalized)) {
      const label = ALLERGEN_LABELS[allergen] ?? allergen;
      matchedLabels.push(`your ${label} allergy`);
      return { category: "allergen_match", severity: "high", display_color: "red", reason: `You are allergic to ${label}`, matchedLabels };
    }
  }

  // 2. Avoid
  const allAvoids = [...toAvoid, ...extraAvoids];
  for (const avoid of allAvoids) {
    if (normalized.includes(avoid) || avoid.includes(normalized)) {
      let reason = `You prefer to avoid ${normalized}`;
      if (dietPrefs.includes("vegan") && extraAvoids.includes(avoid)) {
        reason = "Not suitable for vegans";
        matchedLabels.push("your vegan preference");
      } else if (dietPrefs.includes("vegetarian") && extraAvoids.includes(avoid)) {
        reason = "Not suitable for vegetarians";
        matchedLabels.push("your vegetarian preference");
      } else if (dietPrefs.includes("halal") && extraAvoids.includes(avoid)) {
        reason = "May not be halal-compliant";
        matchedLabels.push("your halal preference");
      } else {
        matchedLabels.push(`your preference to avoid ${avoid}`);
      }
      return { category: "avoid_match", severity: "medium", display_color: "red", reason, matchedLabels };
    }
  }

  // 3. Allow
  for (const allow of toAllow) {
    if (normalized.includes(allow) || allow.includes(normalized)) {
      matchedLabels.push(`your preference for ${allow}`);
      return { category: "allow_match", severity: "none", display_color: "green", reason: `Matches your preference for ${allow}`, matchedLabels };
    }
  }

  // 4. General caution (fixed approved list only)
  for (const caution of GENERAL_CAUTION_LIST) {
    if (normalized.includes(caution) || caution.includes(normalized)) {
      return { category: "general_caution", severity: "low", display_color: "amber", reason: `May be worth noting: ${normalized}`, matchedLabels };
    }
  }

  return { category: "neutral", severity: "none", display_color: "neutral", matchedLabels };
}

// ────────────────────────────────────────────────────────────
// Build full ScanResult from raw (cached) ingredients + profile
// ────────────────────────────────────────────────────────────

export function buildScanResultFromRaw(
  raw: RawIngredient[],
  profile: typeof usersTable.$inferSelect | null,
  productName: string | null,
  scanStatus: "success" | "partial" | "failed",
  source: "cache" | "ai_model",
): ScanResult {
  const dietPrefs = profile ? (profile.dietaryPreferences as string[]).map((d) => d.toLowerCase()) : [];
  const userAllergies = profile ? (profile.allergies as string[]).map((a) => a.toLowerCase()) : [];

  const allMatchedLabels = new Set<string>();
  const ingredients: ScanIngredient[] = [];

  for (const { name, normalized_name, plain_explanation } of raw) {
    const { category, severity, display_color, reason, matchedLabels } =
      categorize(normalized_name, profile);

    matchedLabels.forEach((l) => allMatchedLabels.add(l));

    // Fallback to static glossary if AI didn't provide an explanation
    const explanation = plain_explanation ?? lookupGlossary(normalized_name).definition;

    ingredients.push({
      name,
      normalized_name,
      category,
      severity,
      display_color,
      plain_explanation: explanation,
      ...(reason !== undefined ? { reason } : {}),
    });
  }

  // Sort: red → amber → green → neutral
  const colorOrder: Record<ScanIngredient["display_color"], number> = {
    red: 0, amber: 1, green: 2, neutral: 3,
  };
  ingredients.sort((a, b) => colorOrder[a.display_color] - colorOrder[b.display_color]);

  // Always add dietary prefs to matched labels
  if (dietPrefs.includes("vegan")) allMatchedLabels.add("your vegan preference");
  if (dietPrefs.includes("vegetarian")) allMatchedLabels.add("your vegetarian preference");
  if (dietPrefs.includes("halal")) allMatchedLabels.add("your halal preference");
  for (const allergen of userAllergies) {
    const label = ALLERGEN_LABELS[allergen] ?? allergen;
    allMatchedLabels.add(`your ${label} allergy`);
  }

  let overall_flag: ScanResult["summary"]["overall_flag"];
  let headline: string;

  if (scanStatus === "partial" || scanStatus === "failed") {
    overall_flag = "insufficient_data";
    headline = scanStatus === "failed"
      ? "We couldn't read this label. Try a clearer photo."
      : "We could only read part of this label — results may be incomplete.";
  } else if (ingredients.some((i) => i.category === "allergen_match")) {
    overall_flag = "allergen_warning";
    headline = "⚠️ This product contains allergens you need to avoid.";
  } else if (ingredients.some((i) => i.category === "avoid_match")) {
    overall_flag = "avoid_warning";
    headline = "This product contains ingredients you prefer to skip.";
  } else {
    overall_flag = "safe";
    headline = "Looks good for your profile.";
  }

  return {
    product_name: productName,
    scan_status: scanStatus,
    ingredients,
    summary: { overall_flag, headline, matched_user_preferences: Array.from(allMatchedLabels) },
    disclaimer: "Based on the ingredient data on file — always confirm against the physical product label.",
    source,
  };
}

// ────────────────────────────────────────────────────────────
// AI system prompt
// ────────────────────────────────────────────────────────────

function buildSystemPrompt(profile: typeof usersTable.$inferSelect | null): string {
  const allergies = profile ? (profile.allergies as string[]).join(", ") || "none" : "none";
  const avoid = profile ? (profile.ingredientsToAvoid as string[]).join(", ") || "none" : "none";
  const allow = profile ? (profile.ingredientsToAllow as string[]).join(", ") || "none" : "none";
  const diet = profile ? (profile.dietaryPreferences as string[]).join(", ") || "none" : "none";

  return `You are a product ingredient analyst. Analyze the label image provided and return ONLY a single JSON object — no markdown, no code fences, no extra text.

User profile to match against:
- Allergies: ${allergies}
- Ingredients to avoid: ${avoid}
- Ingredients to allow: ${allow}
- Dietary preferences: ${diet}

Return this exact JSON schema:
{
  "product_name": "string or null",
  "scan_status": "success | partial | failed",
  "ingredients": [
    {
      "name": "string exactly as it appears on the label",
      "normalized_name": "canonical decoded name (e.g. E621 → monosodium glutamate, Aqua → water)",
      "category": "allergen_match | avoid_match | allow_match | general_caution | neutral",
      "severity": "high | medium | low | none",
      "display_color": "red | green | amber | neutral",
      "plain_explanation": "a short, factual, non-judgmental description of what this ingredient is and its function — REQUIRED for every ingredient",
      "reason": "a short explanation of why flagged — ONLY present if category is not neutral"
    }
  ],
  "summary": {
    "overall_flag": "allergen_warning | avoid_warning | safe | insufficient_data",
    "headline": "string",
    "matched_user_preferences": ["array of strings"]
  },
  "disclaimer": "Based on the ingredient data on file — always confirm against the physical product label."
}

Rules you must follow exactly:
1. category general_caution is ONLY allowed for these specific ingredients: artificial flavoring, artificial coloring, MSG (monosodium glutamate) and E-numbers E621/E627/E631/E635, high-fructose corn syrup, added sugar. Anything else must be neutral.
2. plain_explanation must always be factual and neutral in tone — describe function, never imply danger unless the ingredient is genuinely allergen_match or avoid_match for THIS user's profile.
3. reason must ONLY be present when category is allergen_match, avoid_match, allow_match, or general_caution. Never add reason to neutral ingredients.
4. Decode all E-codes and scientific/chemical names in normalized_name and plain_explanation (e.g. E621 → monosodium glutamate, Aqua → water, Butyrospermum Parkii → shea butter).
5. If the label is unreadable or ingredients are cut off, set scan_status to partial or failed and summary.overall_flag to insufficient_data. Never guess missing ingredients.
6. display_color mapping: allergen_match or avoid_match → red; allow_match → green; general_caution → amber; neutral → neutral.
7. severity mapping: allergen_match → high; avoid_match → medium; general_caution → low; allow_match or neutral → none.`;
}

// ────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────

interface AiResponseIngredient {
  name: string;
  normalized_name: string;
  category: string;
  severity: string;
  display_color: string;
  plain_explanation: string;
  reason?: string;
}

interface AiResponse {
  product_name: string | null;
  scan_status: string;
  ingredients: AiResponseIngredient[];
  summary: {
    overall_flag: string;
    headline: string;
    matched_user_preferences: string[];
  };
  disclaimer: string;
}

function validateAiResponse(data: unknown): { valid: true; parsed: AiResponse } | { valid: false; reason: string } {
  if (typeof data !== "object" || data === null) return { valid: false, reason: "Not an object" };

  const d = data as Record<string, unknown>;

  if (!["success", "partial", "failed"].includes(d.scan_status as string)) {
    return { valid: false, reason: `Invalid scan_status: ${d.scan_status}` };
  }

  if (!Array.isArray(d.ingredients)) return { valid: false, reason: "Missing ingredients array" };

  for (const [i, ing] of (d.ingredients as unknown[]).entries()) {
    if (typeof ing !== "object" || ing === null) return { valid: false, reason: `Ingredient ${i} is not an object` };
    const item = ing as Record<string, unknown>;

    if (typeof item.name !== "string" || !item.name) return { valid: false, reason: `Ingredient ${i} missing name` };
    if (typeof item.normalized_name !== "string" || !item.normalized_name) return { valid: false, reason: `Ingredient ${i} missing normalized_name` };
    if (typeof item.plain_explanation !== "string" || !item.plain_explanation) return { valid: false, reason: `Ingredient ${i} missing plain_explanation` };

    const validCategories = ["allergen_match", "avoid_match", "allow_match", "general_caution", "neutral"];
    if (!validCategories.includes(item.category as string)) return { valid: false, reason: `Ingredient ${i} invalid category: ${item.category}` };

    // Non-neutral must have reason
    if (item.category !== "neutral" && (typeof item.reason !== "string" || !item.reason)) {
      return { valid: false, reason: `Ingredient ${i} (${item.category}) missing reason` };
    }

    // general_caution only for approved list
    if (item.category === "general_caution") {
      const normalized = (item.normalized_name as string).toLowerCase();
      const allowed = GENERAL_CAUTION_LIST.some((c) => normalized.includes(c) || c.includes(normalized));
      if (!allowed) {
        return { valid: false, reason: `Ingredient ${i} (${item.name}) assigned general_caution but is not on the approved list` };
      }
    }
  }

  if (typeof d.summary !== "object" || d.summary === null) return { valid: false, reason: "Missing summary" };
  const summary = d.summary as Record<string, unknown>;
  const validFlags = ["allergen_warning", "avoid_warning", "safe", "insufficient_data"];
  if (!validFlags.includes(summary.overall_flag as string)) return { valid: false, reason: `Invalid overall_flag: ${summary.overall_flag}` };

  return { valid: true, parsed: d as unknown as AiResponse };
}

// ────────────────────────────────────────────────────────────
// AI vision call
// ────────────────────────────────────────────────────────────

async function callAiVision(
  imageBuffer: Buffer,
  mimeType: string,
  profile: typeof usersTable.$inferSelect | null,
): Promise<AiResponse | null> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[scan] GEMINI_API_KEY not set");
    return null;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const b64 = imageBuffer.toString("base64");

  // Gemini accepts these image types inline
  const supportedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
  type SupportedMime = typeof supportedTypes[number];
  const resolvedMime: SupportedMime = supportedTypes.includes(mimeType as SupportedMime)
    ? (mimeType as SupportedMime)
    : "image/jpeg";

  const attempt = async (): Promise<AiResponse | null> => {
    const result = await model.generateContent({
      systemInstruction: buildSystemPrompt(profile),
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: resolvedMime, data: b64 } },
            { text: "Analyze this ingredient label and return the JSON result. Return ONLY the JSON object with no markdown or extra text." },
          ],
        },
      ],
    });

    const raw = result.response.text()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("[scan] AI returned non-JSON:", raw.slice(0, 200));
      return null;
    }

    const validation = validateAiResponse(parsed);
    if (!validation.valid) {
      console.warn("[scan] AI response failed validation:", validation.reason);
      return null;
    }

    return validation.parsed;
  };

  // First attempt
  const first = await attempt();
  if (first) return first;

  // Retry once on validation failure
  console.warn("[scan] Retrying AI call after validation failure…");
  return attempt();
}

// ────────────────────────────────────────────────────────────
// Main entry point — cache-first scan
// ────────────────────────────────────────────────────────────

export async function scanLabelImage(
  imageBuffer: Buffer,
  mimeType: string,
  profile: typeof usersTable.$inferSelect | null,
): Promise<ScanResult> {
  const cacheKey = imageCacheKey(imageBuffer);

  // ── Step 1: Cache lookup ──────────────────────────────────
  const [cached] = await db
    .select()
    .from(scannedProductsTable)
    .where(eq(scannedProductsTable.cacheKey, cacheKey))
    .limit(1);

  if (cached) {
    console.info(`[scan] Cache hit — source: cache (key: ${cacheKey.slice(0, 12)}…)`);
    return buildScanResultFromRaw(
      cached.rawIngredients,
      profile,
      cached.productName,
      cached.scanStatus as "success" | "partial" | "failed",
      "cache",
    );
  }

  // ── Step 2: AI vision call ────────────────────────────────
  console.info(`[scan] Cache miss — calling AI vision (key: ${cacheKey.slice(0, 12)}…)`);
  const aiResult = await callAiVision(imageBuffer, mimeType, profile);

  // ── Step 3: Handle AI failure ────────────────────────────
  if (!aiResult) {
    console.error("[scan] AI call failed after retry — returning failed result");
    return {
      product_name: null,
      scan_status: "failed",
      ingredients: [],
      summary: {
        overall_flag: "insufficient_data",
        headline: "We couldn't analyze this label. Please try again with a clearer photo.",
        matched_user_preferences: [],
      },
      disclaimer: "Based on the ingredient data on file — always confirm against the physical product label.",
      source: "ai_model",
    };
  }

  // ── Step 4: Save raw (user-agnostic) data to DB ──────────
  const rawIngredients: RawIngredient[] = aiResult.ingredients.map((ing) => ({
    name: ing.name,
    normalized_name: ing.normalized_name,
    plain_explanation: ing.plain_explanation ?? null,
  }));

  try {
    await db.insert(scannedProductsTable).values({
      cacheKey,
      productName: aiResult.product_name,
      rawIngredients,
      scanStatus: aiResult.scan_status as "success" | "partial" | "failed",
    });
    console.info(`[scan] Saved to DB: "${aiResult.product_name}" (${rawIngredients.length} ingredients)`);
  } catch (err) {
    console.error("[scan] Failed to save to DB:", err);
    // Non-fatal — still return the AI result
  }

  // ── Step 5: Build personalized result from AI response ───
  // Re-use the profile-matching logic so categorization is consistent
  // between the AI path and future cache hits.
  return buildScanResultFromRaw(
    rawIngredients,
    profile,
    aiResult.product_name,
    aiResult.scan_status as "success" | "partial" | "failed",
    "ai_model",
  );
}
