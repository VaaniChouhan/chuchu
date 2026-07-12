import { WardrobeItem } from "@/db/wardrobe.repository";

export interface WardrobeGap {
  id: string;
  category: string;
  advice: string;
  newOutfitsCount: number;
}

/**
 * Diagnostic logic checking wardrobe composition and reporting category deficiency gaps.
 */
export function analyzeWardrobeGaps(items: WardrobeItem[]): WardrobeGap[] {
  const activeItems = items.filter((i) => i.lifecycleState === "active");
  
  // Count items by category
  const counts: Record<string, number> = {
    top: 0,
    bottom: 0,
    dress: 0,
    outerwear: 0,
    shoes: 0,
  };

  for (const item of activeItems) {
    const cat = item.category.toLowerCase();
    if (cat in counts) {
      counts[cat]++;
    }
  }

  const gaps: WardrobeGap[] = [];

  // Gap 1: Outerwear count check
  if (counts.outerwear < 2) {
    const potentialNew = Math.max(counts.top * counts.bottom, 6);
    gaps.push({
      id: "gap_outerwear",
      category: "outerwear",
      advice: `You currently have only ${counts.outerwear} outerwear item(s). Adding a light outerwear layer or jacket will open up around ${potentialNew} new daily styling combinations!`,
      newOutfitsCount: potentialNew,
    });
  }

  // Gap 2: Top / Bottom ratio check
  if (counts.top < counts.bottom * 2) {
    const potentialNew = counts.bottom * 3;
    gaps.push({
      id: "gap_tops",
      category: "top",
      advice: `Your tops-to-bottoms ratio is low. Adding another top will maximize the styling versatility of the bottoms you already own, creating at least ${potentialNew} new outfits.`,
      newOutfitsCount: potentialNew,
    });
  }

  // Gap 3: Shoes count check
  if (counts.shoes < 2) {
    const potentialNew = counts.top * counts.bottom;
    gaps.push({
      id: "gap_shoes",
      category: "shoes",
      advice: `You only have ${counts.shoes} pair of shoes. Adding a versatile pair of everyday sneakers or flats will instantly refresh all of your existing outfit formulas.`,
      newOutfitsCount: potentialNew,
    });
  }

  // Fallback gap if closet is very small or well-balanced
  if (gaps.length === 0) {
    gaps.push({
      id: "gap_dress",
      category: "dress",
      advice: "Adding a multipurpose statement dress would make style coordination fast and effortless for formal days.",
      newOutfitsCount: 8,
    });
  }

  return gaps;
}
