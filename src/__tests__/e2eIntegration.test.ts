import { useProfileStore } from "../store/useProfileStore";
import { WardrobeItem } from "../db/wardrobe.repository";
import { computeClosetHealth } from "../ml/closetHealth";
import { generateOutfitSuggestion } from "../ml/styleEngine";
import { analyzeWardrobeGaps } from "../ml/gapAnalyzer";
import { mapWeatherCodeToOutfitTag, fetchWeatherData } from "../services/weatherService";
import { parseOpenGraphMetadata, detectRetailerFromUrl } from "../services/productScraperService";
import { processGarmentImage } from "../services/cameraService";

describe("E2E Deep Integration Test Suite (Full User Journey with Demo Data)", () => {
  const demoItems: WardrobeItem[] = [
    { id: 1, imageUri: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446", category: "tops", dominantColor: "#FAF1E4", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: Date.now() },
    { id: 2, imageUri: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246", category: "bottoms", dominantColor: "#4A3226", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: Date.now() },
    { id: 3, imageUri: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105", category: "tops", dominantColor: "#C97B84", pattern: "floral", confidenceState: "confirmed", lifecycleState: "active", createdAt: Date.now() },
    { id: 4, imageUri: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea", category: "outerwear", dominantColor: "#8FA377", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: Date.now() },
    { id: 5, imageUri: "https://images.unsplash.com/photo-1582552938357-32b906df40cb", category: "ethnic", dominantColor: "#E3A857", pattern: "embroidered", confidenceState: "confirmed", lifecycleState: "active", createdAt: Date.now() },
    { id: 6, imageUri: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e", category: "shoes", dominantColor: "#B79FD6", pattern: "solid", confidenceState: "confirmed", lifecycleState: "active", createdAt: Date.now() },
  ];

  it("Step 1: Onboarding Quiz & Archetype Setup", () => {
    const store = useProfileStore.getState();
    store.setArchetype("sunny");
    expect(useProfileStore.getState().archetype).toBe("sunny");
  });

  it("Step 2: Photo Capture & On-Device Background Removal", async () => {
    const processed = await processGarmentImage("file:///camera_garment.jpg");
    expect(processed.backgroundRemoved).toBe(true);
    expect(processed.dominantColor).toBeDefined();
  });

  it("Step 3: Closet Health & Category Balance Audit", () => {
    const health = computeClosetHealth(demoItems);
    expect(health.overall).toBeGreaterThanOrEqual(0.75);
    expect(health.completeness).toBeGreaterThan(0.5);
    expect(health.colorDiversity).toBeGreaterThan(0.5);
  });

  it("Step 4: Weather Provider Fetching & Outfit Recommendation Engine", async () => {
    const weather = await fetchWeatherData(28.6139, 77.209);
    expect(weather.tempC).toBeDefined();
    expect(weather.outfitTag).toBeDefined();

    const outfit = generateOutfitSuggestion(demoItems, 42);
    expect(outfit).not.toBeNull();
    if (outfit) {
      expect(outfit.items.length).toBeGreaterThanOrEqual(2);
      expect(outfit.score).toBeGreaterThan(0.7);
      expect(outfit.reasons.length).toBeGreaterThan(0);
    }
  });

  it("Step 5: Gap Analysis & E-Commerce Wishlist Import", () => {
    const gaps = analyzeWardrobeGaps(demoItems);
    expect(gaps.length).toBeGreaterThan(0);

    const sampleUrl = "https://www.myntra.com/trousers/linen-blend/10293";
    expect(detectRetailerFromUrl(sampleUrl)).toBe("Myntra");

    const mockOgHtml = `<html><head><meta property="og:title" content="Straight-Fit Trousers"/><meta property="og:image" content="https://assets.myntassets.com/trousers.jpg"/></head></html>`;
    const scraped = parseOpenGraphMetadata(mockOgHtml, sampleUrl);

    expect(scraped.title).toBe("Straight-Fit Trousers");
    expect(scraped.retailer).toBe("Myntra");
  });
});
