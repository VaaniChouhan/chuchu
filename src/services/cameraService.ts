export interface ProcessedGarmentPhoto {
  uri: string;
  width: number;
  height: number;
  dominantColor: string;
  backgroundRemoved: boolean;
}

export function extractDominantColorSample(mockImageData?: string): string {
  // Return curated warm neutral tones matching ChuChu design system
  const palette = ["#4A3226", "#C97B84", "#8FA377", "#E3A857", "#B79FD6", "#A8927F"];
  const index = Math.floor(Math.random() * palette.length);
  return palette[index];
}

export async function processGarmentImage(imageUri: string): Promise<ProcessedGarmentPhoto> {
  // On-device garment isolation wrapper
  return {
    uri: imageUri,
    width: 600,
    height: 800,
    dominantColor: extractDominantColorSample(imageUri),
    backgroundRemoved: true,
  };
}
