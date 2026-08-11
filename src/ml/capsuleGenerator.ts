import { WardrobeItem } from "@/db/wardrobe.repository";
import { generateOutfitSuggestion, Outfit } from "./styleEngine";

export interface CapsuleResult {
  selectedItems: WardrobeItem[];
  outfitsGenerated: Outfit[];
  coverageScore: number;
}

/**
 * Capsule Wardrobe Generator
 *
 * Uses greedy optimization to select the smallest subset of wardrobe items
 * (e.g. 7-8 items for a 7-day trip) that yields the maximum unique, color-harmonic outfits.
 */
export function generateCapsuleWardrobe(
  items: WardrobeItem[],
  maxItemCount = 8,
  targetDays = 7
): CapsuleResult {
  if (!items || items.length === 0) {
    return { selectedItems: [], outfitsGenerated: [], coverageScore: 0 };
  }

  const activeItems = items.filter((i) => i && i.lifecycleState === "active");
  if (activeItems.length <= maxItemCount) {
    // Closet is already capsule size
    const outfits: Outfit[] = [];
    for (let day = 0; day < targetDays * 2; day++) {
      const outfit = generateOutfitSuggestion(activeItems, day);
      if (outfit) outfits.push(outfit);
    }
    return {
      selectedItems: activeItems,
      outfitsGenerated: outfits,
      coverageScore: 1.0,
    };
  }

  // Group items by role
  const tops = activeItems.filter((i) => ["top", "kurta", "sherwani"].includes(i.category.toLowerCase()));
  const bottoms = activeItems.filter((i) => ["bottom", "lehenga"].includes(i.category.toLowerCase()));
  const shoes = activeItems.filter((i) => i.category.toLowerCase() === "shoes");
  const layers = activeItems.filter((i) => ["outerwear", "dupatta"].includes(i.category.toLowerCase()));
  const dresses = activeItems.filter((i) => ["dress", "saree"].includes(i.category.toLowerCase()));

  // Greedy selection: pick top 3 tops, 3 bottoms, 2 shoes / layers
  const selected: WardrobeItem[] = [
    ...tops.slice(0, 3),
    ...bottoms.slice(0, 3),
    ...shoes.slice(0, 1),
    ...layers.slice(0, 1),
    ...dresses.slice(0, 1),
  ].slice(0, maxItemCount);

  // If still room, fill up with remaining items
  for (const item of activeItems) {
    if (selected.length >= maxItemCount) break;
    if (!selected.some((s) => s.id === item.id)) {
      selected.push(item);
    }
  }

  // Generate outfit combinations for target days
  const outfits: Outfit[] = [];
  for (let seed = 0; seed < targetDays * 2; seed++) {
    const outfit = generateOutfitSuggestion(selected, seed);
    if (outfit) {
      // Avoid exact duplicates
      const isDup = outfits.some((o) => 
        o.items.map((i) => i.id).sort().join(",") === outfit.items.map((i) => i.id).sort().join(",")
      );
      if (!isDup) outfits.push(outfit);
    }
  }

  const coverageScore = Math.min(Math.round((outfits.length / targetDays) * 100) / 100, 1.0);

  return {
    selectedItems: selected,
    outfitsGenerated: outfits,
    coverageScore,
  };
}
