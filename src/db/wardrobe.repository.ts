import { getDb } from "./schema";

export interface WardrobeItem {
  id: number;
  imageUri: string;
  category: string;
  dominantColor: string;
  pattern: string;
  confidenceState: "ai_detected" | "confirmed" | "needs_review";
  lifecycleState: "active" | "archived" | "donated" | "sold";
  createdAt: number;
}

interface NewWardrobeItem {
  imageUri: string;
  category: string;
  dominantColor: string;
  pattern: string;
  confidenceState?: "ai_detected" | "confirmed" | "needs_review";
  lifecycleState?: "active" | "archived" | "donated" | "sold";
}

export async function addWardrobeItem(item: NewWardrobeItem): Promise<number> {
  const db = getDb();
  const confidence = item.confidenceState ?? "ai_detected";
  const lifecycle = item.lifecycleState ?? "active";
  const result = await db.runAsync(
    `INSERT INTO wardrobe_items (image_uri, category, dominant_color, pattern, confidence_state, lifecycle_state) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [item.imageUri, item.category, item.dominantColor, item.pattern, confidence, lifecycle]
  );
  return result.lastInsertRowId;
}

export async function getWardrobeItem(id: number): Promise<WardrobeItem | null> {
  const db = getDb();
  const row = await db.getFirstAsync<any>(
    `SELECT id, image_uri as imageUri, category, dominant_color as dominantColor, pattern, 
            confidence_state as confidenceState, lifecycle_state as lifecycleState, created_at as createdAt
     FROM wardrobe_items WHERE id = ?`,
    [id]
  );
  return row ?? null;
}

export async function getAllWardrobeItems(includeAllLifecycles = false): Promise<WardrobeItem[]> {
  const db = getDb();
  const query = includeAllLifecycles
    ? `SELECT id, image_uri as imageUri, category, dominant_color as dominantColor, pattern, 
              confidence_state as confidenceState, lifecycle_state as lifecycleState, created_at as createdAt
       FROM wardrobe_items ORDER BY created_at DESC`
    : `SELECT id, image_uri as imageUri, category, dominant_color as dominantColor, pattern, 
              confidence_state as confidenceState, lifecycle_state as lifecycleState, created_at as createdAt
       FROM wardrobe_items WHERE lifecycle_state = 'active' ORDER BY created_at DESC`;
  
  return db.getAllAsync<WardrobeItem>(query);
}

export async function deleteWardrobeItem(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM wardrobe_items WHERE id = ?`, [id]);
}

export async function setLifecycleState(id: number, state: "active" | "archived" | "donated" | "sold"): Promise<void> {
  const db = getDb();
  await db.runAsync(`UPDATE wardrobe_items SET lifecycle_state = ? WHERE id = ?`, [state, id]);
}

export async function getItemUsageStats(itemId: number): Promise<{ wornThisMonth: number; daysSinceLastWorn: number | null }> {
  const db = getDb();
  // Fetch all worn outfits where this item is in the JSON array of item_ids
  const rows = await db.getAllAsync<{ worn_at: number; item_ids: string }>(
    `SELECT worn_at, item_ids FROM outfit_history ORDER BY worn_at DESC`
  );

  let wornThisMonth = 0;
  let lastWornAt: number | null = null;
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  for (const row of rows) {
    try {
      const ids: number[] = JSON.parse(row.item_ids);
      if (ids.includes(itemId)) {
        if (row.worn_at >= thirtyDaysAgo) {
          wornThisMonth++;
        }
        if (lastWornAt === null || row.worn_at > lastWornAt) {
          lastWornAt = row.worn_at;
        }
      }
    } catch (e) {
      // Ignore parse errors if data is corrupted or differently formatted
    }
  }

  const daysSinceLastWorn = lastWornAt !== null
    ? Math.max(0, Math.floor((now - lastWornAt) / (24 * 60 * 60)))
    : null;

  return { wornThisMonth, daysSinceLastWorn };
}
