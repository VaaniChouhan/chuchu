// Placeholder for v2: local embedding store for style similarity search.
// Once wardrobe size grows, generate a style embedding per item (via a small
// on-device model) and store vectors here for fast cosine-similarity lookups
// entirely on-device — no server round trip needed.

export interface StyleEmbedding {
  itemId: number;
  vector: number[];
}

const store: StyleEmbedding[] = [];

export function addEmbedding(entry: StyleEmbedding) {
  store.push(entry);
}

export function findSimilar(vector: number[], topK = 5): StyleEmbedding[] {
  return store
    .map((entry) => ({ entry, sim: cosineSimilarity(vector, entry.vector) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, topK)
    .map((r) => r.entry);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}
