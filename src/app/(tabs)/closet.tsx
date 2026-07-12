import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Image, FlatList, Dimensions, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import {
  getAllWardrobeItems,
  WardrobeItem,
  setLifecycleState,
  deleteWardrobeItem,
  getItemUsageStats,
} from "@/db/wardrobe.repository";
import { computeClosetHealth, ClosetHealth } from "@/ml/closetHealth";
import { ProgressRing } from "@/components/ProgressRing";
import { ActionSheet, ActionOption } from "@/components/ActionSheet";

const COLUMN_COUNT = 3;
const SPACING = 12;
const GRID_WIDTH = Dimensions.get("window").width - 48; // paddingHorizontal 24 * 2
const ITEM_SIZE = (GRID_WIDTH - SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export default function Closet() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([]);
  const [health, setHealth] = useState<ClosetHealth | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Action sheet control
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [usageStats, setUsageStats] = useState<Record<number, { wornThisMonth: number; daysSinceLastWorn: number | null }>>({});

  const loadWardrobeData = async () => {
    try {
      const allItems = await getAllWardrobeItems(false); // active items only
      setItems(allItems);
      
      const computedHealth = computeClosetHealth(allItems);
      setHealth(computedHealth);

      // Fetch usage stats for all items
      const statsMap: typeof usageStats = {};
      for (const item of allItems) {
        const stats = await getItemUsageStats(item.id);
        statsMap[item.id] = stats;
      }
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
    if (filter === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((i) => i.category.toLowerCase() === filter.toLowerCase()));
    }
  }, [filter, items]);

  const handleLongPress = (item: WardrobeItem) => {
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

  const sheetOptions: ActionOption[] = [
    { label: "Archive Item", onPress: () => handleLifecycleChange("archived") },
    { label: "Mark as Donated", onPress: () => handleLifecycleChange("donated") },
    { label: "Mark as Sold", onPress: () => handleLifecycleChange("sold") },
    { label: "Delete Permanently", onPress: handleDelete, destructive: true },
  ];

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
        style={styles.gridSlot}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.category} garment`}
        accessibilityHint="Double tap to view garment details, or press and hold to manage status"
      >
        <Image source={{ uri: item.imageUri }} style={styles.gridImage} />
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
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Title & Count */}
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>Your Closet</Text>
                <Text style={styles.subtitle}>{items.length} items catalogued</Text>
              </View>
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
              {["all", "top", "bottom", "dress", "outerwear", "shoes"].map((cat) => (
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
              <Text style={styles.emptyText}>No items found in this category.</Text>
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
  addBtn: {
    backgroundColor: colors.rose,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  addBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
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
    width: ITEM_SIZE,
    height: ITEM_SIZE,
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
    resizeMode: "cover",
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
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
});
