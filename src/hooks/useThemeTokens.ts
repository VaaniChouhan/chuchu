import { colors as lightColors, darkColors } from "@/theme/tokens";
import { useColorScheme } from "@/hooks/use-color-scheme";

/**
 * Custom hook that returns the active color palette based on current theme preference
 * (light mode vs dark mode). Fully preserves ChuChu's warm cream/cocoa aesthetic.
 */
export function useThemeTokens() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    scheme,
  };
}
