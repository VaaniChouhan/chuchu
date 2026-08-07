export interface ScrapedProduct {
  title: string;
  imageUri: string;
  priceFormatted: string;
  retailer: string;
  rawUrl: string;
}

/**
 * Validates URLs against SSRF (Server-Side Request Forgery) attacks.
 * Rejects non-HTTP schemes and internal/private IP address ranges.
 */
export function isSafeExternalUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Block loopback, localhost, and metadata IPs
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "0.0.0.0" ||
      host === "169.254.169.254" // AWS/GCP metadata endpoint
    ) {
      return false;
    }

    // Block private IPv4 ranges: 10.x.x.x, 127.x.x.x, 172.16-31.x.x, 192.168.x.x
    const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const p1 = parseInt(ipMatch[1], 10);
      const p2 = parseInt(ipMatch[2], 10);
      if (p1 === 10 || p1 === 127) return false;
      if (p1 === 172 && p2 >= 16 && p2 <= 31) return false;
      if (p1 === 192 && p2 === 168) return false;
      if (p1 === 169 && p2 === 254) return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

export function detectRetailerFromUrl(url: string): string {
  const lower = (url || "").toLowerCase();
  if (lower.includes("myntra.com")) return "Myntra";
  if (lower.includes("ajio.com")) return "Ajio";
  if (lower.includes("amazon.")) return "Amazon";
  if (lower.includes("flipkart.com")) return "Flipkart";
  if (lower.includes("nykaa")) return "Nykaa Fashion";
  return "Web Store";
}

export function parseOpenGraphMetadata(htmlText: string, fallbackUrl: string): ScrapedProduct {
  const retailer = detectRetailerFromUrl(fallbackUrl);

  const titleMatch =
    htmlText.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
    htmlText.match(/<title>([^<]+)<\/title>/i);
  const imageMatch = htmlText.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const priceMatch = htmlText.match(/["']price["']\s*:\s*["']?(\d+(?:\.\d+)?)["']?/i);

  const title = titleMatch ? titleMatch[1].trim() : "Saved Product";
  const imageUri = imageMatch ? imageMatch[1] : "";
  const priceFormatted = priceMatch ? `₹${priceMatch[1]}` : "₹1,499";

  return {
    title,
    imageUri,
    priceFormatted,
    retailer,
    rawUrl: fallbackUrl,
  };
}

export async function scrapeProductFromUrl(url: string): Promise<ScrapedProduct> {
  const retailer = detectRetailerFromUrl(url);

  // SSRF Protection Check
  if (!isSafeExternalUrl(url)) {
    console.warn(`[SSRF Guard] Blocked request to unsafe or local URL: ${url}`);
    return {
      title: "Saved Product via " + retailer,
      imageUri: "",
      priceFormatted: "₹1,499",
      retailer,
      rawUrl: url,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Mobile)" }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const htmlText = await response.text();
    return parseOpenGraphMetadata(htmlText, url);
  } catch (e) {
    return {
      title: "Shared Item via " + retailer,
      imageUri: "",
      priceFormatted: "₹1,499",
      retailer,
      rawUrl: url,
    };
  } finally {
    clearTimeout(timeout);
  }
}
