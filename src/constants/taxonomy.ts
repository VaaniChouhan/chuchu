/**
 * ChuChu Taxonomy Constants & Enums
 * Unified taxonomy defining garment categories, patterns, functional roles, and display labels.
 * Supports both Western and Ethnic Wear.
 */

export const CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "accessory",
  "kurta",
  "saree",
  "lehenga",
  "dupatta",
  "sherwani",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PATTERNS = [
  "solid",
  "striped",
  "floral",
  "plaid",
  "graphic",
  "textured",
  "embroidered",
  "zari",
  "block-print",
] as const;

export type Pattern = (typeof PATTERNS)[number];

export const CATEGORY_GROUPS = {
  western: ["top", "bottom", "dress", "outerwear", "shoes", "accessory"],
  ethnic: ["kurta", "saree", "lehenga", "dupatta", "sherwani"],
} as const;

export const CATEGORY_ROLE_MAP: Record<string, "upper" | "lower" | "full" | "layer" | "footwear" | "accessory"> = {
  top: "upper",
  kurta: "upper",
  sherwani: "upper",
  bottom: "lower",
  lehenga: "lower",
  dress: "full",
  saree: "full",
  outerwear: "layer",
  dupatta: "layer",
  shoes: "footwear",
  accessory: "accessory",
};

export function getCategoryRole(category: string): string {
  const cat = (category || "").toLowerCase();
  return CATEGORY_ROLE_MAP[cat] || "upper";
}

export function isEthnicCategory(category: string): boolean {
  const cat = (category || "").toLowerCase();
  return CATEGORY_GROUPS.ethnic.includes(cat as any);
}
