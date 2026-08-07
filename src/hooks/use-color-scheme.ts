import { useColorScheme as useRNColorScheme } from "react-native";
import { useProfileStore } from "@/store/useProfileStore";

/**
 * Returns the effective color scheme, respecting the user's theme override setting.
 * - "system" → follows device setting
 * - "light" / "dark" → forced override
 */
export function useColorScheme() {
  const systemScheme = useRNColorScheme();
  const themeOverride = useProfileStore((s) => s.themeOverride);

  if (themeOverride === "light" || themeOverride === "dark") {
    return themeOverride;
  }

  // "system" or unset → use device preference
  return systemScheme ?? "light";
}
