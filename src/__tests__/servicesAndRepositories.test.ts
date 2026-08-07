import { isSafeExternalUrl } from "../services/productScraperService";
import { extractFeatureVector, findSimilarItems } from "../ml/embeddings";
import { hexToRgb, rgbToHsl, rgbToHex, evaluateColorHarmony } from "../utils/imageProcessing";

describe("Batch 10: New Tests & Legal Links", () => {
  describe("isSafeExternalUrl", () => {
    it("protects against SSRF by rejecting internal/local IPs and non-HTTP schemes", () => {
      expect(isSafeExternalUrl("http://localhost:3000")).toBe(false);
      expect(isSafeExternalUrl("http://127.0.0.1/admin")).toBe(false);
      expect(isSafeExternalUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
      expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
      expect(isSafeExternalUrl("ftp://example.com/file")).toBe(false);
      expect(isSafeExternalUrl("https://10.0.0.5/api")).toBe(false);
      expect(isSafeExternalUrl("http://192.168.1.1/router")).toBe(false);
    });

    it("allows safe external URLs", () => {
      expect(isSafeExternalUrl("https://www.zara.com/us/en/product.html")).toBe(true);
      expect(isSafeExternalUrl("http://example.com")).toBe(true);
      expect(isSafeExternalUrl("https://hm.com")).toBe(true);
    });
  });

  describe("vector similarity in embeddings.ts", () => {
    it("extractFeatureVector generates a normalized 16-dimensional vector", () => {
      const item: any = {
        id: "1",
        category: "tops",
        pattern: "solid",
        dominantColor: "#ff0000" // Red
      };
      
      const vec = extractFeatureVector(item);
      expect(vec).toHaveLength(16);
      
      // Check normalization (magnitude should be close to 1)
      const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it("findSimilarItems returns items sorted by cosine similarity", () => {
      const target: any = { id: "target", category: "tops", pattern: "solid", dominantColor: "#ff0000" };
      const similar: any = { id: "sim", category: "tops", pattern: "solid", dominantColor: "#ee0000" };
      const different: any = { id: "diff", category: "bottoms", pattern: "striped", dominantColor: "#0000ff" };
      
      const items = [different, similar, target];
      
      const result = findSimilarItems(items, target, 2);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("sim"); // More similar should be first
      expect(result[1].id).toBe("diff");
    });
  });

  describe("color math in imageProcessing.ts", () => {
    it("hexToRgb converts hex to RGB object", () => {
      expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("rgbToHsl converts RGB to HSL object", () => {
      const redHsl = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(redHsl.h).toBe(0);
      expect(redHsl.s).toBe(100);
      expect(redHsl.l).toBe(50);
      
      const greenHsl = rgbToHsl({ r: 0, g: 255, b: 0 });
      expect(greenHsl.h).toBe(120);
      expect(greenHsl.s).toBe(100);
      expect(greenHsl.l).toBe(50);
    });

    it("rgbToHex converts RGB to Hex string", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
      expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
      expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
    });

    it("evaluateColorHarmony returns harmony type and score", () => {
      // Monochromatic: same color
      const mono = evaluateColorHarmony("#FF0000", "#FF0000");
      expect(mono.harmony).toBe("monochrome");
      
      // Complementary: opposite colors (red and cyan)
      const comp = evaluateColorHarmony("#FF0000", "#00FFFF");
      expect(comp.harmony).toBe("complementary");
      expect(comp.score).toBeGreaterThan(0);
    });
  });
});
