export const lightColors = {
  creamLinen: "#FAF1E4",
  creamDeep: "#F3E6D3",
  whiteSoft: "#FFFDF9",
  cocoa: "#4A3226",
  cocoaSoft: "#7A6152",
  cocoaFaint: "#A8927F",
  rose: "#C97B84",
  roseDark: "#B15E68",
  rosePale: "#F3DEE1",
  sage: "#8FA377",
  sageDark: "#5F7A4C",
  sagePale: "#E4EADA",
  gold: "#E3A857",
  goldDark: "#A9762C",
  goldPale: "#FBEBD1",
  lilac: "#B79FD6",
  lilacDark: "#7C5FA3",
  lilacPale: "#EEE6F5",
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

export const typeScale = {
  greeting: 27,
  screenTitle: 20,
  cardTitle: 17,
  body: 14,
  caption: 11,
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
