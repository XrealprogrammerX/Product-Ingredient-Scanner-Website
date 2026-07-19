import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

/**
 * Raw ingredient data extracted by the AI — shared across users.
 * User-specific categorization (allergen/avoid/allow) is computed at read time.
 */
export interface RawIngredient {
  name: string;            // as it appears on the label
  normalized_name: string; // canonical / decoded name
  plain_explanation: string | null; // factual description from AI
}

export const scannedProductsTable = pgTable("scanned_products", {
  /** SHA-256 hex of the uploaded image bytes — stable cache key */
  cacheKey: text("cache_key").primaryKey(),
  productName: text("product_name"),
  rawIngredients: jsonb("raw_ingredients").$type<RawIngredient[]>().notNull().default([]),
  scanStatus: text("scan_status", { enum: ["success", "partial", "failed"] })
    .notNull()
    .default("partial"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ScannedProduct = typeof scannedProductsTable.$inferSelect;
