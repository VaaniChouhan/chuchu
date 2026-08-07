import { create } from "zustand";
import { Archetype } from "@/theme/tokens";
import { getDb } from "@/db/schema";

export type ThemeOverride = "light" | "dark" | "system";

interface ProfileState {
  archetype: Archetype | null;
  onboardingComplete: boolean;
  isHydrated: boolean;

  // User preferences (persisted to SQLite)
  themeOverride: ThemeOverride;
  implicitLearning: boolean;
  cloudBackup: boolean;
  telemetry: boolean;

  // Temporary fields for onboarding session state
  tempHeightCm: number | null;
  tempWeightKg: number | null;
  tempPreferredFit: string | null;
  tempBudgetTier: string | null;
  tempSkinUndertone: string | null;
  tempStyleImportSource: string | null;

  setArchetype: (a: Archetype) => void;
  setTempProfile: (data: Partial<Omit<ProfileState, 'setArchetype' | 'setTempProfile' | 'completeOnboarding' | 'hydrate' | 'setThemeOverride' | 'setPreference'>>) => void;
  setThemeOverride: (theme: ThemeOverride) => void;
  setPreference: (key: "implicitLearning" | "cloudBackup" | "telemetry", value: boolean) => void;
  completeOnboarding: () => Promise<void>;
  hydrate: () => Promise<void>;
}

/**
 * Profile store schema version: 1.
 * Persistence for this store is managed via SQLite (`user_profile` table in `src/db/schema.ts`).
 * Schema migrations are handled in SQLite via `PRAGMA user_version`.
 */
export const PROFILE_STORE_VERSION = 1;

/**
 * Zustand Profile Store (Version 1).
 * Custom async persistence via SQLite `hydrate()` and `db.runAsync()` instead of Zustand's `persist` middleware.
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  archetype: null,
  onboardingComplete: false,
  isHydrated: false,

  themeOverride: "system",
  implicitLearning: true,
  cloudBackup: false,
  telemetry: false,

  tempHeightCm: null,
  tempWeightKg: null,
  tempPreferredFit: null,
  tempBudgetTier: null,
  tempSkinUndertone: null,
  tempStyleImportSource: null,

  setArchetype: (a) => set({ archetype: a }),
  setTempProfile: (data) => set((state) => ({ ...state, ...data })),

  setThemeOverride: (theme) => {
    set({ themeOverride: theme });
    // Persist to SQLite asynchronously
    try {
      const db = getDb();
      db.runAsync(
        "UPDATE user_profile SET theme_override = ? WHERE id = 1",
        [theme]
      ).catch((e) => console.warn("Failed to persist theme override:", e));
    } catch (e) {
      console.warn("DB not ready for theme persistence:", e);
    }
  },

  setPreference: (key, value) => {
    set({ [key]: value });
    // Persist to SQLite asynchronously
    const colMap: Record<string, string> = {
      implicitLearning: "implicit_learning",
      cloudBackup: "cloud_backup",
      telemetry: "telemetry",
    };
    try {
      const db = getDb();
      db.runAsync(
        `UPDATE user_profile SET ${colMap[key]} = ? WHERE id = 1`,
        [value ? 1 : 0]
      ).catch((e) => console.warn("Failed to persist preference:", e));
    } catch (e) {
      console.warn("DB not ready for preference persistence:", e);
    }
  },

  completeOnboarding: async () => {
    try {
      const db = getDb();
      const s = get();
      
      // Batch write all onboarding data to user_profile at the end of the flow
      await db.runAsync(
        `INSERT INTO user_profile (id, archetype, onboarding_complete, height_cm, weight_kg, preferred_fit, budget_tier, skin_undertone, style_import_source) 
         VALUES (1, ?, 1, ?, ?, ?, ?, ?, ?) 
         ON CONFLICT(id) DO UPDATE SET 
           archetype=excluded.archetype, 
           onboarding_complete=1,
           height_cm=excluded.height_cm,
           weight_kg=excluded.weight_kg,
           preferred_fit=excluded.preferred_fit,
           budget_tier=excluded.budget_tier,
           skin_undertone=excluded.skin_undertone,
           style_import_source=excluded.style_import_source`,
        [
          s.archetype,
          s.tempHeightCm,
          s.tempWeightKg,
          s.tempPreferredFit,
          s.tempBudgetTier,
          s.tempSkinUndertone,
          s.tempStyleImportSource,
        ]
      );
      
      set({ onboardingComplete: true });
    } catch (e) {
      console.error("Failed to complete onboarding in SQLite:", e);
    }
  },

  hydrate: async () => {
    try {
      const db = getDb();
      const row = await db.getFirstAsync<any>(
        `SELECT archetype, onboarding_complete, height_cm, weight_kg, preferred_fit, 
                budget_tier, skin_undertone, style_import_source,
                theme_override, implicit_learning, cloud_backup, telemetry
         FROM user_profile WHERE id = 1`
      );
      if (row) {
        set({
          archetype: row.archetype as Archetype | null,
          onboardingComplete: row.onboarding_complete === 1,
          tempHeightCm: row.height_cm,
          tempWeightKg: row.weight_kg,
          tempPreferredFit: row.preferred_fit,
          tempBudgetTier: row.budget_tier,
          tempSkinUndertone: row.skin_undertone,
          tempStyleImportSource: row.style_import_source,
          themeOverride: row.theme_override ?? "system",
          implicitLearning: row.implicit_learning !== 0,
          cloudBackup: row.cloud_backup === 1,
          telemetry: row.telemetry === 1,
        });
      }
    } catch (e) {
      console.warn("Failed to hydrate profile store from SQLite:", e);
    } finally {
      // Always mark as hydrated even on error, so app doesn't hang
      set({ isHydrated: true });
    }
  },
}));
