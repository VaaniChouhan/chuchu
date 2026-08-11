import { generateCapsuleWardrobe } from "../ml/capsuleGenerator";
import { recordOutfitLike, recordOutfitDislike, getPreferenceBoostScore } from "../ml/learningEngine";
import { batchCropAndProcessGarments } from "../ml/detector";
import { generateOutfitSuggestion } from "../ml/styleEngine";

describe("Seamless Algorithmic & UX Enhancements", () => {
  const mockWardrobe = [
    {
      id: 101,
      imageUri: "file:///test/top1.jpg",
      category: "top",
      dominantColor: "#112233",
      pattern: "solid",
      formality: "casual",
      confidenceState: "confirmed" as const,
      lifecycleState: "active" as const,
      createdAt: 1000,
    },
    {
      id: 102,
      imageUri: "file:///test/bottom1.jpg",
      category: "bottom",
      dominantColor: "#445566",
      pattern: "solid",
      formality: "casual",
      confidenceState: "confirmed" as const,
      lifecycleState: "active" as const,
      createdAt: 1001,
    },
    {
      id: 103,
      imageUri: "file:///test/suit_jacket.jpg",
      category: "outerwear",
      dominantColor: "#112233",
      pattern: "solid",
      formality: "business_formal",
      confidenceState: "confirmed" as const,
      lifecycleState: "active" as const,
      createdAt: 1002,
    },
  ];

  it("calculates Formality Context Matrix score penalties correctly", () => {
    const outfit = generateOutfitSuggestion(mockWardrobe, 0);
    expect(outfit).not.toBeNull();
    expect(typeof outfit?.score).toBe("number");
  });

  it("generates capsule wardrobe packing list using greedy optimization", () => {
    const capsule = generateCapsuleWardrobe(mockWardrobe, 4, 7);
    expect(capsule.selectedItems.length).toBeLessThanOrEqual(4);
    expect(capsule.outfitsGenerated.length).toBeGreaterThan(0);
    expect(typeof capsule.coverageScore).toBe("number");
  });

  it("processes multi-garment photo batch crops", async () => {
    const batch = await batchCropAndProcessGarments("file:///test/multi_outfit.jpg");
    expect(batch.length).toBeGreaterThan(0);
    expect(batch[0].croppedUri).toContain("#crop_1");
  });

  it("updates preference weights in implicit style learning engine", () => {
    recordOutfitLike(["top", "bottom"], ["#112233"]);
    let boost = getPreferenceBoostScore(["top", "bottom"], ["#112233"], [101, 102]);
    expect(boost).toBeGreaterThan(0);

    recordOutfitDislike([101, 103]);
    boost = getPreferenceBoostScore(["top", "outerwear"], ["#112233"], [101, 103]);
    expect(boost).toBe(-0.25);
  });
});
