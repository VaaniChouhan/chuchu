import { getDb } from "./schema";

export interface WishlistItem {
  id: number;
  title: string;
  gapReason: string | null;
  status: "saved" | "purchased" | "dismissed";
  createdAt: number;
  sourceUrl?: string;
  retailer?: string;
  price?: number;
  imageUrl?: string;
}

export async function addWishlistItem(
  title: string, 
  gapReason?: string,
  sourceUrl?: string,
  retailer?: string,
  price?: number,
  imageUrl?: string
): Promise<number> {
  const db = getDb();
  const res = await db.runAsync(
    `INSERT INTO wishlist_items (title, gap_reason, status, source_url, retailer, price, image_url) VALUES (?, ?, 'saved', ?, ?, ?, ?)`,
    [title, gapReason ?? null, sourceUrl ?? null, retailer ?? null, price ?? null, imageUrl ?? null]
  );
  return res.lastInsertRowId;
}

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const db = getDb();
  return db.getAllAsync<WishlistItem>(
    `SELECT id, title, gap_reason as gapReason, status, source_url as sourceUrl, retailer, price, image_url as imageUrl, created_at as createdAt 
     FROM wishlist_items ORDER BY created_at DESC`
  );
}

export async function updateWishlistStatus(id: number, status: "saved" | "purchased" | "dismissed"): Promise<void> {
  const db = getDb();
  await db.runAsync(`UPDATE wishlist_items SET status = ? WHERE id = ?`, [status, id]);
}

export async function deleteWishlistItem(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM wishlist_items WHERE id = ?`, [id]);
}
