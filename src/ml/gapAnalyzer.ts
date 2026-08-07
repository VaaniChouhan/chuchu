import { WardrobeItem } from "@/db/wardrobe.repository";

export interface WardrobeGap {
  id: string;
  category: string;
  advice: string;
  newOutfitsCount: number;
}

/**
 * Diagnostic logic checking wardrobe composition and reporting category deficiency gaps across Western and Ethnic wear.
 */
export function analyzeWardrobeGaps(items: WardrobeItem[]): WardrobeGap[] {
  if (!items || items.length === 0) {
    return [
      {
        id: "gap_starter",
        category: "top",
        advice: "Start by adding your favorite tops or kurtas to unlock personalized AI outfit recommendations!",
        newOutfitsCount: 5,
      },
    ];
  }

  const activeItems = items.filter((i) => i && i.lifecycleState === "active");

  // Count items by category family
  const counts: Record<string, number> = {
    top: 0,
    bottom: 0,
    dress: 0,
    outerwear: 0,
    shoes: 0,
    kurta: 0,
    saree: 0,
    lehenga: 0,
    dupatta: 0,
    sherwani: 0,
  };

  for (const item of activeItems) {
    const cat = item.category?.toLowerCase() ?? "";
    if (cat in counts) {
      counts[cat]++;
    }
  }

  const totalTops = counts.top + counts.kurta + counts.sherwani;
  const totalBottoms = counts.bottom + counts.lehenga;
  const totalLayers = counts.outerwear + counts.dupatta;

  const gaps: WardrobeGap[] = [];

  // Gap 1: Layer / Outerwear check
  if (totalLayers < 2) {
    const potentialNew = Math.max(6, Math.max(1, totalTops) * Math.max(1, totalBottoms));
    gaps.push({
      id: "gap_outerwear",
      category: counts.kurta > 0 ? "dupatta" : "outerwear",
      advice: counts.kurta > 0
        ? `You have limited layering pieces. Adding a versatile dupatta or jacket will unlock ${potentialNew} new ethnic & fusion combinations!`
        : `You currently have only ${totalLayers} layer/outerwear item(s). Adding a jacket or cardigan will open up ${potentialNew} new daily styling formulas!`,
      newOutfitsCount: potentialNew,
    });
  }

  // Gap 2: Top / Bottom ratio check
  if (totalTops < totalBottoms * 2 && totalBottoms > 0) {
    const potentialNew = totalBottoms * 3;
    gaps.push({
      id: "gap_tops",
      category: "top",
      advice: `Your upper-to-lower garment ratio is low. Adding another top or kurta will maximize the versatility of the bottoms you already own, creating at least ${potentialNew} new outfits.`,
      newOutfitsCount: potentialNew,
    });
  }

  // Gap 3: Shoes count check
  if (counts.shoes < 2) {
    const potentialNew = Math.max(4, Math.max(1, totalTops) * Math.max(1, totalBottoms));
    gaps.push({
      id: "gap_shoes",
      category: "shoes",
      advice: `You have only ${counts.shoes} pair(s) of shoes. Adding a versatile pair of everyday sneakers, juttis, or flats will instantly refresh your outfit formulas.`,
      newOutfitsCount: potentialNew,
    });
  }

  // Gap 4: Ethnic wear balance check (if user has kurtas but no dupattas)
  if (counts.kurta > 0 && counts.dupatta === 0) {
    gaps.push({
      id: "gap_dupatta",
      category: "dupatta",
      advice: `You have ${counts.kurta} kurta(s) but no dupatta. A solid or zari dupatta will complete traditional and festive looks effortlessly.`,
      newOutfitsCount: counts.kurta * 2,
    });
  }

  // Fallback gap if closet is small or well-balanced
  if (gaps.length === 0) {
    gaps.push({
      id: "gap_dress",
      category: "dress",
      advice: "Adding a multipurpose statement dress or saree would make style coordination fast and effortless for formal days.",
      newOutfitsCount: 8,
    });
  }

  return gaps;
}
