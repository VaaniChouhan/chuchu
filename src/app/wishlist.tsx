import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { getAllWardrobeItems, addWardrobeItem, WardrobeItem } from "@/db/wardrobe.repository";
import { analyzeWardrobeGaps, WardrobeGap } from "@/ml/gapAnalyzer";
import {
  getWishlistItems,
  addWishlistItem,
  updateWishlistStatus,
  deleteWishlistItem,
  WishlistItem,
} from "@/db/wishlist.repository";
import { saveImportedProductToWishlist } from "@/services/shareIntentHandler";
import { hapticSuccess } from "@/utils/haptics";

export default function WishlistScreen() {
  const [gaps, setGaps] = useState<WardrobeGap[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [importUrl, setImportUrl] = useState("");

  const loadData = async () => {
    try {
      const items = await getAllWardrobeItems();
      const detectedGaps = analyzeWardrobeGaps(items);
      setGaps(detectedGaps);

      const itemsInWishlist = await getWishlistItems();
      setWishlist(itemsInWishlist);
    } catch (e) {
      console.error("Failed to load wishlist & gap data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddGapToWishlist = async (gap: WardrobeGap) => {
    try {
      await addWishlistItem(`Versatile ${gap.category}`, gap.advice);
      await loadData();
      Alert.alert("Added! 🛍️", `Added ${gap.category} to your wishlist.`);
    } catch (e) {
      Alert.alert("Error", "Could not save to wishlist.");
    }
  };

  const handleMoveToCloset = async (item: WishlistItem) => {
    try {
      const lower = item.title.toLowerCase();
      let category = "top";
      if (lower.includes("pant") || lower.includes("jean") || lower.includes("trouser") || lower.includes("skirt")) {
        category = "bottom";
      } else if (lower.includes("dress") || lower.includes("gown")) {
        category = "dress";
      } else if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("boot")) {
        category = "shoes";
      } else if (lower.includes("jacket") || lower.includes("coat") || lower.includes("blazer")) {
        category = "outerwear";
      }

      await addWardrobeItem({
        imageUri: item.imageUrl || "asset:///seed_top_white.png",
        category,
        dominantColor: "#FAF1E4",
        confidenceState: "user_edited",
      });
      await updateWishlistStatus(item.id, "purchased");
      hapticSuccess();
      await loadData();
      Alert.alert("Moved to Closet! 🎉", `"${item.title}" is now part of your wardrobe.`);
    } catch (e) {
      Alert.alert("Error", "Could not move item to closet.");
    }
  };

  const handleCustomAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      await addWishlistItem(newTitle.trim(), "Custom wishlist item");
      setNewTitle("");
      await loadData();
    } catch (e) {
      Alert.alert("Error", "Failed to add item.");
    }
  };

  const handleImportShareUrl = async () => {
    if (!importUrl.trim()) return;
    try {
      await saveImportedProductToWishlist(importUrl.trim());
      setImportUrl("");
      await loadData();
      Alert.alert("Imported! 🛒", "Parsed Open Graph metadata and saved item into wishlist.");
    } catch (e) {
      Alert.alert("Error", "Could not import link metadata.");
    }
  };

  const handleToggleStatus = async (item: WishlistItem) => {
    const nextStatus = item.status === "saved" ? "purchased" : "saved";
    try {
      await updateWishlistStatus(item.id, nextStatus);
      await loadData();
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWishlistItem(id);
      await loadData();
    } catch (e) {
      console.error("Failed to delete wishlist item:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Wardrobe Gaps & Wishlist</Text>
        </View>

        {/* AI Identified Wardrobe Gaps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Wardrobe Gap Recommendations</Text>
          {gaps.map((gap) => (
            <View key={gap.id} style={styles.gapCard}>
              <View style={styles.gapHeader}>
                <Text style={styles.gapCategory}>{gap.category}</Text>
                <View style={styles.comboBadge}>
                  <Text style={styles.comboText}>+{gap.newOutfitsCount} outfits</Text>
                </View>
              </View>
              <Text style={styles.gapAdvice}>{gap.advice}</Text>
              <Pressable style={styles.saveGapBtn} onPress={() => handleAddGapToWishlist(gap)}>
                <Text style={styles.saveGapBtnText}>+ Add to Wishlist</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Import from Myntra, Ajio, Amazon, Flipkart, Nykaa */}
        <View style={styles.importCard}>
          <Text style={styles.importTitle}>🛒 Share Link Import (Myntra / Ajio / Amazon)</Text>
          <View style={styles.addInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Paste product link (Myntra, Ajio, Amazon, etc.)"
              placeholderTextColor={colors.cocoaSoft}
              value={importUrl}
              onChangeText={setImportUrl}
            />
            <Pressable style={styles.importBtn} onPress={handleImportShareUrl}>
              <Text style={styles.importBtnText}>Import</Text>
            </Pressable>
          </View>
        </View>

        {/* Custom Input */}
        <View style={styles.addInputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add custom item (e.g. Leather Belt)"
            placeholderTextColor={colors.cocoaSoft}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <Pressable style={styles.addBtn} onPress={handleCustomAdd}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {/* Wishlist Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Wishlist ({wishlist.length})</Text>
          {wishlist.length === 0 ? (
            <Text style={styles.emptyText}>No items in your wishlist yet.</Text>
          ) : (
            wishlist.map((item) => (
              <View key={item.id} style={styles.wishCard}>
                <Pressable style={styles.checkWrap} onPress={() => handleToggleStatus(item)}>
                  <View style={[styles.checkbox, item.status === "purchased" && styles.checkboxChecked]} />
                </Pressable>
                <View style={styles.wishContent}>
                  <Text style={[styles.wishTitle, item.status === "purchased" && styles.wishTitleDone]}>
                    {item.title}
                  </Text>
                  {(item.retailer || item.price) && (
                    <Text style={styles.wishMeta}>
                      {item.retailer ? item.retailer : "Web Store"}
                      {item.price ? ` · ₹${item.price.toLocaleString("en-IN")}` : ""}
                    </Text>
                  )}
                  {item.gapReason && <Text style={styles.wishReason}>{item.gapReason}</Text>}
                </View>

                {item.status !== "purchased" && (
                  <Pressable
                    style={styles.moveClosetBtn}
                    onPress={() => handleMoveToCloset(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${item.title} to closet`}
                  >
                    <Text style={styles.moveClosetBtnText}>🛍️ Closet</Text>
                  </Pressable>
                )}

                <Pressable onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteIcon}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
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
  scrollContent: {
    padding: 24,
    gap: 24,
    paddingBottom: 60,
  },
  header: {
    gap: 12,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.creamLinen,
  },
  backBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoa,
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.greeting,
    color: colors.cocoa,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
  },
  gapCard: {
    backgroundColor: colors.creamLinen,
    padding: 16,
    borderRadius: radius.md,
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
  },
  gapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gapCategory: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 16,
    color: colors.cocoa,
    textTransform: "capitalize",
  },
  comboBadge: {
    backgroundColor: colors.sagePale,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  comboText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.sageDark,
  },
  gapAdvice: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoaSoft,
    lineHeight: 18,
  },
  saveGapBtn: {
    backgroundColor: colors.sage,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  saveGapBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 12,
  },
  importCard: {
    backgroundColor: colors.creamLinen,
    padding: 16,
    borderRadius: radius.md,
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
  },
  importTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 14,
    color: colors.cocoa,
  },
  importBtn: {
    backgroundColor: colors.rose,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  importBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 13,
  },
  addInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.creamLinen,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoa,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  addBtn: {
    backgroundColor: colors.rose,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  addBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
  wishCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.whiteSoft,
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.creamDeep,
    gap: 12,
  },
  checkWrap: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.cocoaSoft,
  },
  checkboxChecked: {
    backgroundColor: colors.sage,
    borderColor: colors.sageDark,
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
  wishTitleDone: {
    textDecorationLine: "line-through",
    color: colors.cocoaSoft,
  },
  wishMeta: {
    fontFamily: "Nunito-Bold",
    fontSize: 11,
    color: colors.roseDark,
  },
  wishReason: {
    fontFamily: "Nunito-Regular",
    fontSize: 12,
    color: colors.cocoaSoft,
  },
  moveClosetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.rosePale,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.rose,
  },
  moveClosetBtnText: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 11,
    color: colors.roseDark,
  },
  deleteIcon: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
    color: colors.rose,
    padding: 6,
  },
  emptyText: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoaSoft,
    fontStyle: "italic",
  },
});
