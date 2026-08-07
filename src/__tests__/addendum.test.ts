import { detectRetailer, parseProductUrl } from "../services/shareIntentHandler";
import { removeGarmentBackground } from "../ml/clothingSegmentation";

describe("Addendum & Feature Enhancements Tests", () => {
  it("should correctly identify Indian e-commerce retailers from URLs", () => {
    expect(detectRetailer("https://www.myntra.com/tshirts/nike/12345")).toBe("Myntra");
    expect(detectRetailer("https://www.ajio.com/p/46123456")).toBe("Ajio");
    expect(detectRetailer("https://www.amazon.in/dp/B08N5WRWNW")).toBe("Amazon");
    expect(detectRetailer("https://www.flipkart.com/t-shirt/p/itm1234")).toBe("Flipkart");
    expect(detectRetailer("https://www.nykaafashion.com/dresses/p/98765")).toBe("Nykaa Fashion");
    expect(detectRetailer("https://example.com/item")).toBe("Web Store");
  });

  it("should return parsed product metadata with fallback title", async () => {
    const meta = await parseProductUrl("https://www.myntra.com/tshirts/brand/100");
    expect(meta.retailer).toBe("Myntra");
    expect(meta.title).toBeTruthy();
  });

  it("should run clothing background segmentation stub cleanly", async () => {
    const res = await removeGarmentBackground("test_photo.jpg");
    expect(res.outputUri).toBe("test_photo.jpg");
  });
});
