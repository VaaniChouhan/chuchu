import { WardrobeItem } from "@/db/wardrobe.repository";

export interface OutfitItem {
  id: number;
  category: string;
  imageUri: string;
  dominantColor?: string;
}

export interface Outfit {
  items: OutfitItem[];
  score: number;
  reasons: string[];
}

/**
 * Rule-based styling coordinator that selects garments, scores color-matching combinations,
 * and compiles explainable reasons. Can produce alternates by using a seed/offset index.
 */
export function generateOutfitSuggestion(items: WardrobeItem[], seed = 0): Outfit | null {
  if (items.length === 0) return null;

  // Filter active items
  const activeItems = items.filter((i) => i.lifecycleState === "active");
  if (activeItems.length === 0) return null;

  // Group items by category
  const categories: Record<string, WardrobeItem[]> = {};
  for (const item of activeItems) {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  }

  const tops = categories["top"] || [];
  const bottoms = categories["bottom"] || [];
  const dresses = categories["dress"] || [];
  const outers = categories["outerwear"] || [];
  const shoes = categories["shoes"] || [];

  const outfitsPool: Outfit[] = [];

  // Outfit Type 1: Top + Bottom + optional Shoes
  if (tops.length > 0 && bottoms.length > 0) {
    for (let tIdx = 0; tIdx < tops.length; tIdx++) {
      for (let bIdx = 0; bIdx < bottoms.length; bIdx++) {
        const top = tops[tIdx];
        const bottom = bottoms[bIdx];
        const comboItems = [top, bottom];

        // Add matching shoes if available
        if (shoes.length > 0) {
          comboItems.push(shoes[(tIdx + bIdx) % shoes.length]);
        }

        // Add matching outerwear if available
        if (outers.length > 0 && (tIdx + bIdx) % 3 === 0) {
          comboItems.push(outers[(tIdx + bIdx) % outers.length]);
        }

        const score = calculateOutfitScore(comboItems, seed);
        outfitsPool.push({
          items: comboItems.map((item) => ({
            id: item.id,
            category: item.category,
            imageUri: item.imageUri,
            dominantColor: item.dominantColor,
          })),
          score,
          reasons: generateReasons(comboItems),
        });
      }
    }
  }

  // Outfit Type 2: Dress + optional Shoes
  if (dresses.length > 0) {
    for (let dIdx = 0; dIdx < dresses.length; dIdx++) {
      const dress = dresses[dIdx];
      const comboItems = [dress];

      if (shoes.length > 0) {
        comboItems.push(shoes[dIdx % shoes.length]);
      }

      if (outers.length > 0 && dIdx % 2 === 0) {
        comboItems.push(outers[dIdx % outers.length]);
      }

      const score = calculateOutfitScore(comboItems, seed + 1);
      outfitsPool.push({
        items: comboItems.map((item) => ({
          id: item.id,
          category: item.category,
          imageUri: item.imageUri,
          dominantColor: item.dominantColor,
        })),
        score,
        reasons: generateReasons(comboItems),
      });
    }
  }

  if (outfitsPool.length === 0) {
    // Fallback: just return a slice of any items
    const fallbackItems = activeItems.slice(0, 3);
    return {
      items: fallbackItems.map((item) => ({
        id: item.id,
        category: item.category,
        imageUri: item.imageUri,
        dominantColor: item.dominantColor,
      })),
      score: 0.72,
      reasons: ["Core pieces from your closet", "Ready to style"],
    };
  }

  // Sort by score descending and return index corresponding to the seed offset
  outfitsPool.sort((a, b) => b.score - a.score);
  return outfitsPool[seed % outfitsPool.length];
}

function calculateOutfitScore(items: WardrobeItem[], seed: number): number {
  // Base score
  let score = 0.75 + (seed % 10) * 0.02;

  // Rule 1: Pattern mixing rule (avoid striped + floral etc.)
  const patterns = items.map((i) => i.pattern);
  const distinctPatterns = new Set(patterns);
  if (distinctPatterns.size > 1 && !distinctPatterns.has("solid")) {
    score -= 0.1; // Mix patterns penalty
  }

  // Rule 2: Color compatibility checks (simple mock rule)
  const colors = items.map((i) => i.dominantColor);
  if (colors.includes("#4A3226") && colors.includes("#FAF1E4")) {
    score += 0.08; // Brown + Cream bonus
  }

  // Clamp score
  return Math.min(Math.max(score, 0.5), 0.98);
}

function generateReasons(items: WardrobeItem[]): string[] {
  const reasons = ["Matches your undertone"];
  
  // Weather logic mock
  const date = new Date();
  const month = date.getMonth();
  const isSummer = month >= 4 && month <= 8;

  const categories = items.map((i) => i.category);
  if (isSummer) {
    if (categories.includes("dress") || (!categories.includes("outerwear"))) {
      reasons.push("Perfect for a warm day");
    }
  } else {
    if (categories.includes("outerwear")) {
      reasons.push("Layered for comfort");
    }
  }

  // Recency mock
  reasons.push("Garments are fresh/rested");

  return reasons;
}
