import { getDb } from "@/db/schema";
import { getAllWardrobeItems } from "@/db/wardrobe.repository";

export interface SyncStatus {
  success: boolean;
  syncedItemsCount: number;
  lastSyncedAt: number;
}

/**
 * Simulates synchronization of local SQLite wardrobe elements to a cloud backend database.
 */
export async function syncClosetToCloud(): Promise<SyncStatus> {
  try {
    const db = getDb();
    const items = await getAllWardrobeItems(true); // Fetch all items including archived ones

    // Query outfit history
    const history = await db.getAllAsync<any>("SELECT * FROM outfit_history");
    // Query mood logs
    const moods = await db.getAllAsync<any>("SELECT * FROM mood_logs");

    console.log(`[Sync] Backing up ${items.length} garments, ${history.length} history records, and ${moods.length} check-ins to cloud...`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const timestamp = Math.floor(Date.now() / 1000);

    return {
      success: true,
      syncedItemsCount: items.length,
      lastSyncedAt: timestamp,
    };
  } catch (e) {
    console.error("Cloud synchronization failed:", e);
    return {
      success: false,
      syncedItemsCount: 0,
      lastSyncedAt: 0,
    };
  }
}
