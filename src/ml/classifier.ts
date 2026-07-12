import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import { preprocessImage } from "@/utils/imageProcessing";
import { classifyGarmentMock } from "./classifier.mock";
import { classifyGarmentCloudFallback } from "./cloudClassifier";

export interface GarmentClassification {
  category: string; // e.g. "top", "bottom", "dress", "outerwear", "shoes"
  dominantColor: string;
  pattern: string; // e.g. "solid", "striped", "floral", "plaid"
  confidence: number;
}

const CATEGORY_LABELS = ["top", "bottom", "dress", "outerwear", "shoes", "accessory"];
const PATTERN_LABELS = ["solid", "striped", "floral", "plaid", "graphic", "textured"];

let model: TensorflowModel | null = null;
let useMockFallback = false;

async function getModel(): Promise<TensorflowModel | null> {
  if (useMockFallback) return null;
  if (!model) {
    try {
      // Bundled locally — load model using fast-tflite
      model = await loadTensorflowModel(require("../../assets/models/garment_classifier.tflite"), []);
    } catch (e) {
      console.warn("TFLite native module failed to load, falling back to mock classifier:", e);
      useMockFallback = true;
    }
  }
  return model;
}

export async function classifyGarment(photoUri: string): Promise<GarmentClassification> {
  const net = await getModel();
  let result: GarmentClassification;

  if (!net) {
    // Return mock classification when native fast-tflite is unavailable (e.g. Web or simulator)
    const mockRes = await classifyGarmentMock(photoUri);
    result = {
      category: mockRes.category,
      dominantColor: mockRes.dominantColor,
      pattern: mockRes.pattern,
      confidence: mockRes.confidence,
    };
  } else {
    try {
      const tensorInput = await preprocessImage(photoUri, { width: 224, height: 224 });
      const outputs = net.runSync([tensorInput.buffer as ArrayBuffer]);

      const categoryScores = new Float32Array(outputs[0]);
      const patternScores = new Float32Array(outputs[1]);
      const colorRgb = new Float32Array(outputs[2]); // [r, g, b] normalized 0-1

      const categoryIdx = argmax(categoryScores);
      const patternIdx = argmax(patternScores);

      result = {
        category: CATEGORY_LABELS[categoryIdx],
        pattern: PATTERN_LABELS[patternIdx],
        dominantColor: rgbToHex(colorRgb),
        confidence: categoryScores[categoryIdx],
      };
    } catch (e) {
      console.error("TFLite inference failed, falling back to mock:", e);
      const mockRes = await classifyGarmentMock(photoUri);
      result = {
        category: mockRes.category,
        dominantColor: mockRes.dominantColor,
        pattern: mockRes.pattern,
        confidence: mockRes.confidence,
      };
    }
  }

  // Cloud Escalation: Trigger fallback API if local classification confidence is below 75%
  if (result.confidence < 0.75) {
    console.log(`[ML Core] Low confidence (${result.confidence}). Escalating to cloud classifier fallback...`);
    try {
      const cloudRes = await classifyGarmentCloudFallback(photoUri);
      return {
        category: cloudRes.category,
        dominantColor: cloudRes.dominantColor,
        pattern: cloudRes.pattern,
        confidence: cloudRes.confidence,
      };
    } catch (err) {
      console.error("Cloud escalation failed, returning local result:", err);
    }
  }

  return result;
}

function argmax(arr: ArrayLike<number>): number {
  let best = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
  return best;
}

function rgbToHex(rgb: ArrayLike<number>): string {
  const [r, g, b] = Array.from(rgb).map((v) => Math.round(v * 255));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
