import { generateOutfitSuggestion, calculateStyleDna } from "../ml/styleEngine";
import { WardrobeItem } from "../db/wardrobe.repository";

const sampleItems: WardrobeItem[] = [
  {
    id: 1,
    imageUri: "https://example.com/top.jpg",
    category: "top",
    dominantColor: "#FFFDF9",
    pattern: "solid",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: 1000,
  },
  {
    id: 2,
    imageUri: "https://example.com/bottom.jpg",
    category: "bottom",
    dominantColor: "#2B3A42",
    pattern: "solid",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: 1001,
  },
  {
    id: 3,
    imageUri: "https://example.com/shoes.jpg",
    category: "shoes",
    dominantColor: "#FFFDF9",
    pattern: "solid",
    confidenceState: "confirmed",
    lifecycleState: "active",
    createdAt: 1002,
  },
];

describe("Style Engine Unit Tests", () => {
  it("should return null for empty wardrobe", () => {
    const outfit = generateOutfitSuggestion([]);
    expect(outfit).toBeNull();
  });

  it("should generate outfit suggestion when tops and bottoms are present", () => {
    const outfit = generateOutfitSuggestion(sampleItems);
    expect(outfit).not.toBeNull();
    expect(outfit?.items.length).toBeGreaterThanOrEqual(2);
    expect(outfit?.score).toBeGreaterThanOrEqual(0.5);
    expect(outfit?.score).toBeLessThanOrEqual(1.0);
    expect(outfit?.reasons.length).toBeGreaterThan(0);
  });

  it("should calculate style DNA breakdown based on garment composition", () => {
    const dna = calculateStyleDna(sampleItems);
    expect(dna).toBeDefined();
    expect(dna.primaryStyle).toBeTruthy();
    expect(dna.primaryPct + dna.secondaryPct + dna.accentPct).toBe(100);
  });
});
