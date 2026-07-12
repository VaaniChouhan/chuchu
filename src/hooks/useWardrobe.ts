import { useEffect, useState, useCallback } from "react";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllWardrobeItems();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, refresh: load };
}
