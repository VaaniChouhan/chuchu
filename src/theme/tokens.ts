export const colors = {
  creamLinen: "#FAF1E4",
  creamDeep: "#F3E6D3",
  whiteSoft: "#FFFDF9",
  cocoa: "#4A3226",
  cocoaSoft: "#7A6152",
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

export const archetypeAccents = {
  dreamer: { accent: colors.rose, dark: colors.roseDark, pale: colors.rosePale },
  minimalist: { accent: colors.cocoa, dark: colors.cocoa, pale: colors.creamDeep },
  sunny: { accent: colors.gold, dark: colors.goldDark, pale: colors.goldPale },
  planner: { accent: colors.sage, dark: colors.sageDark, pale: colors.sagePale },
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
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4, // Android
  },
} as const;
