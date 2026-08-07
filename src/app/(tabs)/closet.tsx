import { useEffect, useState } from "react";
import { Platform, StyleSheet, View, Text, Pressable, Image, FlatList, ActivityIndicator, ScrollView, TextInput, RefreshControl, Dimensions, useWindowDimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import {
  getAllWardrobeItems,
  addWardrobeItem,
  WardrobeItem,
  setLifecycleState,
  deleteWardrobeItem,
  getAllItemUsageStats,
} from "@/db/wardrobe.repository";
import { DEMO_WARDROBE_ITEMS } from "@/data/demoData";
import { computeClosetHealth, ClosetHealth } from "@/ml/closetHealth";
import { ProgressRing } from "@/components/ProgressRing";
import { ActionSheet, ActionOption } from "@/components/ActionSheet";
import { hapticMedium, hapticLight, hapticSuccess } from "@/utils/haptics";

const COLUMN_COUNT = 3;
const SPACING = 12;

export default function Closet() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([]);
  const [health, setHealth] = useState<ClosetHealth | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Action sheet control
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [usageStats, setUsageStats] = useState<Record<number, { wornThisMonth: number; daysSinceLastWorn: number | null }>>({});

  // Multi-select batch mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { width } = useWindowDimensions();
  const GRID_WIDTH = width - 48; // paddingHorizontal 24 * 2
  const ITEM_SIZE = (GRID_WIDTH - SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

  const loadWardrobeData = async () => {
    try {
      const allItems = await getAllWardrobeItems(false); // active items only
      setItems(allItems);
      
      const computedHealth = computeClosetHealth(allItems);
      setHealth(computedHealth);

      // Single batch query fetching stats for all items at once
      const statsMap = await getAllItemUsageStats();
      setUsageStats(statsMap);

    } catch (e) {
      console.error("Failed to load closet items:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWardrobeData();
  }, []);

  useEffect(() => {
    let result = items;
    if (filter !== "all") {
      result = result.filter((i) => i.category.toLowerCase() === filter.toLowerCase());
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => 
        (i.category || "").toLowerCase().includes(q) ||
        (i.dominantColor || "").toLowerCase().includes(q) ||
        (i.pattern || "").toLowerCase().includes(q)
      );
    }
    setFilteredItems(result);
  }, [filter, items, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWardrobeData();
    setRefreshing(false);
  };

  const handleLongPress = (item: WardrobeItem) => {
    hapticMedium();
    setSelectedItem(item);
    setSheetVisible(true);
  };

  const handleLifecycleChange = async (state: "archived" | "donated" | "sold") => {
    if (selectedItem) {
      await setLifecycleState(selectedItem.id, state);
      loadWardrobeData();
    }
  };

  const handleDelete = async () => {
    if (selectedItem) {
      await deleteWardrobeItem(selectedItem.id);
      loadWardrobeData();
    }
  };

  const toggleSelectId = (id: number) => {
    hapticLight();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchArchive = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    for (const id of Array.from(selectedIds)) {
      await setLifecycleState(id, "archived");
    }
    setSelectedIds(new Set());
    setIsSelectMode(false);
    hapticSuccess();
    await loadWardrobeData();
    Alert.alert("Batch Archived! 📦", `Archived ${count} items.`);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    Alert.alert("Delete Selected Items?", `Permanently remove ${count} garments from your closet?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          for (const id of Array.from(selectedIds)) {
            await deleteWardrobeItem(id);
          }
          setSelectedIds(new Set());
          setIsSelectMode(false);
          hapticSuccess();
          await loadWardrobeData();
        },
      },
    ]);
  };

  const sheetOptions: ActionOption[] = [
    { label: "Archive Item", onPress: () => handleLifecycleChange("archived") },
    { label: "Mark as Donated", onPress: () => handleLifecycleChange("donated") },
    { label: "Mark as Sold", onPress: () => handleLifecycleChange("sold") },
    { label: "Delete Permanently", onPress: handleDelete, destructive: true },
  ];

  const handleSeedSampleItems = async () => {
    try {
      for (const demoItem of DEMO_WARDROBE_ITEMS) {
        await addWardrobeItem({
          imageUri: demoItem.imageUri,
          category: demoItem.category,
          dominantColor: demoItem.dominantColor,
          pattern: demoItem.pattern || "solid",
          confidenceState: "confirmed",
        });
      }
      hapticSuccess();
      await loadWardrobeData();
      Alert.alert("Sample Wardrobe Loaded! 🧺", "Added 5 sample garments to your closet.");
    } catch (e) {
      console.error("Failed to seed sample wardrobe:", e);
    }
  };

  const renderItemGrid = ({ item }: { item: WardrobeItem }) => {
    const stats = usageStats[item.id];
    let badgeText = "";
    if (stats) {
      if (stats.wornThisMonth > 0) {
        badgeText = `${stats.wornThisMonth}x`;
      } else if (stats.daysSinceLastWorn !== null) {
        badgeText = `Resting ${stats.daysSinceLastWorn}d`;
      }
    }

    return (
      <Pressable
        onPress={() => router.push(`/item/${item.id}` as any)}
        onLongPress={() => handleLongPress(item)}
        style={[styles.gridSlot, { width: ITEM_SIZE, height: ITEM_SIZE }]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.category} garment`}
        accessibilityHint="Double tap to view garment details, or press and hold to manage status"
      >
        <Image source={{ uri: item.imageUri }} style={styles.gridImage} resizeMode="cover" />
        <View style={[styles.colorIndicator, { backgroundColor: item.dominantColor }]} />
        
        {badgeText !== "" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        numColumns={COLUMN_COUNT}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.rose]} />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Title & Count */}
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>Your Closet 🧺</Text>
                <Text style={styles.subtitle}>{items.length} pieces, all yours</Text>
              </View>
              <View style={styles.actionHeaderBtns}>
                <Pressable
                  style={styles.wishlistBtn}
                  onPress={() => router.push("/wishlist" as any)}
                >
                  <Text style={styles.wishlistBtnText}>🛍️ Wishlist</Text>
                </Pressable>
                <Pressable
                  style={styles.addBtn}
                  onPress={() => router.push("/add-item" as any)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add garment"
                  accessibilityHint="Opens camera scanner to catalog a new garment"
                >
                  <Text style={styles.addBtnText}>+ Add</Text>
                </Pressable>
              </View>
            </View>

            {/* Search Bar */}
            <TextInput
              style={styles.searchBar}
              placeholder="Search garments by color, pattern, or category..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.cocoaSoft}
            />

            {/* Health Strip */}
            {health && (
              <View style={styles.healthStrip}>
                <View style={styles.healthHeader}>
                  <Text style={styles.healthTitle}>Closet Health</Text>
                  <Text style={styles.healthScore}>{Math.round(health.overall * 100)}% Good</Text>
                </View>
                <View style={styles.healthRings}>
                  <View style={styles.ringLabelCol}>
                    <ProgressRing current={Math.round(health.completeness * 5)} target={5} size={48} strokeWidth={4} />
                    <Text style={styles.ringLabel}>Items</Text>
                  </View>
                  <View style={styles.ringLabelCol}>
                    <ProgressRing current={Math.round(health.colorDiversity * 6)} target={6} size={48} strokeWidth={4} />
                    <Text style={styles.ringLabel}>Colors</Text>
                  </View>
                  <View style={styles.ringLabelCol}>
                    <ProgressRing current={3} target={4} size={48} strokeWidth={4} />
                    <Text style={styles.ringLabel}>Seasons</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {["all", "top", "bottom", "dress", "outerwear", "shoes", "kurta", "saree", "lehenga", "dupatta", "sherwani"].map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.filterChip, filter === cat && styles.filterChipActive]}
                  onPress={() => setFilter(cat)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === cat }}
                  accessibilityLabel={`${cat} items filter`}
                  accessibilityHint={`Filter closet to show only ${cat} items`}
                >
                  <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={renderItemGrid}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.rose} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Your closet is empty 🧺</Text>
              <Text style={styles.emptyText}>Add your garments by taking photos or load sample garments to test ChuChu.</Text>
              <Pressable
                style={styles.seedBtn}
                onPress={handleSeedSampleItems}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Load sample wardrobe garments"
              >
                <Text style={styles.seedBtnText}>✨ Load Sample Wardrobe</Text>
              </Pressable>
            </View>
          )
        }
      />

      {/* Lifecycle Actions */}
      <ActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={selectedItem ? `Manage Garment (${selectedItem.category})` : "Manage Garment"}
        options={sheetOptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  headerSection: {
    gap: 20,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.greeting,
    color: colors.cocoa,
  },
  subtitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
  actionHeaderBtns: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  wishlistBtn: {
    backgroundColor: colors.creamLinen,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  wishlistBtnText: {
    fontFamily: "Nunito-Bold",
    color: colors.cocoa,
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: colors.rose,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  addBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
  searchBar: {
    backgroundColor: colors.whiteSoft,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoa,
  },
  healthStrip: {
    backgroundColor: colors.creamLinen,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 12,
  },
  healthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 15,
    color: colors.cocoa,
  },
  healthScore: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 13,
    color: colors.roseDark,
  },
  healthRings: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  ringLabelCol: {
    alignItems: "center",
    gap: 6,
  },
  ringLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    backgroundColor: colors.whiteSoft,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
  },
  filterChipActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rosePale,
  },
  filterChipText: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoaSoft,
    textTransform: "capitalize",
  },
  filterChipTextActive: {
    color: colors.roseDark,
  },
  gridRow: {
    gap: SPACING,
    marginBottom: SPACING,
  },
  gridSlot: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    backgroundColor: colors.creamLinen,
    position: "relative",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  colorIndicator: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fff",
  },
  badge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(74, 50, 38, 0.85)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: "Nunito-Bold",
    fontSize: 9,
    color: "#fff",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    gap: 12,
    marginTop: 40,
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  emptyTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 18,
    color: colors.cocoa,
  },
  emptyText: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoaSoft,
    textAlign: "center",
    lineHeight: 18,
  },
  seedBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.rose,
    borderRadius: 999,
    marginTop: 8,
  },
  seedBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
});
