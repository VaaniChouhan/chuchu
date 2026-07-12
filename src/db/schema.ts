import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error("Database not initialized — call initDatabase() first");
  return db;
}

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync("chuchu.db");

  // Re-create tables with updated schema for V0
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      archetype TEXT,
      onboarding_complete INTEGER DEFAULT 0,
      height_cm REAL,
      weight_kg REAL,
      preferred_fit TEXT,
      budget_tier TEXT,
      skin_undertone TEXT,
      style_import_source TEXT
    );

    CREATE TABLE IF NOT EXISTS wardrobe_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_uri TEXT NOT NULL,
      category TEXT NOT NULL,
      dominant_color TEXT,
      pattern TEXT,
      confidence_state TEXT DEFAULT 'ai_detected',
      lifecycle_state TEXT DEFAULT 'active',
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS outfit_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_ids TEXT NOT NULL,
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
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS style_dna (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      primary_style TEXT, primary_pct REAL,
      secondary_style TEXT, secondary_pct REAL,
      accent_style TEXT, accent_pct REAL,
      updated_at INTEGER
    );
  `);

  // Migration step: ensure new columns exist if tables already existed
  try {
    await db.execAsync(`
      ALTER TABLE wardrobe_items ADD COLUMN confidence_state TEXT DEFAULT 'ai_detected';
    `);
  } catch (e) {}

  try {
    await db.execAsync(`
      ALTER TABLE wardrobe_items ADD COLUMN lifecycle_state TEXT DEFAULT 'active';
    `);
  } catch (e) {}

  try {
    await db.execAsync(`
      ALTER TABLE outfit_history ADD COLUMN confidence REAL;
    `);
  } catch (e) {}

  // Seed default user profile row if not exists
  await db.runAsync(`
    INSERT OR IGNORE INTO user_profile (id, onboarding_complete) VALUES (1, 0)
  `);

  return db;
}
