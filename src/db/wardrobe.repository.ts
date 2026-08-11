import { getDb } from "./schema";

export interface WardrobeItem {
  id: number;
  imageUri: string;
  category: string;
  dominantColor?: string;
  pattern?: string;
  confidenceState: "ai_detected" | "user_edited" | "needs_review" | "confirmed";
  lifecycleState: "active" | "archived" | "donated" | "sold";
  createdAt: number;
  lastWornAt?: number | null;
  wearCount?: number;
  embedding?: string;
}

export interface NewWardrobeItem {
  imageUri: string;
  category: string;
  dominantColor?: string;
  pattern?: string;
  confidenceState?: "ai_detected" | "user_edited" | "needs_review" | "confirmed";
  embedding?: string;
}

export async function addWardrobeItem(item: NewWardrobeItem): Promise<number> {
  const db = getDb();
  const result = await db.runAsync(
    `INSERT INTO wardrobe_items (image_uri, category, dominant_color, pattern, confidence_state, lifecycle_state)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [
      item.imageUri,
      item.category,
      item.dominantColor ?? null,
      item.pattern ?? null,
      item.confidenceState ?? "needs_review",
    ]
  );
  return result.lastInsertRowId;
}

export async function getAllWardrobeItems(includeArchived = false): Promise<WardrobeItem[]> {
  const db = getDb();
  const query = includeArchived
    ? `SELECT w.*, MAX(oh.worn_at) as last_worn_at, COUNT(oh.id) as wear_count
       FROM wardrobe_items w
       LEFT JOIN outfit_items oi ON w.id = oi.wardrobe_item_id
       LEFT JOIN outfit_history oh ON oi.outfit_history_id = oh.id
       GROUP BY w.id
       ORDER BY w.created_at DESC`
    : `SELECT w.*, MAX(oh.worn_at) as last_worn_at, COUNT(oh.id) as wear_count
       FROM wardrobe_items w
       LEFT JOIN outfit_items oi ON w.id = oi.wardrobe_item_id
       LEFT JOIN outfit_history oh ON oi.outfit_history_id = oh.id
       WHERE w.lifecycle_state = 'active'
       GROUP BY w.id
       ORDER BY w.created_at DESC`;

  const rows = await db.getAllAsync<any>(query);

  // Map snake_case DB columns to camelCase TypeScript properties
  return rows.map((r) => ({
    id: r.id,
    imageUri: r.image_uri,
    category: r.category,
    dominantColor: r.dominant_color,
    pattern: r.pattern,
    confidenceState: r.confidence_state,
    lifecycleState: r.lifecycle_state,
    createdAt: r.created_at,
    lastWornAt: r.last_worn_at,
    wearCount: r.wear_count,
  }));
}

export async function getWardrobeItem(id: number): Promise<WardrobeItem | null> {
  const db = getDb();
  const r = await db.getFirstAsync<any>("SELECT * FROM wardrobe_items WHERE id = ?", [id]);
  if (!r) return null;
  return {
    id: r.id,
    imageUri: r.image_uri,
    category: r.category,
    dominantColor: r.dominant_color,
    pattern: r.pattern,
    confidenceState: r.confidence_state,
    lifecycleState: r.lifecycle_state,
    createdAt: r.created_at,
  };
}

export async function setLifecycleState(id: number, state: WardrobeItem["lifecycleState"]): Promise<void> {
  const db = getDb();
  await db.runAsync("UPDATE wardrobe_items SET lifecycle_state = ? WHERE id = ?", [state, id]);
}

export async function deleteWardrobeItem(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync("DELETE FROM wardrobe_items WHERE id = ?", [id]);
}

export async function updateWardrobeItem(id: number, updates: Partial<WardrobeItem>): Promise<void> {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.category !== undefined) {
    fields.push("category = ?");
    values.push(updates.category);
  }
  if (updates.dominantColor !== undefined) {
    fields.push("dominant_color = ?");
    values.push(updates.dominantColor);
  }
  if (updates.pattern !== undefined) {
    fields.push("pattern = ?");
    values.push(updates.pattern);
  }
  if (updates.confidenceState !== undefined) {
    fields.push("confidence_state = ?");
    values.push(updates.confidenceState);
  }
  if (updates.lifecycleState !== undefined) {
    fields.push("lifecycle_state = ?");
    values.push(updates.lifecycleState);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE wardrobe_items SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function getItemUsageStats(itemId: number): Promise<{ wornThisMonth: number; daysSinceLastWorn: number | null }> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const statsRow = await db.getFirstAsync<{ worn_this_month: number; last_worn_at: number | null }>(
    `SELECT 
       COUNT(CASE WHEN oh.worn_at >= ? THEN 1 END) as worn_this_month,
       MAX(oh.worn_at) as last_worn_at
     FROM outfit_items oi
     JOIN outfit_history oh ON oi.outfit_history_id = oh.id
     WHERE oi.wardrobe_item_id = ?`,
    [thirtyDaysAgo, itemId]
  );

  const wornThisMonth = statsRow?.worn_this_month ?? 0;
  const lastWornAt = statsRow?.last_worn_at ?? null;

  const daysSinceLastWorn = lastWornAt !== null
    ? Math.max(0, Math.floor((now - lastWornAt) / (24 * 60 * 60)))
    : null;

  return { wornThisMonth, daysSinceLastWorn };
}

/**
 * Single batch query fetching usage statistics for ALL items at once.
 * Replaces N+1 query loop in closet screens.
 */
export async function getAllItemUsageStats(): Promise<Record<number, { wornThisMonth: number; daysSinceLastWorn: number | null }>> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const rows = await db.getAllAsync<{ wardrobe_item_id: number; worn_this_month: number; last_worn_at: number | null }>(
    `SELECT 
       oi.wardrobe_item_id,
       COUNT(CASE WHEN oh.worn_at >= ? THEN 1 END) as worn_this_month,
       MAX(oh.worn_at) as last_worn_at
     FROM outfit_items oi
     JOIN outfit_history oh ON oi.outfit_history_id = oh.id
     GROUP BY oi.wardrobe_item_id`,
    [thirtyDaysAgo]
  );

  const resultMap: Record<number, { wornThisMonth: number; daysSinceLastWorn: number | null }> = {};
  for (const row of rows) {
    const lastWornAt = row.last_worn_at ?? null;
    const daysSinceLastWorn = lastWornAt !== null
      ? Math.max(0, Math.floor((now - lastWornAt) / (24 * 60 * 60)))
      : null;
    resultMap[row.wardrobe_item_id] = {
      wornThisMonth: row.worn_this_month ?? 0,
      daysSinceLastWorn,
    };
  }

  return resultMap;
}

/**
 * Perform on-device visual similarity search using local feature vector cosine similarity.
 */
export async function findVisuallySimilarGarments(targetItemId: number, limit = 5): Promise<WardrobeItem[]> {
  const allItems = await getAllWardrobeItems(false);
  const targetItem = allItems.find((i) => i.id === targetItemId);
  if (!targetItem) return [];

  const { findSimilarItems } = require("@/ml/embeddings");
  return findSimilarItems(allItems, targetItem, limit);
}

