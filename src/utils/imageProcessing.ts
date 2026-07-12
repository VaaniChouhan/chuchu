import * as FileSystem from "expo-file-system";

interface PreprocessOptions {
  width: number;
  height: number;
}

/**
 * Loads an image, resizes/normalizes it, and returns a Float32Array
 * shaped for TFLite model input: [1, height, width, 3], values 0-1.
 *
 * NOTE: actual resize/decode should use a native image-manipulation lib
 * (e.g. expo-image-manipulator or vision-camera's frame processor) for
 * real performance — this stub shows the expected shape/contract.
 */
export async function preprocessImage(
  uri: string,
  { width, height }: PreprocessOptions
): Promise<Float32Array> {
  // Placeholder pipeline — replace with real decode + resize.
  // 1. Read file
  await FileSystem.getInfoAsync(uri);

  // 2. Resize to model input dims (use expo-image-manipulator here)
  // 3. Extract RGB pixels, normalize to 0-1
  const pixelCount = width * height * 3;
  const tensor = new Float32Array(pixelCount);

  // TODO: replace with actual decoded pixel values
  return tensor;
}
