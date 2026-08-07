import { getDb } from "@/db/schema";
import { scrapeProductFromUrl, isSafeExternalUrl, detectRetailerFromUrl } from "./productScraperService";

export const detectRetailer = detectRetailerFromUrl;

export interface ParsedProductMeta {
  title: string;
  imageUrl?: string;
  price?: number;
  retailer: string;
  sourceUrl: string;
}

export async function parseProductUrl(url: string): Promise<ParsedProductMeta> {
  if (!isSafeExternalUrl(url)) {
    return {
      title: "Web Store Garment Save",
      retailer: "Web Store",
      sourceUrl: url,
    };
  }

  const scraped = await scrapeProductFromUrl(url);
  
  let price: number | undefined = undefined;
  if (scraped.priceFormatted) {
    const parsed = parseFloat(scraped.priceFormatted.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) {
      price = parsed;
    }
  }

  return {
    title: scraped.title,
    imageUrl: scraped.imageUri || undefined,
    price,
    retailer: scraped.retailer,
    sourceUrl: scraped.rawUrl,
  };
}

export async function saveImportedProductToWishlist(url: string): Promise<number> {
  const meta = await parseProductUrl(url);
  const db = getDb();
  const result = await db.runAsync(
    `INSERT INTO wishlist_items (title, gap_reason, status, source_url, retailer, price, image_url)
     VALUES (?, ?, 'saved', ?, ?, ?, ?)`,
    [
      meta.title,
      `Imported from ${meta.retailer}`,
      meta.sourceUrl,
      meta.retailer,
      meta.price ?? null,
      meta.imageUrl ?? null,
    ]
  );
  return result.lastInsertRowId;
}
