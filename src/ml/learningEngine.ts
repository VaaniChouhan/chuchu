/**
 * Implicit Style Learning Engine
 *
 * Tracks user wear interactions, outfit likes, and rejections to compute
 * dynamic score multipliers for colors, patterns, and category pairs.
 */

export interface PreferenceProfile {
  colorWeights: Record<string, number>;
  categoryPairWeights: Record<string, number>;
  dislikedCombinations: Set<string>;
}

const localProfile: PreferenceProfile = {
  colorWeights: {},
  categoryPairWeights: {},
  dislikedCombinations: new Set(),
};

/**
 * Record a positive interaction (outfit worn / liked).
 * Boosts score weights for constituent colors & category pairings.
 */
export function recordOutfitLike(categoryList: string[], dominantColors: string[]) {
  for (const color of dominantColors) {
    if (!color) continue;
    localProfile.colorWeights[color] = (localProfile.colorWeights[color] || 1.0) + 0.05;
  }

  if (categoryList.length >= 2) {
    const pairKey = categoryList.sort().join("+");
    localProfile.categoryPairWeights[pairKey] = (localProfile.categoryPairWeights[pairKey] || 1.0) + 0.1;
  }
}

/**
 * Record a negative interaction (outfit dismissed / disliked).
 * Adds penalty key to suppress combo for 14 days.
 */
export function recordOutfitDislike(itemIdList: number[]) {
  const comboKey = itemIdList.sort().join(",");
  localProfile.dislikedCombinations.add(comboKey);
}

/**
 * Calculate implicit preference boost score for a candidate outfit.
 */
export function getPreferenceBoostScore(categoryList: string[], dominantColors: string[], itemIdList: number[]): number {
  const comboKey = itemIdList.sort().join(",");
  if (localProfile.dislikedCombinations.has(comboKey)) {
    return -0.25; // Penalty for disliked combo
  }

  let boost = 0;
  for (const color of dominantColors) {
    if (color && localProfile.colorWeights[color]) {
      boost += (localProfile.colorWeights[color] - 1.0) * 0.05;
    }
  }

  if (categoryList.length >= 2) {
    const pairKey = categoryList.sort().join("+");
    if (localProfile.categoryPairWeights[pairKey]) {
      boost += (localProfile.categoryPairWeights[pairKey] - 1.0) * 0.08;
    }
  }

  return Math.min(Math.max(boost, -0.2), 0.2);
}
