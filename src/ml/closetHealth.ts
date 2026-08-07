import { WardrobeItem } from "@/db/wardrobe.repository";
import { hexToRgb, rgbToHsl } from "@/utils/imageProcessing";

export interface ClosetHealth {
  overall: number; // 0-1
  completeness: number;
  colorDiversity: number;
  seasonalBalance: number;
}

// Group taxonomy into functional outfit roles
const CATEGORY_ROLE_MAP: Record<string, string> = {
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

export function computeClosetHealth(items: WardrobeItem[]): ClosetHealth {
  if (!items || items.length === 0) {
    return { overall: 0, completeness: 0, colorDiversity: 0, seasonalBalance: 0 };
  }

  // Active items only
  const activeItems = items.filter((i) => i && i.lifecycleState === "active");
  if (activeItems.length === 0) {
    return { overall: 0, completeness: 0, colorDiversity: 0, seasonalBalance: 0 };
  }

  // 1. Completeness: targets having at least 4 core functional roles represented (upper, lower/full, footwear, layer)
  const roles = new Set(activeItems.map((i) => CATEGORY_ROLE_MAP[i.category.toLowerCase()] || "other"));
  const completeness = Math.min(roles.size / 4, 1);

  // 2. Color Diversity: cluster colors by HSL hue buckets (12 hue buckets around color wheel + 1 neutral bucket)
  const hueBuckets = new Set<string>();
  for (const item of activeItems) {
    if (!item.dominantColor) continue;
    const hsl = rgbToHsl(hexToRgb(item.dominantColor));
    if (hsl.s < 18 || hsl.l > 88 || hsl.l < 15) {
      hueBuckets.add("neutral");
    } else {
      const bucket = Math.floor(hsl.h / 30); // 12 hue segments
      hueBuckets.add(`hue_${bucket}`);
    }
  }
  // Target: at least 4 distinct hue/neutral buckets
  const colorDiversity = Math.min(hueBuckets.size / 4, 1);

  // 3. Seasonal Balance: dynamic calculation based on presence of layers/warm vs light pieces
  const layerCount = activeItems.filter((i) => {
    const role = CATEGORY_ROLE_MAP[i.category.toLowerCase()];
    return role === "layer" || i.category.toLowerCase() === "outerwear";
  }).length;
  
  const baseRatio = activeItems.length > 0 ? layerCount / activeItems.length : 0;
  // Ideal layer ratio is between 15% and 40% of closet
  const seasonalBalance = baseRatio >= 0.15 && baseRatio <= 0.4 ? 0.90 : 0.70;

  const overall = completeness * 0.4 + colorDiversity * 0.35 + seasonalBalance * 0.25;

  return {
    overall: Math.round(overall * 100) / 100,
    completeness: Math.round(completeness * 100) / 100,
    colorDiversity: Math.round(colorDiversity * 100) / 100,
    seasonalBalance: Math.round(seasonalBalance * 100) / 100,
  };
}
