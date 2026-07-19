/**
 * Module-level shared state for a scan in progress.
 * Lives for the lifetime of the SPA session (no serialization needed).
 */

export interface ScanIngredient {
  name: string;
  normalized_name: string;
  category: "allergen_match" | "avoid_match" | "allow_match" | "general_caution" | "neutral";
  severity: "high" | "medium" | "low" | "none";
  display_color: "red" | "green" | "amber" | "neutral";
  /** Factual, neutral description of what this ingredient is and does. Always present. */
  plain_explanation: string | null;
  /** Only present when category is not neutral */
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
  /** Whether this result came from the cache or a live AI model call */
  source: "cache" | "ai_model";
}

export interface ScanState {
  file: File | null;
  imageUrl: string | null; // object URL — valid for this browser session
  result: ScanResult | null;
}

export const scanState: ScanState = {
  file: null,
  imageUrl: null,
  result: null,
};

export function clearScanState() {
  if (scanState.imageUrl) {
    URL.revokeObjectURL(scanState.imageUrl);
  }
  scanState.file = null;
  scanState.imageUrl = null;
  scanState.result = null;
}
