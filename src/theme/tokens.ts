export const lightColors = {
  creamLinen: "#FFFBF2",
  creamDeep: "#FFE6C9",
  whiteSoft: "#FFFFFF",
  cocoa: "#2D1E18",
  cocoaSoft: "#59443B",
  cocoaFaint: "#9C8A81",
  rose: "#FF6B81",
  roseDark: "#E0485E",
  rosePale: "#FFEBF0",
  sage: "#2ED573",
  sageDark: "#1EAC53",
  sagePale: "#E8FBF0",
  gold: "#FFC048",
  goldDark: "#E19C19",
  goldPale: "#FFF8E7",
  lilac: "#A55EEA",
  lilacDark: "#8854D0",
  lilacPale: "#F5EEFD",
} as const;

export const darkColors = {
  creamLinen: "#1C1815",
  creamDeep: "#2A2420",
  whiteSoft: "#241F1B",
  cocoa: "#F5EBE6",
  cocoaSoft: "#C5B7AD",
  cocoaFaint: "#85776E",
  rose: "#E28B95",
  roseDark: "#EC9CA5",
  rosePale: "#3D2326",
  sage: "#9EB586",
  sageDark: "#B0C599",
  sagePale: "#23301D",
  gold: "#EBB669",
  goldDark: "#F2C883",
  goldPale: "#382B18",
  lilac: "#C6B3DF",
  lilacDark: "#D6C6EC",
  lilacPale: "#2E2138",
} as const;

export const colors = lightColors;

export function getThemeColors(scheme: "light" | "dark" = "light") {
  return scheme === "dark" ? darkColors : lightColors;
}

export const archetypeAccents = {
  dreamer: { accent: colors.rose, dark: colors.roseDark, pale: colors.rosePale, name: "The Homebody Romantic" },
  minimalist: { accent: colors.cocoa, dark: colors.cocoa, pale: colors.creamDeep, name: "The Quiet Minimalist" },
  sunny: { accent: colors.gold, dark: colors.goldDark, pale: colors.goldPale, name: "The Sunny Optimist" },
  planner: { accent: colors.sage, dark: colors.sageDark, pale: colors.sagePale, name: "The Cozy Planner" },
} as const;

export type Archetype = keyof typeof archetypeAccents;

/**
 * Mathematical Typography Scale & System Font Stacks
 * Based on 1.200 Minor Third typographic scale & System Humanist font fallbacks.
 */
export const fontFamilies = {
  display: 'Fraunces-SemiBold, Georgia, "Times New Roman", serif',
  displayMedium: 'Fraunces-Medium, Georgia, serif',
  bodyBold: 'Nunito-Bold, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  bodySemiBold: 'Nunito-SemiBold, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  bodyRegular: 'Nunito-Regular, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, "Cascadia Code", Menlo, Consolas, monospace',
} as const;

export const typeScale = {
  hero: 34,
  greeting: 28,
  screenTitle: 22,
  sectionHeader: 18,
  cardTitle: 16,
  body: 14,
  subtext: 13,
  caption: 11,
} as const;

export const lineHeights = {
  tight: 1.15,
  heading: 1.25,
  body: 1.5,
  relaxed: 1.65,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.4,
  caps: 1.1,
} as const;

export const radius = { lg: 28, md: 18, sm: 12 } as const;

export const shadow = {
  soft: {
    shadowColor: colors.cocoa,
    shadowOpacity: 0.11,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4, // Android
  },
  lift: {
    shadowColor: colors.cocoa,
    shadowOpacity: 0.16,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6, // Android
  },
} as const;

export const glass = {
  card: {
    backgroundColor: "rgba(255, 251, 242, 0.90)",
    borderWidth: 1.5,
    borderColor: "rgba(244, 227, 193, 0.8)",
  },
  header: {
    backgroundColor: "rgba(250, 244, 235, 0.92)",
    borderBottomWidth: 1,
    borderColor: "rgba(235, 222, 204, 0.6)",
  },
} as const;
