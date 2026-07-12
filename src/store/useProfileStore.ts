import { create } from "zustand";
import { Archetype } from "@/theme/tokens";
import { getDb } from "@/db/schema";

interface ProfileState {
  archetype: Archetype | null;
  onboardingComplete: boolean;
  
  // Temporary fields for onboarding session state
  tempHeightCm: number | null;
  tempWeightKg: number | null;
  tempPreferredFit: string | null;
  tempBudgetTier: string | null;
  tempSkinUndertone: string | null;
  tempStyleImportSource: string | null;

  setArchetype: (a: Archetype) => void;
  setTempProfile: (data: Partial<Omit<ProfileState, 'setArchetype' | 'setTempProfile' | 'completeOnboarding' | 'hydrate'>>) => void;
  completeOnboarding: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  archetype: null,
  onboardingComplete: false,

  tempHeightCm: null,
  tempWeightKg: null,
  tempPreferredFit: null,
  tempBudgetTier: null,
  tempSkinUndertone: null,
  tempStyleImportSource: null,

  setArchetype: (a) => set({ archetype: a }),
  setTempProfile: (data) => set((state) => ({ ...state, ...data })),

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
        "SELECT archetype, onboarding_complete, height_cm, weight_kg, preferred_fit, budget_tier, skin_undertone, style_import_source FROM user_profile WHERE id = 1"
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
        });
      }
    } catch (e) {
      console.warn("Failed to hydrate profile store from SQLite:", e);
    }
  },
}));
