import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SessionState {
  sessionId: string;
  hasCompletedOnboarding: boolean;
  lastActiveTimestamp: number;
  userId: string;
  userEmail: string | null;

  setHasCompletedOnboarding: (status: boolean) => void;
  updateLastActive: () => void;
  setUserSession: (userId: string, email?: string | null) => void;
  resetSession: () => void;
}

// Memory fallback storage for Web / Jest environments where NativeModule is null
const memoryStorage: Record<string, string> = {};

const getNativeAsyncStorage = () => {
  try {
    const mod = require("@react-native-async-storage/async-storage");
    return mod.default || mod;
  } catch {
    return null;
  }
};

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key) ?? memoryStorage[key] ?? null;
      }
      const storage = getNativeAsyncStorage();
      if (storage && typeof storage.getItem === "function") {
        const val = await storage.getItem(key);
        return val ?? memoryStorage[key] ?? null;
      }
    } catch {}
    return memoryStorage[key] ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStorage[key] = value;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      const storage = getNativeAsyncStorage();
      if (storage && typeof storage.setItem === "function") {
        await storage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    delete memoryStorage[key];
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      const storage = getNativeAsyncStorage();
      if (storage && typeof storage.removeItem === "function") {
        await storage.removeItem(key);
      }
    } catch {}
  },
};

/**
 * Local Session Store.
 * Persists session ID, onboarding completion status, and user identifiers locally via AsyncStorage & localStorage.
 * Ensures the user only goes through onboarding ONCE and returns directly to Home.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      hasCompletedOnboarding: false,
      lastActiveTimestamp: Date.now(),
      userId: "local_user_1",
      userEmail: null,

      setHasCompletedOnboarding: (status: boolean) =>
        set({ hasCompletedOnboarding: status, lastActiveTimestamp: Date.now() }),

      updateLastActive: () => set({ lastActiveTimestamp: Date.now() }),

      setUserSession: (userId: string, email: string | null = null) =>
        set({ userId, userEmail: email, lastActiveTimestamp: Date.now() }),

      resetSession: () =>
        set({
          hasCompletedOnboarding: false,
          userEmail: null,
          lastActiveTimestamp: Date.now(),
        }),
    }),
    {
      name: "chuchu_user_session_v1",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
