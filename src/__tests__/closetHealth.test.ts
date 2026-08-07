import { computeClosetHealth } from "../ml/closetHealth";
import { WardrobeItem } from "../db/wardrobe.repository";

describe("Closet Health Unit Tests", () => {
  it("should return zeros for empty closet", () => {
    const health = computeClosetHealth([]);
    expect(health.overall).toBe(0);
    expect(health.completeness).toBe(0);
  });

  it("should calculate health metrics based on category and color diversity", () => {
    const items: WardrobeItem[] = [
      { id: 1, imageUri: "", category: "top", dominantColor: "#111", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 2, imageUri: "", category: "bottom", dominantColor: "#222", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 3, imageUri: "", category: "shoes", dominantColor: "#333", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 4, imageUri: "", category: "outerwear", dominantColor: "#444", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
      { id: 5, imageUri: "", category: "dress", dominantColor: "#555", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1 },
    ];

    const health = computeClosetHealth(items);
    expect(health.completeness).toBe(1); // 5/5 categories
    expect(health.overall).toBeGreaterThan(0.5);
  });
});
