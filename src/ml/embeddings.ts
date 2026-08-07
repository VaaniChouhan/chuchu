import { WardrobeItem } from "@/db/wardrobe.repository";
import { hexToRgb, rgbToHsl } from "@/utils/imageProcessing";
import { CATEGORIES, PATTERNS } from "@/constants/taxonomy";

export interface StyleEmbedding {
  itemId: number;
  vector: number[];
}

const store: StyleEmbedding[] = [];

/**
 * Extracts a 16-dimensional normalized style feature vector from a wardrobe item.
 * Vector encoding:
 * - Dims 0-5: Category one-hot / index normalized
 * - Dims 6-9: Pattern one-hot / index normalized
 * - Dims 10-12: Normalized HSL color (H/360, S/100, L/100)
 * - Dims 13-15: Normalized RGB color (R/255, G/255, B/255)
 */
export function extractFeatureVector(item: WardrobeItem): number[] {
  const vector = new Array(16).fill(0);

  // Category encoding (dims 0-5)
  const catIdx = CATEGORIES.indexOf(item.category?.toLowerCase() as any);
  if (catIdx !== -1) {
    vector[catIdx % 6] = 1.0;
  }

  // Pattern encoding (dims 6-9)
  const patIdx = PATTERNS.indexOf(item.pattern?.toLowerCase() as any);
  if (patIdx !== -1) {
    vector[6 + (patIdx % 4)] = 1.0;
  }

  // Color HSL & RGB encoding (dims 10-15)
  if (item.dominantColor) {
    const rgb = hexToRgb(item.dominantColor);
    const hsl = rgbToHsl(rgb);

    vector[10] = hsl.h / 360.0;
    vector[11] = hsl.s / 100.0;
    vector[12] = hsl.l / 100.0;
    vector[13] = rgb.r / 255.0;
    vector[14] = rgb.g / 255.0;
    vector[15] = rgb.b / 255.0;
  }

  return normalizeVector(vector);
}

export function addEmbedding(entry: StyleEmbedding) {
  store.push(entry);
}

export function clearEmbeddings() {
  store.length = 0;
}

export function findSimilar(vector: number[], topK = 5): StyleEmbedding[] {
  if (!vector || vector.length === 0) return [];
  return store
    .map((entry) => ({ entry, sim: cosineSimilarity(vector, entry.vector) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, topK)
    .map((r) => r.entry);
}

export function findSimilarItems(items: WardrobeItem[], targetItem: WardrobeItem, topK = 3): WardrobeItem[] {
  if (!targetItem || !items || items.length === 0) return [];
  const targetVec = extractFeatureVector(targetItem);

  return items
    .filter((i) => i.id !== targetItem.id)
    .map((item) => ({
      item,
      sim: cosineSimilarity(targetVec, extractFeatureVector(item)),
    }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, topK)
    .map((r) => r.item);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function normalizeVector(v: number[]): number[] {
  const mag = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
  if (mag === 0) return v;
  return v.map((val) => val / mag);
}
