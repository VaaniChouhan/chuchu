import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import { InteractionManager } from "react-native";
import { preprocessImage, extractDominantColor } from "@/utils/imageProcessing";
import { classifyGarmentMock } from "./classifier.mock";
import { classifyGarmentCloudFallback } from "./cloudClassifier";

export interface GarmentClassification {
  category: string; // "top", "bottom", "dress", "outerwear", "shoes", "accessory", "kurta", "saree", "lehenga", "dupatta", "sherwani"
  dominantColor: string;
  pattern: string; // "solid", "striped", "floral", "plaid", "embroidered", "zari", "block-print"
  confidence: number;
}

const CATEGORY_LABELS = ["top", "bottom", "dress", "outerwear", "shoes", "accessory", "kurta", "saree", "lehenga", "dupatta", "sherwani"];
const PATTERN_LABELS = ["solid", "striped", "floral", "plaid", "graphic", "textured", "embroidered", "zari", "block-print"];

let model: TensorflowModel | null = null;
let useMockFallback = false;
let failureCount = 0;

async function getModel(): Promise<TensorflowModel | null> {
  if (useMockFallback) return null;
  if (!model) {
    try {
      // Bundled locally — load model using fast-tflite
      model = await loadTensorflowModel(require("../../assets/models/garment_classifier.tflite"), []);
      failureCount = 0;
    } catch (e) {
      console.warn("TFLite native module unavailable, falling back to heuristic/mock classifier:", e);
      failureCount++;
      if (failureCount >= 3) {
        useMockFallback = true;
      }
    }
  }
  return model;
}

export async function classifyGarment(photoUri: string): Promise<GarmentClassification> {
  const net = await getModel();
  let result: GarmentClassification;

  if (!net) {
    // When native fast-tflite is unavailable (Web or simulator), run image processing for color + mock for classification
    const extractedColor = await extractDominantColor(photoUri);
    const mockRes = await classifyGarmentMock(photoUri);
    result = {
      category: mockRes.category,
      dominantColor: extractedColor || mockRes.dominantColor,
      pattern: mockRes.pattern,
      confidence: mockRes.confidence,
    };
  } else {
    try {
      const tensorInput = await preprocessImage(photoUri, { width: 224, height: 224 });
      
      const outputs = await new Promise<any[]>((resolve, reject) => {
        InteractionManager.runAfterInteractions(() => {
          try {
            resolve(net.runSync([tensorInput.buffer as ArrayBuffer]));
          } catch (err) {
            reject(err);
          }
        });
      });

      const categoryScores = new Float32Array(outputs[0]);
      const patternScores = new Float32Array(outputs[1]);
      const colorRgb = new Float32Array(outputs[2]); // [r, g, b] normalized 0-1

      const categoryIdx = argmax(categoryScores);
      const patternIdx = argmax(patternScores);

      const colorHex = outputs[2] ? rgbToHex(colorRgb) : await extractDominantColor(photoUri);

      result = {
        category: CATEGORY_LABELS[categoryIdx] || "top",
        pattern: PATTERN_LABELS[patternIdx] || "solid",
        dominantColor: colorHex,
        confidence: categoryScores[categoryIdx] ?? 0.8,
      };
      
      failureCount = 0; // reset on successful inference
    } catch (e) {
      console.error("TFLite inference failed, falling back to vision processing:", e);
      failureCount++;
      if (failureCount >= 3) {
        useMockFallback = true;
      }
      
      const extractedColor = await extractDominantColor(photoUri);
      const mockRes = await classifyGarmentMock(photoUri);
      result = {
        category: mockRes.category,
        dominantColor: extractedColor || mockRes.dominantColor,
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
        dominantColor: cloudRes.dominantColor || result.dominantColor,
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
  const [r, g, b] = Array.from(rgb).map((v) => Math.round((v ?? 0) * 255));
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;
}
