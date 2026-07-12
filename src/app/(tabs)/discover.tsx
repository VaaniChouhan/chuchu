import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";
import { analyzeWardrobeGaps, WardrobeGap } from "@/ml/gapAnalyzer";
import { getDb } from "@/db/schema";

interface WishlistItem {
  id: number;
  title: string;
  gapReason: string | null;
  status: string;
}

export default function Discover() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [gaps, setGaps] = useState<WardrobeGap[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New wishlist inputs
  const [newTitle, setNewTitle] = useState("");
  const [newReason, setNewReason] = useState("");

  const loadData = async () => {
    try {
      const allItems = await getAllWardrobeItems();
      setItems(allItems);

      const generatedGaps = analyzeWardrobeGaps(allItems);
      setGaps(generatedGaps);

      const db = getDb();
      const wishlistRows = await db.getAllAsync<any>(
        "SELECT id, title, gap_reason AS gapReason, status FROM wishlist_items ORDER BY created_at DESC"
      );
      setWishlist(wishlistRows);
    } catch (e) {
      console.error("Discover screen load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWishlist = async () => {
    if (!newTitle.trim()) return;
    try {
      const db = getDb();
      await db.runAsync(
        "INSERT INTO wishlist_items (title, gap_reason, status) VALUES (?, ?, 'saved')",
        [newTitle.trim(), newReason.trim() || null]
      );
      setNewTitle("");
      setNewReason("");
      loadData();
      Alert.alert("Added! 📌", "Item added to your shopping wishlist.");
    } catch (e) {
      console.error("Failed to add wishlist item:", e);
    }
  };

  const handleToggleAcquired = async (id: number, currentStatus: string) => {
    try {
      const db = getDb();
      const nextStatus = currentStatus === "acquired" ? "saved" : "acquired";
      await db.runAsync("UPDATE wishlist_items SET status = ? WHERE id = ?", [nextStatus, id]);
      loadData();
    } catch (e) {
      console.error("Failed to toggle wishlist item status:", e);
    }
  };

  const handleDeleteWishlist = async (id: number) => {
    try {
      const db = getDb();
      await db.runAsync("DELETE FROM wishlist_items WHERE id = ?", [id]);
      loadData();
    } catch (e) {
      console.error("Failed to delete wishlist item:", e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.rose} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Optimize your closet and purchase lists.</Text>
        </View>

        {/* Wardrobe Gaps Diagnostics Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wardrobe Diagnostics</Text>
          {gaps.map((gap) => (
            <View key={gap.id} style={styles.gapCard} accessible={true} accessibilityLabel={`Closet deficiency: ${gap.category}`}>
              <View style={styles.gapHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>+{gap.newOutfitsCount} Outfits</Text>
                </View>
                <Text style={styles.gapCategory}>{gap.category} Deficient</Text>
              </View>
              <Text style={styles.gapAdvice}>{gap.advice}</Text>
              <Pressable
                style={styles.addWishBtn}
                onPress={() => {
                  setNewTitle(`Versatile ${gap.category}`);
                  setNewReason(`Fills the ${gap.category} wardrobe gap`);
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Add versatile ${gap.category} to wishlist`}
                accessibilityHint="Puts a pre-filled target item template into the wishlist editor form below"
              >
                <Text style={styles.addWishBtnText}>Add Target to Wishlist</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Wishlist manager */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Wishlist</Text>
          
          {/* Create Wishlist Form */}
          <View style={styles.formCard} accessible={true} accessibilityLabel="Add item to wishlist editor panel">
            <TextInput
              placeholder="Item name (e.g. Cream Trench Coat)"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              accessibilityLabel="Garment name input field"
              accessibilityHint="Type the name of the clothing item you want to add"
            />
            <TextInput
              placeholder="Reason / Gap it fills (optional)"
              value={newReason}
              onChangeText={setNewReason}
              style={styles.input}
              accessibilityLabel="Garment reason input field"
              accessibilityHint="Type the reason or closet gap filled by this item"
            />
            <Pressable
              style={styles.submitBtn}
              onPress={handleAddWishlist}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add item to wishlist"
              accessibilityHint="Saves the typed item into your style wishlist list below"
            >
              <Text style={styles.submitBtnText}>Add Item</Text>
            </Pressable>
          </View>

          {/* List of Wishlist Cards */}
          <View style={styles.wishlistList}>
            {wishlist.map((item) => {
              const isAcquired = item.status === "acquired";
              return (
                <View key={item.id} style={[styles.wishCard, isAcquired && styles.wishCardAcquired]}>
                  <View style={styles.wishMain}>
                    <Pressable
                      style={[styles.checkbox, isAcquired && styles.checkboxChecked]}
                      onPress={() => handleToggleAcquired(item.id, item.status)}
                      accessible={true}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isAcquired }}
                      accessibilityLabel={`Mark ${item.title} as acquired`}
                      accessibilityHint="Double tap to check or uncheck this item's acquisition status"
                    >
                      {isAcquired && <Text style={styles.checkMark}>✓</Text>}
                    </Pressable>
                    <View style={styles.wishContent}>
                      <Text style={[styles.wishTitle, isAcquired && styles.lineThrough]}>
                        {item.title}
                      </Text>
                      {item.gapReason && <Text style={styles.wishReason}>{item.gapReason}</Text>}
                    </View>
                  </View>
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteWishlist(item.id)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.title}`}
                    accessibilityHint="Permanently removes this item from your style wishlist"
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </Pressable>
                </View>
              );
            })}
            {wishlist.length === 0 && (
              <Text style={styles.emptyText}>Your style wishlist is empty.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
    gap: 28,
  },
  header: {
    gap: 6,
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
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 18,
    color: colors.cocoa,
  },
  gapCard: {
    backgroundColor: colors.creamLinen,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 12,
  },
  gapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: colors.rose,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 11,
  },
  gapCategory: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
    textTransform: "uppercase",
  },
  gapAdvice: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoa,
    lineHeight: 20,
  },
  addWishBtn: {
    alignSelf: "flex-start",
    borderBottomWidth: 1.5,
    borderColor: colors.cocoa,
    paddingBottom: 2,
  },
  addWishBtnText: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 12,
    color: colors.cocoa,
  },
  formCard: {
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 12,
    ...shadow.soft,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: colors.cocoa,
    backgroundColor: colors.whiteSoft,
  },
  submitBtn: {
    backgroundColor: colors.cocoa,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  submitBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
  wishlistList: {
    gap: 12,
  },
  wishCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.whiteSoft,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    borderRadius: radius.md,
    padding: 16,
  },
  wishCardAcquired: {
    backgroundColor: colors.creamLinen,
    borderColor: colors.creamDeep,
    opacity: 0.6,
  },
  wishMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.cocoaSoft,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.rose,
    borderColor: colors.rose,
  },
  checkMark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  wishContent: {
    flex: 1,
    gap: 2,
  },
  wishTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
  },
  lineThrough: {
    textDecorationLine: "line-through",
  },
  wishReason: {
    fontFamily: "Nunito-Regular",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    color: colors.cocoaSoft,
    fontSize: 14,
  },
  emptyText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
    textAlign: "center",
    marginTop: 10,
  },
});
