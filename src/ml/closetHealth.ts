import { WardrobeItem } from "@/db/wardrobe.repository";

export interface ClosetHealth {
  overall: number; // 0-1
  completeness: number;
  colorDiversity: number;
  seasonalBalance: number;
}

export function computeClosetHealth(items: WardrobeItem[]): ClosetHealth {
  if (items.length === 0) {
    return { overall: 0, completeness: 0, colorDiversity: 0, seasonalBalance: 0 };
  }

  // Active items only
  const activeItems = items.filter((i) => i.lifecycleState === "active");
  if (activeItems.length === 0) {
    return { overall: 0, completeness: 0, colorDiversity: 0, seasonalBalance: 0 };
  }

  // 1. Completeness: targets having at least 5 core categories
  const categories = new Set(activeItems.map((i) => i.category));
  const completeness = Math.min(categories.size / 5, 1);

  // 2. Color Diversity: targets having at least 6 distinct color groups
  const colors = new Set(activeItems.map((i) => i.dominantColor));
  const colorDiversity = Math.min(colors.size / 6, 1);

  // 3. Seasonal Balance: placeholder heuristic
  const seasonalBalance = 0.75;

  const overall = completeness * 0.4 + colorDiversity * 0.3 + seasonalBalance * 0.3;

  return {
    overall,
    completeness,
    colorDiversity,
    seasonalBalance,
  };
}
