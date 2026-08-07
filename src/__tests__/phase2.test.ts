import { computeClosetHealth } from "../ml/closetHealth";
import { analyzeWardrobeGaps } from "../ml/gapAnalyzer";
import { generateOutfitSuggestion, calculateStyleDna } from "../ml/styleEngine";
import { hexToRgb, rgbToHex, rgbToHsl, colorDistanceRgb, evaluateColorHarmony } from "../utils/imageProcessing";
import { findSimilar, addEmbedding } from "../ml/embeddings";
import { classifyGarmentCloudFallback } from "../ml/cloudClassifier";
import { WardrobeItem } from "../db/wardrobe.repository";

describe("Phase 2 ML Pipeline & Color Math Tests", () => {
  describe("Color Processing Utilities", () => {
    it("converts hex to RGB and back accurately", () => {
      const rgb = hexToRgb("#C97B84");
      expect(rgb).toEqual({ r: 201, g: 123, b: 132 });
      const hex = rgbToHex(201, 123, 132);
      expect(hex.toLowerCase()).toBe("#c97b84");
    });

    it("converts RGB to HSL correctly", () => {
      const hsl = rgbToHsl({ r: 201, g: 123, b: 132 });
      expect(hsl.h).toBeGreaterThanOrEqual(340);
      expect(hsl.h).toBeLessThanOrEqual(360);
      expect(hsl.s).toBeGreaterThan(30);
    });

    it("evaluates color wheel harmony for neutral, monochrome, and complementary pairs", () => {
      const neutralEval = evaluateColorHarmony("#FAF1E4", "#4A3226");
      expect(neutralEval.harmony).toBe("neutral");

      const monoEval = evaluateColorHarmony("#C97B84", "#B15E68");
      expect(monoEval.harmony).toBe("monochrome");
    });

    it("computes RGB Euclidean distance", () => {
      const dist = colorDistanceRgb("#000000", "#FFFFFF");
      expect(dist).toBeCloseTo(441.67, 1);
    });
  });

  describe("Ethnic Wear Taxonomy Support", () => {
    const ethnicItems: WardrobeItem[] = [
      {
        id: 1,
        imageUri: "kurta.jpg",
        category: "kurta",
        dominantColor: "#C97B84",
        pattern: "embroidered",
        confidenceState: "confirmed",
        lifecycleState: "active",
        createdAt: 100,
      },
      {
        id: 2,
        imageUri: "dupatta.jpg",
        category: "dupatta",
        dominantColor: "#FAF1E4",
        pattern: "zari",
        confidenceState: "confirmed",
        lifecycleState: "active",
        createdAt: 101,
      },
      {
        id: 3,
        imageUri: "lehenga.jpg",
        category: "lehenga",
        dominantColor: "#4A3226",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
        createdAt: 102,
      },
    ];

    it("generates ethnic outfit combinations (Kurta + Lehenga + Dupatta)", () => {
      const outfit = generateOutfitSuggestion(ethnicItems);
      expect(outfit).not.toBeNull();
      expect(outfit?.items.length).toBe(3);
      expect(outfit?.reasons.length).toBeGreaterThan(0);
    });

    it("calculates Modern Ethnic Fusion Style DNA", () => {
      const dna = calculateStyleDna(ethnicItems);
      expect(dna.primaryStyle).toBe("Modern Ethnic Fusion");
      expect(dna.primaryPct + dna.secondaryPct + dna.accentPct).toBe(100);
    });

    it("computes closet health with role-based taxonomy", () => {
      const health = computeClosetHealth(ethnicItems);
      expect(health.completeness).toBeGreaterThan(0.5);
      expect(health.overall).toBeGreaterThan(0.4);
    });

    it("detects ethnic wardrobe gaps without zero-multiplication crash", () => {
      const gaps = analyzeWardrobeGaps(ethnicItems);
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.every((g) => g.newOutfitsCount > 0)).toBe(true);
    });
  });

  describe("Embeddings & Cloud Classifier Safety", () => {
    it("handles zero vector magnitude without division-by-zero crash", () => {
      addEmbedding({ itemId: 1, vector: [0, 0, 0] });
      const results = findSimilar([1, 2, 3]);
      expect(results).toBeDefined();
    });

    it("cloud classifier returns valid fallback structure and color", async () => {
      const res = await classifyGarmentCloudFallback("test_garment.jpg");
      expect(res.category).toBeTruthy();
      expect(res.dominantColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(res.confidence).toBeGreaterThan(0.75);
    });
  });
});
