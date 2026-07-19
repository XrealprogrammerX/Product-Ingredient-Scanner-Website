/**
 * Fixed, vetted ingredient glossary.
 * Definitions come from this table only — never generated at runtime.
 * Keys are lower-case canonical names.
 */
export const INGREDIENT_GLOSSARY: Record<string, string> = {
  // Water / base
  "water": "The universal solvent; used as a base in nearly all formulations.",
  "aqua": "The universal solvent; used as a base in nearly all formulations.",

  // Humectants / emollients
  "glycerin": "A humectant derived from plant or animal fats that draws moisture into the skin.",
  "propylene glycol": "A humectant and solvent; generally safe at low concentrations but may cause sensitivity in some individuals.",
  "hyaluronic acid": "A naturally occurring polysaccharide that retains up to 1000× its weight in water; widely used for hydration.",
  "shea butter": "A rich, plant-derived fat from the shea tree; widely used in cosmetics for deep moisturizing.",
  "butyrospermum parkii": "The INCI name for shea butter; a rich plant-derived moisturizer.",
  "cetearyl alcohol": "A fatty alcohol derived from plant or petroleum sources; used as an emulsifier and thickener. Not the same as drying alcohol.",
  "dimethicone": "A silicone polymer that smooths skin texture; effective but not readily biodegradable.",
  "stearic acid": "A saturated fatty acid from plant or animal fats; used as an emulsifier and stabilizer.",
  "sunflower oil": "A mild plant-derived oil rich in vitamin E and linoleic acid.",
  "canola oil": "A refined vegetable oil low in saturated fat; derived from rapeseed.",
  "palm oil": "A saturated fat widely used in food processing; associated with deforestation concerns.",

  // Preservatives
  "sodium benzoate": "A common preservative that inhibits mold and bacteria growth; may cause sensitivity in some people.",
  "potassium sorbate": "A mild preservative used to inhibit yeast and mold; generally regarded as safe.",
  "methylparaben": "A widely used paraben preservative; considered safe at low concentrations but flagged by some health advocates due to potential endocrine activity.",
  "propylparaben": "A paraben preservative; more lipophilic than methylparaben and under similar scrutiny.",
  "phenoxyethanol": "A preservative used as an alternative to parabens; generally safe at low concentrations.",

  // Antioxidants / vitamins
  "tocopherol": "Vitamin E; a fat-soluble antioxidant that helps extend shelf life and supports skin health.",
  "ascorbic acid": "Vitamin C; an antioxidant used as a preservative and nutritional supplement.",
  "mixed tocopherols": "A blend of vitamin E compounds used as a natural antioxidant to extend shelf life.",
  "retinol": "A form of vitamin A used in skincare for anti-aging; can cause irritation and should be avoided during pregnancy.",
  "niacinamide": "A form of vitamin B3; used in skincare to improve skin texture, reduce redness, and minimize pores.",

  // Acids / pH adjusters
  "citric acid": "A natural preservative and flavoring derived from citrus fruit. Also used to adjust pH.",
  "lactic acid": "An alpha-hydroxy acid (AHA) that exfoliates skin and helps retain moisture.",
  "salicylic acid": "A beta-hydroxy acid (BHA) used to exfoliate skin and treat acne; can cause irritation at high concentrations.",

  // Surfactants / cleansers
  "sodium lauryl sulfate": "A surfactant and foaming agent; can irritate skin and strip natural oils at high concentrations.",
  "sodium laureth sulfate": "A milder sulfate surfactant than SLS; still may irritate sensitive skin.",

  // Fragrances / dyes
  "fragrance": "A regulatory catch-all term for undisclosed scent compounds; can contain dozens of unlisted chemicals and is a leading cause of cosmetic allergic reactions.",
  "parfum": "The EU term for fragrance; a single ingredient declaration that may contain hundreds of undisclosed chemical compounds.",
  "carmine": "A vivid red dye derived from cochineal insects; not suitable for vegans or vegetarians.",

  // Allergens
  "soy lecithin": "An emulsifier derived from soybeans; contains trace soy proteins and is a recognized allergen for soy-sensitive individuals.",
  "peanut oil": "Oil derived from peanuts; a high-severity allergen for peanut-sensitive individuals.",
  "arachis oil": "The INCI/scientific name for peanut oil; a high-severity allergen for peanut-sensitive individuals.",
  "milk": "A dairy product; a recognized allergen for lactose-intolerant and milk-allergic individuals.",
  "whey": "A dairy byproduct high in protein; contains milk allergens.",
  "casein": "A milk protein used as a binder; triggers reactions in dairy-allergic individuals.",
  "egg": "A common food allergen; also used as an emulsifier.",
  "wheat": "A cereal grain containing gluten; a recognized allergen and problematic for those with celiac disease.",
  "gluten": "A protein found in wheat, barley, and rye; triggers immune responses in celiac and gluten-sensitive individuals.",
  "sesame": "A seed with increasing prevalence of allergic reactions; classified as a major allergen.",
  "tree nuts": "A category including almond, cashew, walnut, and others; associated with high allergenicity.",
  "shellfish": "Crustaceans and mollusks; one of the most common and severe food allergens.",
  "fish": "A common food allergen; proteins remain allergenic even after cooking.",

  // Animal-derived
  "gelatin": "A protein derived from animal collagen (usually pork or beef); not suitable for vegans or vegetarians.",
  "beeswax": "A natural wax produced by honey bees; used as a thickener. Not vegan.",
  "lanolin": "A waxy substance derived from sheep wool; used as a moisturizer. Not vegan.",

  // Emulsifiers / stabilizers
  "xanthan gum": "A polysaccharide used as a thickener and stabilizer; generally regarded as safe.",
  "carrageenan": "A thickener derived from red seaweed; some evidence suggests it may promote inflammation at high doses.",
  "maltodextrin": "A processed starch used as a filler or thickener; has a high glycemic index.",

  // Sweeteners / food
  "high fructose corn syrup": "A sweetener derived from corn starch; associated with metabolic health concerns at high consumption.",
  "organic brown rice syrup": "A natural sweetener derived from brown rice; generally considered a cleaner alternative to refined sugars.",
  "natural flavors": "A broad regulatory term covering hundreds of possible compounds; exact contents are not required to be disclosed.",
  "oats": "A whole grain; naturally gluten-free but often cross-contaminated with wheat during processing.",
  "sea salt": "Unrefined salt from seawater; contains trace minerals.",

  // UV filters
  "titanium dioxide": "A mineral UV filter and white pigment; considered safe in non-nano form for topical use.",
  "zinc oxide": "A mineral UV filter with broad-spectrum UV protection; also has soothing and anti-inflammatory properties.",

  // Other
  "sodium chloride": "Common table salt; used as a preservative or texture agent.",
  "alcohol": "Ethanol used as a solvent and preservative; can be drying to skin at high concentrations.",
};

/** Returns the glossary entry for an ingredient name, trying exact and normalized lookups. */
export function lookupGlossary(name: string): { known: boolean; definition: string | null } {
  const key = name.toLowerCase().trim();
  if (INGREDIENT_GLOSSARY[key]) {
    return { known: true, definition: INGREDIENT_GLOSSARY[key] };
  }
  // Partial match: find a glossary key contained in the name or vice versa
  for (const [glossaryKey, definition] of Object.entries(INGREDIENT_GLOSSARY)) {
    if (key.includes(glossaryKey) || glossaryKey.includes(key)) {
      return { known: true, definition };
    }
  }
  return { known: false, definition: null };
}
