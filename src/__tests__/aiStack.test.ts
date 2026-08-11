import { detectGarmentsInPhoto } from "../ml/detector";
import { removeGarmentBackground } from "../ml/clothingSegmentation";
import { extractFeatureVector, findSimilarItems } from "../ml/embeddings";
import { checkLocalAiAvailability, generateLocalStylistAdvice } from "../services/ai/localAiClient";

describe("Local AI & Edge ML Stack", () => {
  it("detects garments on-device using local TFLite detector", async () => {
    const result = await detectGarmentsInPhoto("file:///test/garment.jpg");
    expect(result.isLocalInference).toBe(true);
    expect(result.garments.length).toBeGreaterThan(0);
    expect(result.garments[0].confidence).toBeGreaterThan(0.7);
  });

  it("handles local background removal safely", async () => {
    const result = await removeGarmentBackground("file:///test/garment.jpg");
    expect(result.outputUri).toBe("file:///test/garment.jpg");
    expect(typeof result.processingTimeMs).toBe("number");
  });

  it("extracts feature vector and performs local vector similarity matching", () => {
    const itemA = {
      id: 1,
      imageUri: "file:///test/a.jpg",
      category: "top",
      dominantColor: "#FF0000",
      pattern: "solid",
      confidenceState: "confirmed" as const,
      lifecycleState: "active" as const,
      createdAt: 1000,
    };

    const itemB = {
      id: 2,
      imageUri: "file:///test/b.jpg",
      category: "top",
      dominantColor: "#EE0000",
      pattern: "solid",
      confidenceState: "confirmed" as const,
      lifecycleState: "active" as const,
      createdAt: 1001,
    };

    const vecA = extractFeatureVector(itemA);
    const vecB = extractFeatureVector(itemB);

    expect(vecA.length).toBe(16);
    expect(vecB.length).toBe(16);

    const matches = findSimilarItems([itemB], itemA);
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe(2);
  });

  it("handles local LAN Ollama client availability checks gracefully", async () => {
    const isAvailable = await checkLocalAiAvailability("http://127.0.0.1:11434");
    expect(typeof isAvailable).toBe("boolean");

    const response = await generateLocalStylistAdvice("Suggest outfit for rainy day");
    expect(response === null || typeof response === "string").toBe(true);
  });

  it("executes 5-stage reverse visual image search against local & e-commerce catalogs", async () => {
    const { executeReverseVisualSearch } = require("../services/visualReverseSearchService");
    const result = await executeReverseVisualSearch("file:///test/search_top.jpg", []);
    expect(result.queryGarmentCategory).toBeDefined();
    expect(result.eCommerceMatches.length).toBeGreaterThan(0);
    expect(result.eCommerceMatches[0].matchScore).toBeGreaterThan(0.5);
  });
});
