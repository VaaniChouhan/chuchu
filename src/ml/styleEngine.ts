import { WardrobeItem } from "@/db/wardrobe.repository";
import { evaluateColorHarmony, hexToRgb, rgbToHsl } from "@/utils/imageProcessing";
import { WeatherContext } from "@/services/weather";

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
 * Rule-based & ML styling coordinator that selects garments, scores color-harmonic combinations,
 * supports both Western and Ethnic wear, and compiles explainable reasons.
 */
export function generateOutfitSuggestion(items: WardrobeItem[], seed = 0, weather?: WeatherContext): Outfit | null {
  if (!items || items.length === 0) return null;

  // Filter active items
  const activeItems = items.filter((i) => i && i.lifecycleState === "active");
  if (activeItems.length === 0) return null;

  // Group items by category family
  const categories: Record<string, WardrobeItem[]> = {};
  for (const item of activeItems) {
    const cat = item.category.toLowerCase();
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(item);
  }

  // Pruning candidate selection (max 5 items per category to avoid combinatorial lag, favoring least worn)
  const getCandidates = (catItems: WardrobeItem[] = []) => 
    [...catItems].sort((a, b) => {
      const aWorn = a.lastWornAt || 0;
      const bWorn = b.lastWornAt || 0;
      if (aWorn !== bWorn) return aWorn - bWorn;
      return (a.wearCount || 0) - (b.wearCount || 0);
    }).slice(0, 5);

  const tops = getCandidates(categories["top"]);
  const bottoms = getCandidates(categories["bottom"]);
  const dresses = getCandidates(categories["dress"]);
  const outers = getCandidates(categories["outerwear"]);
  const shoes = getCandidates(categories["shoes"]);
  const kurtas = getCandidates(categories["kurta"]);
  const sarees = getCandidates(categories["saree"]);
  const lehengas = getCandidates(categories["lehenga"]);
  const dupattas = getCandidates(categories["dupatta"]);

  const outfitsPool: Outfit[] = [];

  // Outfit Type 1: Western Top + Bottom + optional Shoes / Outerwear
  if (tops.length > 0 && bottoms.length > 0) {
    for (let tIdx = 0; tIdx < tops.length; tIdx++) {
      for (let bIdx = 0; bIdx < bottoms.length; bIdx++) {
        const comboItems = [tops[tIdx], bottoms[bIdx]];
        if (shoes.length > 0) {
          comboItems.push(shoes[(tIdx + bIdx + seed) % shoes.length]);
        }
        if (outers.length > 0 && (tIdx + bIdx + seed) % 2 === 0) {
          comboItems.push(outers[(tIdx + bIdx) % outers.length]);
        }
        outfitsPool.push(buildOutfit(comboItems, seed, weather));
      }
    }
  }

  // Outfit Type 2: Kurta + Bottom/Lehenga + optional Dupatta / Shoes
  if (kurtas.length > 0) {
    const lowerItems = bottoms.length > 0 ? bottoms : lehengas;
    for (let kIdx = 0; kIdx < kurtas.length; kIdx++) {
      if (lowerItems.length > 0) {
        for (let lIdx = 0; lIdx < lowerItems.length; lIdx++) {
          const comboItems = [kurtas[kIdx], lowerItems[lIdx]];
          if (dupattas.length > 0) {
            comboItems.push(dupattas[(kIdx + lIdx) % dupattas.length]);
          }
          if (shoes.length > 0) {
            comboItems.push(shoes[(kIdx + lIdx + seed) % shoes.length]);
          }
          outfitsPool.push(buildOutfit(comboItems, seed + 2, weather));
        }
      } else {
        const comboItems = [kurtas[kIdx]];
        if (dupattas.length > 0) comboItems.push(dupattas[kIdx % dupattas.length]);
        if (shoes.length > 0) comboItems.push(shoes[kIdx % shoes.length]);
        outfitsPool.push(buildOutfit(comboItems, seed + 3, weather));
      }
    }
  }

  // Outfit Type 3: Saree + optional Dupatta/Outerwear/Shoes
  if (sarees.length > 0) {
    for (let sIdx = 0; sIdx < sarees.length; sIdx++) {
      const comboItems = [sarees[sIdx]];
      if (dupattas.length > 0) comboItems.push(dupattas[sIdx % dupattas.length]);
      if (shoes.length > 0) comboItems.push(shoes[sIdx % shoes.length]);
      outfitsPool.push(buildOutfit(comboItems, seed + 4, weather));
    }
  }

  // Outfit Type 4: Western Dress + optional Shoes / Layer
  if (dresses.length > 0) {
    for (let dIdx = 0; dIdx < dresses.length; dIdx++) {
      const comboItems = [dresses[dIdx]];
      if (shoes.length > 0) comboItems.push(shoes[dIdx % shoes.length]);
      if (outers.length > 0 && dIdx % 2 === 0) comboItems.push(outers[dIdx % outers.length]);
      outfitsPool.push(buildOutfit(comboItems, seed + 5, weather));
    }
  }

  if (outfitsPool.length === 0) {
    // Fallback: return a slice of any active items
    const fallbackItems = activeItems.slice(0, 3);
    return {
      items: fallbackItems.map((item) => ({
        id: item.id,
        category: item.category,
        imageUri: item.imageUri,
        dominantColor: item.dominantColor,
      })),
      score: 0.75,
      reasons: ["Core pieces from your closet", "Ready to wear"],
    };
  }

  // Sort by score descending and return seeded pick
  outfitsPool.sort((a, b) => b.score - a.score);
  return outfitsPool[seed % outfitsPool.length];
}

function buildOutfit(items: WardrobeItem[], seed: number, weather?: WeatherContext): Outfit {
  const score = calculateOutfitScore(items, seed);
  const reasons = generateReasons(items, weather);
  return {
    items: items.map((item) => ({
      id: item.id,
      category: item.category,
      imageUri: item.imageUri,
      dominantColor: item.dominantColor,
    })),
    score,
    reasons,
  };
}

function calculateOutfitScore(items: WardrobeItem[], seed: number): number {
  let score = 0.78;

  // 1. Color Harmony Scoring via evaluateColorHarmony (color wheel theory)
  const validColors = items.map((i) => i.dominantColor).filter((c): c is string => Boolean(c));
  if (validColors.length >= 2) {
    let harmonySum = 0;
    let pairs = 0;
    for (let i = 0; i < validColors.length; i++) {
      for (let j = i + 1; j < validColors.length; j++) {
        const { score: hScore } = evaluateColorHarmony(validColors[i], validColors[j]);
        harmonySum += hScore;
        pairs++;
      }
    }
    const avgHarmony = pairs > 0 ? harmonySum / pairs : 0.8;
    score = score * 0.5 + avgHarmony * 0.5;
  }

  // 2. Pattern mixing rule: avoid clashing non-solid patterns
  const patterns = items.map((i) => i.pattern?.toLowerCase()).filter(Boolean);
  const nonSolidPatterns = patterns.filter((p) => p !== "solid");
  if (nonSolidPatterns.length > 1) {
    score -= 0.08; // Pattern conflict penalty
  }

  // Small seed variation to avoid total tie deadlock
  score += ((seed % 7) * 0.01);

  // Apply last worn penalty
  score -= lastWornPenalty(items);

  return Math.min(Math.max(Math.round(score * 100) / 100, 0.55), 0.98);
}

function lastWornPenalty(items: WardrobeItem[]): number {
  const now = Math.floor(Date.now() / 1000);
  let penalty = 0;
  for (const item of items) {
    if (item.lastWornAt) {
      const daysSinceWorn = (now - item.lastWornAt) / 86400;
      if (daysSinceWorn <= 3) {
        penalty += 0.15;
      } else if (daysSinceWorn <= 7) {
        penalty += 0.08;
      }
    }
  }
  return penalty;
}

function generateReasons(items: WardrobeItem[], weather?: WeatherContext): string[] {
  const reasons: string[] = [];

  // Color harmony reason
  const validColors = items.map((i) => i.dominantColor).filter((c): c is string => Boolean(c));
  if (validColors.length >= 2) {
    const { harmony } = evaluateColorHarmony(validColors[0], validColors[1]);
    if (harmony === "neutral") reasons.push("Balanced neutral color palette");
    else if (harmony === "monochrome") reasons.push("Sleek monochrome color match");
    else if (harmony === "complementary") reasons.push("Vibrant complementary color pairing");
    else if (harmony === "analogous") reasons.push("Harmonious analogous hues");
    else reasons.push("Tailored color contrast");
  } else {
    reasons.push("Matches your style undertone");
  }

  // Weather reason
  const categories = items.map((i) => i.category.toLowerCase());
  if (weather) {
    if (weather.condition === "hot" || weather.condition === "warm" || weather.tempC > 28) {
      reasons.push(`Breathable ensemble for ${weather.tempC}°C weather`);
    } else if (weather.condition === "cold" || weather.tempC < 18) {
      if (categories.includes("outerwear") || categories.includes("dupatta")) {
        reasons.push(`Warm layered pairing for ${weather.tempC}°C weather`);
      } else {
        reasons.push("Cozy indoor look");
      }
    } else {
      reasons.push(`Comfortable pick for ${weather.tempC}°C weather`);
    }
  } else {
    const month = new Date().getMonth();
    if (month >= 4 && month <= 8) {
      reasons.push("Perfect for warm seasonal weather");
    } else {
      reasons.push("Versatile everyday layering");
    }
  }

  reasons.push("Garments are rested & ready to wear");

  return reasons;
}

export interface StyleDnaBreakdown {
  primaryStyle: string;
  primaryPct: number;
  secondaryStyle: string;
  secondaryPct: number;
  accentStyle: string;
  accentPct: number;
}

export function calculateStyleDna(items: WardrobeItem[]): StyleDnaBreakdown {
  if (!items || items.length === 0) {
    return {
      primaryStyle: "Warm Minimalist",
      primaryPct: 50,
      secondaryStyle: "Indie Fusion",
      secondaryPct: 30,
      accentStyle: "Cozy Casual",
      accentPct: 20,
    };
  }

  const activeItems = items.filter((i) => i && i.lifecycleState === "active");
  if (activeItems.length === 0) {
    return {
      primaryStyle: "Warm Minimalist",
      primaryPct: 50,
      secondaryStyle: "Indie Fusion",
      secondaryPct: 30,
      accentStyle: "Cozy Casual",
      accentPct: 20,
    };
  }

  let solidCount = 0;
  let ethnicCount = 0;
  let warmColorCount = 0;
  const total = activeItems.length;

  for (const item of activeItems) {
    if (item.pattern?.toLowerCase() === "solid") solidCount++;

    const cat = item.category?.toLowerCase() || "";
    if (["kurta", "saree", "lehenga", "dupatta", "sherwani"].includes(cat)) {
      ethnicCount++;
    }

    if (item.dominantColor) {
      const hsl = rgbToHsl(hexToRgb(item.dominantColor));
      // Warm hues (0-60 yellow/red, 300-360 pink/red)
      if (hsl.h <= 60 || hsl.h >= 300) warmColorCount++;
    }
  }

  const solidRatio = solidCount / total;
  const ethnicRatio = ethnicCount / total;

  if (ethnicRatio >= 0.3) {
    return {
      primaryStyle: "Modern Ethnic Fusion",
      primaryPct: Math.round(ethnicRatio * 100),
      secondaryStyle: "Warm Minimalist",
      secondaryPct: Math.round((1 - ethnicRatio) * 60),
      accentStyle: "Festive Statement",
      accentPct: Math.round((1 - ethnicRatio) * 40),
    };
  }

  if (solidRatio >= 0.5) {
    return {
      primaryStyle: "Warm Minimalist",
      primaryPct: Math.round(solidRatio * 100),
      secondaryStyle: "Classic Tailored",
      secondaryPct: Math.round((1 - solidRatio) * 60),
      accentStyle: "Soft Romantic",
      accentPct: Math.round((1 - solidRatio) * 40),
    };
  }

  return {
    primaryStyle: "Eclectic Expressive",
    primaryPct: 45,
    secondaryStyle: "Boho Romantic",
    secondaryPct: 35,
    accentStyle: "Modern Utility",
    accentPct: 20,
  };
}
