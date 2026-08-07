import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error("Database not initialized — call initDatabase() first");
  return db;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const setupDatabase = async (databaseName: string): Promise<SQLite.SQLiteDatabase> => {
      const database = await SQLite.openDatabaseAsync(databaseName);
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

        CREATE TABLE IF NOT EXISTS style_dna (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          primary_style TEXT, primary_pct REAL,
          secondary_style TEXT, secondary_pct REAL,
          accent_style TEXT, accent_pct REAL,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS outfit_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          outfit_history_id INTEGER NOT NULL REFERENCES outfit_history(id) ON DELETE CASCADE,
          wardrobe_item_id INTEGER NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS occasions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          formality_target TEXT DEFAULT 'casual',
          occasion_date INTEGER,
          outfit_history_id INTEGER REFERENCES outfit_history(id),
          created_at INTEGER DEFAULT (strftime('%s','now'))
        );

        CREATE INDEX IF NOT EXISTS idx_outfit_items_wardrobe ON outfit_items(wardrobe_item_id);
        CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit ON outfit_items(outfit_history_id);

        CREATE TABLE IF NOT EXISTS daily_checkins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mood TEXT NOT NULL,
          note TEXT,
          archetype TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_checkins_date ON daily_checkins(created_at);

        INSERT OR IGNORE INTO user_profile (id, onboarding_complete) VALUES (1, 0);
      `);

      return database;
    };

    try {
      db = await setupDatabase("chuchu.db");
      return db;
    } catch (e: any) {
      console.warn("OPFS lock or database init warning — attempting fallback:", e);
      try {
        // Fallback for browser multi-tab / hot-reload OPFS file locks
        db = await setupDatabase(`chuchu_web_${Date.now()}.db`);
        return db;
      } catch (fallbackErr) {
        console.error("Critical database setup error:", fallbackErr);
        throw e;
      }
    }
  })();

  return initPromise;
}
