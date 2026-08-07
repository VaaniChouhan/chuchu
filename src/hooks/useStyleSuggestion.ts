import { useEffect, useState, useCallback, useRef } from "react";
import { getAllWardrobeItems } from "@/db/wardrobe.repository";
import { generateOutfitSuggestion, Outfit } from "@/ml/styleEngine";
import { fetchCurrentWeather, WeatherContext } from "@/services/weather";

export function useStyleSuggestion() {
  const [suggestion, setSuggestion] = useState<Outfit | null>(null);
  const [weather, setWeather] = useState<WeatherContext | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const generate = useCallback(async (seed = 0) => {
    setLoading(true);
    try {
      const items = await getAllWardrobeItems().catch(() => []);
      const weatherData = await fetchCurrentWeather().catch(() => null);
      if (!isMountedRef.current) return;
      setWeather(weatherData);
      setSuggestion(generateOutfitSuggestion(items, seed, weatherData ?? undefined));
    } catch (err) {
      console.warn("Failed to generate style suggestion:", err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    isMountedRef.current = true;

    (async () => {
      setLoading(true);
      try {
        const items = await getAllWardrobeItems().catch(() => []);
        const weatherData = await fetchCurrentWeather().catch(() => null);
        if (!isMounted) return;
        setWeather(weatherData);
        setSuggestion(generateOutfitSuggestion(items, 0, weatherData ?? undefined));
      } catch (err) {
        console.warn("Failed to fetch style suggestions on mount:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      isMountedRef.current = false;
    };
  }, []);

  return { suggestion, weather, loading, refresh: generate };
}
