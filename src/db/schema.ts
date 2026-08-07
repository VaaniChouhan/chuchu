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
      style_import_source TEXT
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
  `);

  // Version-tracked migrations
  const userVersionRow = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = userVersionRow?.user_version ?? 0;

  if (currentVersion < 1) {
    try {
      const histories = await db.getAllAsync<{ id: number; item_ids: string }>(
        "SELECT id, item_ids FROM outfit_history"
      );
      for (const history of histories) {
        try {
          const itemIds: number[] = JSON.parse(history.item_ids);
          for (const itemId of itemIds) {
            await db.runAsync(
              "INSERT OR IGNORE INTO outfit_items (outfit_history_id, wardrobe_item_id) VALUES (?, ?)",
              [history.id, itemId]
            );
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Migration 1 warning:", e);
    }
    await db.execAsync("PRAGMA user_version = 1");
  }

  if (currentVersion < 2) {
    // Run each ALTER individually so already-existing columns don't block others
    const migration2Alters = [
      "ALTER TABLE user_profile ADD COLUMN is_adult_confirmed INTEGER DEFAULT 0",
      "ALTER TABLE wishlist_items ADD COLUMN source_url TEXT",
      "ALTER TABLE wishlist_items ADD COLUMN retailer TEXT",
      "ALTER TABLE wishlist_items ADD COLUMN price REAL",
      "ALTER TABLE wishlist_items ADD COLUMN image_url TEXT",
      "ALTER TABLE wardrobe_items ADD COLUMN formality TEXT DEFAULT 'casual'",
    ];
    for (const sql of migration2Alters) {
      try {
        await db.execAsync(sql);
      } catch (e) {
        // Column likely already exists on fresh install — safe to ignore
      }
    }
    await db.execAsync("PRAGMA user_version = 2");
  }

  if (currentVersion < 3) {
    const migration3Alters = [
      "ALTER TABLE user_profile ADD COLUMN theme_override TEXT DEFAULT 'system'",
      "ALTER TABLE user_profile ADD COLUMN implicit_learning INTEGER DEFAULT 1",
      "ALTER TABLE user_profile ADD COLUMN cloud_backup INTEGER DEFAULT 0",
      "ALTER TABLE user_profile ADD COLUMN telemetry INTEGER DEFAULT 0",
    ];
    for (const sql of migration3Alters) {
      try {
        await db.execAsync(sql);
      } catch (e) {
        // Column likely already exists — safe to ignore
      }
    }
    await db.execAsync("PRAGMA user_version = 3");
  }

  if (currentVersion < 4) {
    try {
      await db.execAsync(`
        CREATE TABLE outfit_history_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_ids TEXT,
          confidence REAL,
          worn_at INTEGER DEFAULT (strftime('%s','now'))
        );
        INSERT INTO outfit_history_new (id, item_ids, confidence, worn_at)
        SELECT id, item_ids, confidence, worn_at FROM outfit_history;
        DROP TABLE outfit_history;
        ALTER TABLE outfit_history_new RENAME TO outfit_history;
      `);
    } catch (e) {
      console.warn("Migration 4 outfit_history warning:", e);
    }

    try {
      await db.execAsync("ALTER TABLE wardrobe_items ADD COLUMN updated_at INTEGER DEFAULT (strftime('%s','now'))");
    } catch (e) {
      // Column likely exists
    }

    try {
      await db.execAsync(`
        CREATE TRIGGER IF NOT EXISTS trg_wardrobe_updated_at 
        AFTER UPDATE ON wardrobe_items 
        BEGIN 
          UPDATE wardrobe_items SET updated_at = strftime('%s','now') WHERE id = NEW.id; 
        END;
      `);
    } catch (e) {
      console.warn("Migration 4 trigger warning:", e);
    }

    await db.execAsync("PRAGMA user_version = 4");
  }

  // Seed default user profile row if not exists
  await db.runAsync(`
    INSERT OR IGNORE INTO user_profile (id, onboarding_complete) VALUES (1, 0)
  `);

  // Populate dummy data if DB is fresh
  const { seedDummyData } = require("./seed");
  await seedDummyData(db);

  return db;
}
