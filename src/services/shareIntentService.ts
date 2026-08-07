import { scrapeProductFromUrl, ScrapedProduct } from "./productScraperService";

export type ShareIntentCallback = (product: ScrapedProduct) => void;

const listeners = new Set<ShareIntentCallback>();

export function registerShareIntentListener(callback: ShareIntentCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export async function handleIncomingShareUrl(sharedUrl: string): Promise<ScrapedProduct | null> {
  if (!sharedUrl) return null;
  const scraped = await scrapeProductFromUrl(sharedUrl);
  listeners.forEach((listener) => listener(scraped));
  return scraped;
}
