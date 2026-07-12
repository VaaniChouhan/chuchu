import { useEffect, useState, useCallback } from "react";
import { getAllWardrobeItems } from "@/db/wardrobe.repository";
import { generateOutfitSuggestion, Outfit } from "@/ml/styleEngine";

export function useStyleSuggestion() {
  const [suggestion, setSuggestion] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    const items = await getAllWardrobeItems();
    setSuggestion(generateOutfitSuggestion(items));
    setLoading(false);
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  return { suggestion, loading, refresh: generate };
}
