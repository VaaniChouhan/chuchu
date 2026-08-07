import { analyzeWardrobeGaps } from "../ml/gapAnalyzer";
import { WardrobeItem } from "../db/wardrobe.repository";

describe("Gap Analyzer Unit Tests", () => {
  it("should detect outerwear deficiency when outerwear count is under 2", () => {
    const items: WardrobeItem[] = [
      {
        id: 1,
        imageUri: "t1.jpg",
        category: "top",
        dominantColor: "#000",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
        createdAt: 100,
      },
      {
        id: 2,
        imageUri: "b1.jpg",
        category: "bottom",
        dominantColor: "#000",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
        createdAt: 101,
      },
    ];

    const gaps = analyzeWardrobeGaps(items);
    expect(gaps.length).toBeGreaterThan(0);
    const outerwearGap = gaps.find((g) => g.category === "outerwear");
    expect(outerwearGap).toBeDefined();
  });

  it("should return dress gap recommendation when wardrobe is well-balanced", () => {
    const balancedItems: WardrobeItem[] = [
      { id: 1, imageUri: "", category: "top", dominantColor: "", pattern: "", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 2, imageUri: "", category: "top", dominantColor: "", pattern: "", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 3, imageUri: "", category: "bottom", dominantColor: "", pattern: "", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 4, imageUri: "", category: "outerwear", dominantColor: "", pattern: "", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 5, imageUri: "", category: "outerwear", dominantColor: "", pattern: "", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 6, imageUri: "", category: "shoes", dominantColor: "", pattern: "", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 7, imageUri: "", category: "shoes", dominantColor: "", pattern: "", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
    ];

    const gaps = analyzeWardrobeGaps(balancedItems);
    expect(gaps.length).toBeGreaterThan(0);
  });
});
