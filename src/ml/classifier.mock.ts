export interface GarmentClassificationMock {
  category: string;
  pattern: string;
  dominantColor: string;
  confidence: number;
}

export async function classifyGarmentMock(photoUri: string): Promise<GarmentClassificationMock> {
  const categories = ["top", "bottom", "dress", "outerwear", "shoes", "kurta", "saree", "lehenga", "dupatta", "sherwani"];
  const patterns = ["solid", "striped", "floral", "plaid", "embroidered", "zari", "block-print"];
  // Random color from design tokens or pleasant presets
  const colors = ["#C97B84", "#FAF1E4", "#4A3226", "#8FA377", "#E3A857", "#B79FD6", "#B15E68", "#5F7A4C"];
  
  // Simulate network or ML inference latency (e.g. 300ms)
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    category: categories[Math.floor(Math.random() * categories.length)],
    pattern: patterns[Math.floor(Math.random() * patterns.length)],
    dominantColor: colors[Math.floor(Math.random() * colors.length)],
    confidence: 0.7 + Math.random() * 0.25,
  };
}
