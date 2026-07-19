import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, usersTable } from "@workspace/db";
import { SearchProductsQueryParams, GetProductParams, AnalyzeProductParams } from "@workspace/api-zod";
import { eq, ilike, or } from "drizzle-orm";

const router = Router();

const ALLERGEN_MAP: Record<string, string> = {
  milk: "Contains milk/dairy",
  eggs: "Contains eggs",
  peanuts: "Contains peanuts",
  "tree nuts": "Contains tree nuts",
  shellfish: "Contains shellfish",
  soy: "Contains soy",
  wheat: "Contains wheat/gluten",
  sesame: "Contains sesame",
  fish: "Contains fish",
};

const DIETARY_CHECKS: Record<string, { keywords: string[]; reason: string }> = {
  vegan: { keywords: ["milk", "dairy", "whey", "casein", "egg", "honey", "gelatin", "lanolin"], reason: "Not suitable for vegans" },
  vegetarian: { keywords: ["gelatin", "lard", "rennet", "carmine", "isinglass"], reason: "Not suitable for vegetarians" },
  halal: { keywords: ["pork", "lard", "gelatin", "alcohol", "wine", "beer"], reason: "May not be halal-compliant" },
};

function analyzeAgainstProfile(
  product: typeof productsTable.$inferSelect,
  profile: typeof usersTable.$inferSelect | null,
) {
  const ingredients = (product.ingredients as string[]).map((i) => i.toLowerCase());
  const warnings: { ingredient: string; reason: string; severity: "high" | "medium" | "low" }[] = [];
  const tags: { label: string; type: "positive" | "neutral" | "warning" }[] = [];

  if (profile) {
    // Check allergies
    const userAllergies = (profile.allergies as string[]).map((a) => a.toLowerCase());
    for (const allergen of userAllergies) {
      const hit = ingredients.find((ing) => ing.includes(allergen));
      if (hit) {
        warnings.push({
          ingredient: hit,
          reason: ALLERGEN_MAP[allergen] ?? `Contains ${allergen}`,
          severity: "high",
        });
      }
    }

    // Check dietary preferences
    const userDiet = (profile.dietaryPreferences as string[]).map((d) => d.toLowerCase());
    for (const diet of userDiet) {
      const check = DIETARY_CHECKS[diet];
      if (check) {
        const hit = ingredients.find((ing) => check.keywords.some((kw) => ing.includes(kw)));
        if (hit) {
          warnings.push({ ingredient: hit, reason: check.reason, severity: "medium" });
        }
      }
    }

    // Check ingredients to avoid
    const toAvoid = (profile.ingredientsToAvoid as string[]).map((a) => a.toLowerCase());
    for (const avoid of toAvoid) {
      const hit = ingredients.find((ing) => ing.includes(avoid));
      if (hit) {
        warnings.push({ ingredient: hit, reason: `You prefer to avoid ${avoid}`, severity: "low" });
      }
    }

    // Positive tags for ingredients to allow
    const toAllow = (profile.ingredientsToAllow as string[]).map((a) => a.toLowerCase());
    for (const allow of toAllow) {
      const hit = ingredients.find((ing) => ing.includes(allow));
      if (hit) {
        tags.push({ label: `Contains ${allow}`, type: "positive" });
      }
    }
  }

  // Add static product tags
  const productTags = product.tags as string[];
  for (const tag of productTags) {
    if (!tags.find((t) => t.label.toLowerCase() === tag.toLowerCase())) {
      tags.push({ label: tag, type: "neutral" });
    }
  }

  // Check fragrance
  if (ingredients.some((i) => i.includes("fragrance") || i.includes("parfum"))) {
    tags.push({ label: "Contains Fragrance", type: "warning" });
  }

  return {
    product: {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl,
      ingredients: product.ingredients as string[],
      tags: product.tags as string[],
    },
    isSafe: warnings.filter((w) => w.severity === "high").length === 0,
    warnings,
    tags,
  };
}

// GET /api/products/search
router.get("/products/search", async (req, res) => {
  const parsed = SearchProductsQueryParams.safeParse(req.query);
  const q = parsed.success && parsed.data.q ? parsed.data.q : "";

  let results;
  if (q) {
    results = await db
      .select()
      .from(productsTable)
      .where(
        or(
          ilike(productsTable.name, `%${q}%`),
          ilike(productsTable.brand, `%${q}%`),
          ilike(productsTable.category, `%${q}%`),
        ),
      )
      .limit(20);
  } else {
    results = await db.select().from(productsTable).limit(20);
  }

  res.json(
    results.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      imageUrl: p.imageUrl,
      ingredients: p.ingredients as string[],
      tags: p.tags as string[],
    })),
  );
});

// GET /api/products/:productId
router.get("/products/:productId", async (req, res) => {
  const parsed = GetProductParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  const { productId } = parsed.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    imageUrl: product.imageUrl,
    ingredients: product.ingredients as string[],
    tags: product.tags as string[],
  });
});

// GET /api/products/:productId/analyze
router.get("/products/:productId/analyze", async (req, res) => {
  const parsed = AnalyzeProductParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }
  const { productId } = parsed.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  let profile = null;
  if (req.session.userId) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    profile = user ?? null;
  }

  res.json(analyzeAgainstProfile(product, profile));
});

export default router;
