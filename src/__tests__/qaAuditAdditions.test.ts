import { generateOutfitSuggestion } from "../ml/styleEngine";
import { WardrobeItem, updateWardrobeItem, getWardrobeItem, getItemUsageStats } from "../db/wardrobe.repository";
import { isSafeExternalUrl, parseOpenGraphMetadata } from "../services/productScraperService";
import { colorDistanceDeltaE, rgbToLab } from "../utils/imageProcessing";

describe("QA Audit Edge Case & Resilience Test Suite", () => {
  describe("StyleEngine Inactive & Sparse Closet Resilience", () => {
    it("should return null when closet contains only archived, donated, or sold items", () => {
      const inactiveItems: WardrobeItem[] = [
        { id: 1, imageUri: "test1.jpg", category: "top", confidenceState: "confirmed", lifecycleState: "archived", createdAt: 1000 },
        { id: 2, imageUri: "test2.jpg", category: "bottom", confidenceState: "confirmed", lifecycleState: "donated", createdAt: 1000 },
        { id: 3, imageUri: "test3.jpg", category: "dress", confidenceState: "confirmed", lifecycleState: "sold", createdAt: 1000 },
      ];
      const result = generateOutfitSuggestion(inactiveItems);
      expect(result).toBeNull();
    });

    it("should return single dress outfit when only 1 dress is available in wardrobe", () => {
      const dressOnly: WardrobeItem[] = [
        { id: 10, imageUri: "dress.jpg", category: "dress", dominantColor: "#C97B84", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
      ];
      const result = generateOutfitSuggestion(dressOnly);
      expect(result).not.toBeNull();
      expect(result?.items.length).toBe(1);
      expect(result?.items[0].category).toBe("dress");
    });

    it("should handle single item category sparse closet fallback", () => {
      const topOnly: WardrobeItem[] = [
        { id: 20, imageUri: "top.jpg", category: "top", dominantColor: "#4A3226", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
      ];
      const result = generateOutfitSuggestion(topOnly);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(0.75);
      expect(result?.reasons).toContain("Core pieces from your closet");
    });

    it("should generate warm layered ensemble reason for extreme sub-zero cold weather (-20°C)", () => {
      const winterItems: WardrobeItem[] = [
        { id: 1, imageUri: "sweater.jpg", category: "top", dominantColor: "#4A3226", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
        { id: 2, imageUri: "jeans.jpg", category: "bottom", dominantColor: "#8FA377", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
        { id: 3, imageUri: "coat.jpg", category: "outerwear", dominantColor: "#FAF1E4", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
      ];
      const result = generateOutfitSuggestion(winterItems, 0, { condition: "cold", tempC: -20, description: "Sub-zero freezing" });
      expect(result).not.toBeNull();
      expect(result?.reasons.some((r) => r.includes("-20°C"))).toBe(true);
    });

    it("should handle extreme heat (45°C) gracefully and generate breathable ensemble reason", () => {
      const summerItems: WardrobeItem[] = [
        { id: 1, imageUri: "tee.jpg", category: "top", dominantColor: "#FAF1E4", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
        { id: 2, imageUri: "shorts.jpg", category: "bottom", dominantColor: "#8FA377", confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
      ];
      const result = generateOutfitSuggestion(summerItems, 0, { condition: "hot", tempC: 45, description: "Extreme heatwave" });
      expect(result).not.toBeNull();
      expect(result?.reasons.some((r) => r.includes("45°C"))).toBe(true);
    });

    it("should handle corrupted or string lastWornAt timestamps without throwing or producing NaN", () => {
      const corruptedItems: WardrobeItem[] = [
        { id: 1, imageUri: "top.jpg", category: "top", dominantColor: "#C97B84", lastWornAt: "2026-08-01T12:00:00Z" as any, confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
        { id: 2, imageUri: "bottom.jpg", category: "bottom", dominantColor: "#4A3226", lastWornAt: 1723000000000 as any, confidenceState: "confirmed", lifecycleState: "active", createdAt: 1000 },
      ];
      const result = generateOutfitSuggestion(corruptedItems);
      expect(result).not.toBeNull();
      expect(isNaN(result!.score)).toBe(false);
    });
  });

  describe("Color Science & LAB Delta E Tests", () => {
    it("should return Delta E = 0 for identical hex colors", () => {
      const deltaE = colorDistanceDeltaE("#C97B84", "#C97B84");
      expect(deltaE).toBeCloseTo(0, 1);
    });

    it("should calculate positive Delta E distance between distinct colors", () => {
      const deltaE = colorDistanceDeltaE("#FFFFFF", "#000000");
      expect(deltaE).toBeGreaterThan(50);
    });

    it("should convert RGB to CIELAB coordinates correctly", () => {
      const lab = rgbToLab({ r: 255, g: 255, b: 255 });
      expect(lab.l).toBeCloseTo(100, 0);
    });
  });

  describe("Security & URL Safety Tests", () => {
    it("should block loopback, localhost, and AWS metadata IPs", () => {
      expect(isSafeExternalUrl("http://localhost:8080/secret")).toBe(false);
      expect(isSafeExternalUrl("http://127.0.0.1/admin")).toBe(false);
      expect(isSafeExternalUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
      expect(isSafeExternalUrl("http://10.0.0.1/internal")).toBe(false);
      expect(isSafeExternalUrl("http://192.168.1.1/router")).toBe(false);
    });

    it("should allow valid public HTTPS URLs", () => {
      expect(isSafeExternalUrl("https://www.myntra.com/tshirt")).toBe(true);
      expect(isSafeExternalUrl("https://www.ajio.com/p/12345")).toBe(true);
    });

    it("should parse OpenGraph metadata safely from HTML string", () => {
      const html = `
        <html>
          <head>
            <meta property="og:title" content="Classic Linen Kurta" />
            <meta property="og:image" content="https://images.myntra.com/kurta.jpg" />
          </head>
        </html>
      `;
      const meta = parseOpenGraphMetadata(html, "https://www.myntra.com/kurta");
      expect(meta.title).toBe("Classic Linen Kurta");
      expect(meta.imageUri).toBe("https://images.myntra.com/kurta.jpg");
      expect(meta.retailer).toBe("Myntra");
    });
  });
});
