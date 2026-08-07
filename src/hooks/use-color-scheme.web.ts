import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useProfileStore } from "@/store/useProfileStore";

/**
 * Web version: handles SSR hydration + user theme override.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemScheme = useRNColorScheme();
  const themeOverride = useProfileStore((s) => s.themeOverride);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return "light";
  }

  if (themeOverride === "light" || themeOverride === "dark") {
    return themeOverride;
  }

  return systemScheme ?? "light";
}
