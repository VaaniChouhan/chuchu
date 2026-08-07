import { SQLiteDatabase } from "expo-sqlite";

export async function seedDummyData(db: SQLiteDatabase) {
  try {
    const itemCheck = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM wardrobe_items"
    );

    if (itemCheck && itemCheck.count > 0) {
      console.log("[Seed] Wardrobe items already exist, skipping seed.");
      return;
    }

    console.log("[Seed] Seeding dummy wardrobe items and user profile...");

    // Update user profile to onboarded state
    await db.runAsync(`
      INSERT INTO user_profile (id, archetype, onboarding_complete, height_cm, weight_kg, preferred_fit, budget_tier, skin_undertone) 
      VALUES (1, 'dreamer', 1, 172, 65, 'regular fit', 'mid budget', 'neutral') 
      ON CONFLICT(id) DO UPDATE SET 
        archetype='dreamer', 
        onboarding_complete=1,
        height_cm=172,
        weight_kg=65,
        preferred_fit='regular fit',
        budget_tier='mid budget',
        skin_undertone='neutral'
    `);

    // Insert dummy wardrobe items
    const dummyItems = [
      {
        imageUri: "asset:///seed_top_white.png",
        category: "top",
        dominantColor: "#FFFDF9",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
      {
        imageUri: "asset:///seed_top_green.png",
        category: "top",
        dominantColor: "#8FA377",
        pattern: "striped",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
      {
        imageUri: "asset:///seed_bottom_dark.png",
        category: "bottom",
        dominantColor: "#2B3A42",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
      {
        imageUri: "asset:///seed_bottom_light.png",
        category: "bottom",
        dominantColor: "#FAF1E4",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
      {
        imageUri: "asset:///seed_outerwear.png",
        category: "outerwear",
        dominantColor: "#7A6152",
        pattern: "textured",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
      {
        imageUri: "asset:///seed_shoes_white.png",
        category: "shoes",
        dominantColor: "#FFFDF9",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
      {
        imageUri: "asset:///seed_shoes_brown.png",
        category: "shoes",
        dominantColor: "#4A3226",
        pattern: "solid",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
      {
        imageUri: "asset:///seed_dress_floral.png",
        category: "dress",
        dominantColor: "#C97B84",
        pattern: "floral",
        confidenceState: "confirmed",
        lifecycleState: "active",
      },
    ];

    for (const item of dummyItems) {
      await db.runAsync(
        `INSERT INTO wardrobe_items (image_uri, category, dominant_color, pattern, confidence_state, lifecycle_state) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [item.imageUri, item.category, item.dominantColor, item.pattern, item.confidenceState, item.lifecycleState]
      );
    }

    // Insert dummy outfit history log
    // Note: seed.ts uses seconds for SQLite timestamps, unlike demoData.ts which uses milliseconds.
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 86400;

    const historyResult = await db.runAsync(
      `INSERT INTO outfit_history (item_ids, confidence, worn_at) VALUES (?, ?, ?)`,
      ['', 0.88, yesterday]
    );

    const historyId = historyResult.lastInsertRowId;
    for (const itemId of [1, 3, 6]) {
      await db.runAsync(
        `INSERT INTO outfit_items (outfit_history_id, wardrobe_item_id) VALUES (?, ?)`,
        [historyId, itemId]
      );
    }

    await db.runAsync(
      `INSERT INTO mood_logs (outfit_history_id, mood, note, logged_at) VALUES (?, 'confident', 'Felt super comfy all day!', ?)`,
      [historyId, yesterday]
    );

    console.log("[Seed] Dummy data successfully populated.");
  } catch (e) {
    console.error("[Seed] Failed to seed dummy data:", e);
  }
}
