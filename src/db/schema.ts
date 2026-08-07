import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export interface ChuChuDb {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: any[]): Promise<T[]>;
}

let activeDb: ChuChuDb | null = null;
let initPromise: Promise<ChuChuDb> | null = null;

export function getDb(): ChuChuDb {
  if (!activeDb) throw new Error("Database not initialized — call initDatabase() first");
  return activeDb;
}

class WebStorageDatabase implements ChuChuDb {
  private profile: any = { id: 1, onboarding_complete: 0, archetype: "sunny" };
  private wardrobeItems: any[] = [];
  private wishlistItems: any[] = [];
  private outfitHistory: any[] = [];
  private moodLogs: any[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const p = localStorage.getItem("chuchu_profile");
        if (p) this.profile = JSON.parse(p);

        const w = localStorage.getItem("chuchu_wardrobe");
        if (w) this.wardrobeItems = JSON.parse(w);

        const wl = localStorage.getItem("chuchu_wishlist");
        if (wl) this.wishlistItems = JSON.parse(wl);

        const h = localStorage.getItem("chuchu_history");
        if (h) this.outfitHistory = JSON.parse(h);

        const m = localStorage.getItem("chuchu_moods");
        if (m) this.moodLogs = JSON.parse(m);
      }
    } catch (e) {
      console.warn("LocalStorage load error:", e);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("chuchu_profile", JSON.stringify(this.profile));
        localStorage.setItem("chuchu_wardrobe", JSON.stringify(this.wardrobeItems));
        localStorage.setItem("chuchu_wishlist", JSON.stringify(this.wishlistItems));
        localStorage.setItem("chuchu_history", JSON.stringify(this.outfitHistory));
        localStorage.setItem("chuchu_moods", JSON.stringify(this.moodLogs));
      }
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }

  async execAsync(sql: string): Promise<void> {
    // Schema creation no-op for web storage
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    const s = sql.toLowerCase();
    const lastInsertRowId = Date.now();

    if (s.includes("user_profile")) {
      if (s.includes("height_cm")) {
        this.profile.height_cm = params[0];
        this.profile.weight_kg = params[1];
        this.profile.preferred_fit = params[2];
      }
      this.saveToStorage();
      return { lastInsertRowId: 1, changes: 1 };
    }

    if (s.includes("insert into wardrobe_items")) {
      const item = {
        id: lastInsertRowId,
        image_uri: params[0],
        category: params[1],
        dominant_color: params[2],
        pattern: params[3],
        confidence_state: params[4] || "confirmed",
        lifecycle_state: "active",
        created_at: Math.floor(Date.now() / 1000),
      };
      this.wardrobeItems.push(item);
      this.saveToStorage();
      return { lastInsertRowId: item.id, changes: 1 };
    }

    if (s.includes("update wardrobe_items set lifecycle_state")) {
      const [state, id] = params;
      const item = this.wardrobeItems.find((i) => i.id === id);
      if (item) item.lifecycle_state = state;
      this.saveToStorage();
      return { lastInsertRowId: id, changes: 1 };
    }

    if (s.includes("delete from wardrobe_items")) {
      const [id] = params;
      this.wardrobeItems = this.wardrobeItems.filter((i) => i.id !== id);
      this.saveToStorage();
      return { lastInsertRowId: id, changes: 1 };
    }

    if (s.includes("insert into wishlist_items")) {
      const item = {
        id: lastInsertRowId,
        title: params[0],
        gap_reason: params[1],
        status: params[2] || "saved",
        source_url: params[3],
        retailer: params[4],
        price: params[5],
        image_url: params[6],
        created_at: Math.floor(Date.now() / 1000),
      };
      this.wishlistItems.push(item);
      this.saveToStorage();
      return { lastInsertRowId: item.id, changes: 1 };
    }

    if (s.includes("update wishlist_items set status")) {
      const [status, id] = params;
      const item = this.wishlistItems.find((i) => i.id === id);
      if (item) item.status = status;
      this.saveToStorage();
      return { lastInsertRowId: id, changes: 1 };
    }

    if (s.includes("delete from wishlist_items")) {
      const [id] = params;
      this.wishlistItems = this.wishlistItems.filter((i) => i.id !== id);
      this.saveToStorage();
      return { lastInsertRowId: id, changes: 1 };
    }

    if (s.includes("insert into outfit_history")) {
      const history = {
        id: lastInsertRowId,
        item_ids: params[0],
        confidence: params[1],
        worn_at: Math.floor(Date.now() / 1000),
      };
      this.outfitHistory.push(history);
      this.saveToStorage();
      return { lastInsertRowId: history.id, changes: 1 };
    }

    if (s.includes("insert into mood_logs")) {
      const log = {
        id: lastInsertRowId,
        outfit_history_id: params[0],
        mood: params[1],
        note: params[2],
        logged_at: Math.floor(Date.now() / 1000),
      };
      this.moodLogs.push(log);
      this.saveToStorage();
      return { lastInsertRowId: log.id, changes: 1 };
    }

    return { lastInsertRowId: 1, changes: 0 };
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const all = await this.getAllAsync<T>(sql, params);
    return all.length > 0 ? all[0] : null;
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const s = sql.toLowerCase();

    if (s.includes("user_profile")) {
      return [this.profile as T];
    }

    if (s.includes("wardrobe_items")) {
      let result = [...this.wardrobeItems];
      if (s.includes("lifecycle_state = 'active'")) {
        result = result.filter((i) => i.lifecycle_state === "active");
      } else if (s.includes("id = ?")) {
        result = result.filter((i) => i.id === params[0]);
      }
      return result as T[];
    }

    if (s.includes("wishlist_items")) {
      return [...this.wishlistItems] as T[];
    }

    if (s.includes("outfit_history")) {
      return [...this.outfitHistory] as T[];
    }

    if (s.includes("mood_logs")) {
      return [...this.moodLogs] as T[];
    }

    return [];
  }
}

export async function initDatabase(): Promise<ChuChuDb> {
  if (activeDb) return activeDb;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (Platform.OS === "web") {
      try {
        const database = await SQLite.openDatabaseAsync("chuchu.db");
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS user_profile (id INTEGER PRIMARY KEY CHECK (id = 1), onboarding_complete INTEGER DEFAULT 0);
          CREATE TABLE IF NOT EXISTS wardrobe_items (id INTEGER PRIMARY KEY AUTOINCREMENT, image_uri TEXT NOT NULL, category TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS outfit_history (id INTEGER PRIMARY KEY AUTOINCREMENT, item_ids TEXT);
          CREATE TABLE IF NOT EXISTS mood_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, mood TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS wishlist_items (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL);
        `);
        activeDb = database as unknown as ChuChuDb;
        return activeDb;
      } catch (opfsError) {
        console.warn("OPFS browser lock detected — activating WebStorage fallback driver:", opfsError);
        activeDb = new WebStorageDatabase();
        return activeDb;
      }
    }

    // Native iOS & Android
    try {
      const database = await SQLite.openDatabaseAsync("chuchu.db");
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          archetype TEXT,
          onboarding_complete INTEGER DEFAULT 0,
          is_adult_confirmed INTEGER DEFAULT 0,
          height_cm REAL,
          weight_kg REAL,
          preferred_fit TEXT,
          budget_tier TEXT,
          skin_undertone TEXT,
          style_import_source TEXT,
          theme_override TEXT DEFAULT 'system',
          implicit_learning INTEGER DEFAULT 1,
          cloud_backup INTEGER DEFAULT 0,
          telemetry INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS wardrobe_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image_uri TEXT NOT NULL,
          category TEXT NOT NULL,
          dominant_color TEXT,
          pattern TEXT,
          formality TEXT DEFAULT 'casual',
          confidence_state TEXT DEFAULT 'ai_detected',
          lifecycle_state TEXT DEFAULT 'active',
          created_at INTEGER DEFAULT (strftime('%s','now'))
        );

        CREATE TABLE IF NOT EXISTS outfit_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_ids TEXT,
          confidence REAL,
          worn_at INTEGER DEFAULT (strftime('%s','now'))
        );

        CREATE TABLE IF NOT EXISTS mood_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          outfit_history_id INTEGER REFERENCES outfit_history(id),
          mood TEXT NOT NULL,
          note TEXT,
          logged_at INTEGER DEFAULT (strftime('%s','now'))
        );

        CREATE TABLE IF NOT EXISTS wishlist_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          gap_reason TEXT,
          status TEXT DEFAULT 'saved',
          source_url TEXT,
          retailer TEXT,
          price REAL,
          image_url TEXT,
          created_at INTEGER DEFAULT (strftime('%s','now'))
        );

        INSERT OR IGNORE INTO user_profile (id, onboarding_complete) VALUES (1, 0);
      `);

      activeDb = database as unknown as ChuChuDb;
      return activeDb;
    } catch (nativeErr) {
      console.error("Native SQLite init error:", nativeErr);
      activeDb = new WebStorageDatabase();
      return activeDb;
    }
  })();

  return initPromise;
}
