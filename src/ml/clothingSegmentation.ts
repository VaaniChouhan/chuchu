/**
 * Clothing Background Segmentation Utility
 *
 * Production: Requires on-device ONNX runtime (u2net_cloth_seg.onnx) for
 * background isolation. Currently operates in graceful-degradation mode
 * returning the original image when no native model is available.
 *
 * Integration path:
 * 1. Add `onnxruntime-react-native` package
 * 2. Bundle `u2net_cloth_seg.onnx` in assets/models/
 * 3. Replace stub below with real inference pipeline
 */

export interface SegmentationOptions {
  threshold?: number;
  format?: "png" | "jpeg";
}

export interface SegmentationResult {
  outputUri: string;
  didSegment: boolean;
  processingTimeMs: number;
}

let segmentationAvailable: boolean | null = null;

/**
 * Checks whether native segmentation runtime is available.
 * Caches result after first check.
 */
export function isSegmentationAvailable(): boolean {
  if (segmentationAvailable !== null) return segmentationAvailable;
  try {
    // Check if ONNX runtime native module is available
    require("onnxruntime-react-native");
    segmentationAvailable = true;
  } catch {
    segmentationAvailable = false;
  }
  return segmentationAvailable;
}

/**
 * Removes background from garment photo to produce clean studio-style thumbnail.
 *
 * When native ONNX runtime is unavailable, returns original image URI
 * with `didSegment: false` so callers can apply CSS-based fallbacks
 * (e.g. vignette overlay, solid background) if desired.
 */
export async function removeGarmentBackground(
  imageUri: string,
  options: SegmentationOptions = {}
): Promise<SegmentationResult> {
  const startTime = Date.now();

  if (!imageUri) {
    return {
      outputUri: "",
      didSegment: false,
      processingTimeMs: 0,
    };
  }

  if (!isSegmentationAvailable()) {
    console.info(
      "[Segmentation] Native ONNX runtime not available — returning original image. " +
        "Install onnxruntime-react-native and bundle u2net_cloth_seg.onnx for real segmentation."
    );
    return {
      outputUri: imageUri,
      didSegment: false,
      processingTimeMs: Date.now() - startTime,
    };
  }

  // When ONNX runtime is available, real inference would go here:
  // 1. Load model from assets/models/u2net_cloth_seg.onnx
  // 2. Preprocess image to 320x320 RGB tensor
  // 3. Run inference to get segmentation mask
  // 4. Apply mask to original image
  // 5. Save result to cache directory

  return {
    outputUri: imageUri,
    didSegment: false,
    processingTimeMs: Date.now() - startTime,
  };
}
