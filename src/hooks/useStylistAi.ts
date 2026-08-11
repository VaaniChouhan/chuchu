import { useState, useCallback } from "react";
import { WardrobeItem, findVisuallySimilarGarments } from "@/db/wardrobe.repository";
import { generateCapsuleWardrobe, CapsuleResult } from "@/ml/capsuleGenerator";
import { batchCropAndProcessGarments, BatchItemImport } from "@/ml/detector";
import { generateLocalStylistAdvice, checkLocalAiAvailability } from "@/services/ai/localAiClient";
import { recordOutfitLike, recordOutfitDislike } from "@/ml/learningEngine";

export function useStylistAi() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capsule, setCapsule] = useState<CapsuleResult | null>(null);
  const [similarItems, setSimilarItems] = useState<WardrobeItem[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  /**
   * Generates travel capsule wardrobe packing list
   */
  const createCapsule = useCallback((items: WardrobeItem[], maxItems = 8, targetDays = 7) => {
    const result = generateCapsuleWardrobe(items, maxItems, targetDays);
    setCapsule(result);
    return result;
  }, []);

  /**
   * Finds visually similar garments for a selected item using local feature vectors
   */
  const searchSimilar = useCallback(async (targetItemId: number, limit = 5) => {
    setIsProcessing(true);
    try {
      const results = await findVisuallySimilarGarments(targetItemId, limit);
      setSimilarItems(results);
      return results;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Process 1-click multi-garment photo crop batch import
   */
  const processBatchPhoto = useCallback(async (photoUri: string): Promise<BatchItemImport[]> => {
    setIsProcessing(true);
    try {
      return await batchCropAndProcessGarments(photoUri);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Ask optional zero-rate-limit local LAN Ollama AI stylist
   */
  const askLocalAi = useCallback(async (userPrompt: string): Promise<string | null> => {
    setIsProcessing(true);
    try {
      const isAvailable = await checkLocalAiAvailability();
      if (!isAvailable) {
        setAiAdvice("Local LAN AI server offline — using on-device rules engine.");
        return null;
      }
      const advice = await generateLocalStylistAdvice(userPrompt);
      setAiAdvice(advice);
      return advice;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Record implicit style preference feedback (like or dislike)
   */
  const logFeedback = useCallback((categories: string[], colors: string[], itemIds: number[], liked: boolean) => {
    if (liked) {
      recordOutfitLike(categories, colors);
    } else {
      recordOutfitDislike(itemIds);
    }
  }, []);

  /**
   * Run 5-stage reverse visual search against local closet & e-commerce catalogs (Meesho, Myntra, Ajio)
   */
  const reverseSearchPhoto = useCallback(async (photoUri: string, closetItems: WardrobeItem[] = []) => {
    setIsProcessing(true);
    try {
      const { executeReverseVisualSearch } = require("@/services/visualReverseSearchService");
      return await executeReverseVisualSearch(photoUri, closetItems);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    capsule,
    similarItems,
    aiAdvice,
    createCapsule,
    searchSimilar,
    processBatchPhoto,
    askLocalAi,
    logFeedback,
    reverseSearchPhoto,
  };
}
