import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import {
  getWardrobeItem,
  WardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  getItemUsageStats,
} from "@/db/wardrobe.repository";

const CATEGORIES = ["top", "bottom", "dress", "outerwear", "shoes", "accessory"];
const PATTERNS = ["solid", "striped", "floral", "plaid", "graphic", "textured"];
const LIFECYCLES: Array<WardrobeItem["lifecycleState"]> = ["active", "archived", "donated", "sold"];

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Number(id);

  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [stats, setStats] = useState<{ wornThisMonth: number; daysSinceLastWorn: number | null }>({
    wornThisMonth: 0,
    daysSinceLastWorn: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [category, setCategory] = useState("");
  const [pattern, setPattern] = useState("");
  const [dominantColor, setDominantColor] = useState("");

  const loadData = async () => {
    if (!itemId) return;
    try {
      const data = await getWardrobeItem(itemId);
      if (data) {
        setItem(data);
        setCategory(data.category);
        setPattern(data.pattern || "");
        setDominantColor(data.dominantColor || "");
      }
      const usage = await getItemUsageStats(itemId);
      setStats(usage);
    } catch (e) {
      console.error("Failed to load item detail:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [itemId]);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Garment not found</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    try {
      await updateWardrobeItem(itemId, {
        category,
        pattern,
        dominantColor,
      });
      setIsEditing(false);
      await loadData();
      Alert.alert("Saved! ✨", "Garment details updated.");
    } catch (e) {
      Alert.alert("Error", "Failed to update item.");
    }
  };

  const handleLifecycleChange = async (state: WardrobeItem["lifecycleState"]) => {
    try {
      await updateWardrobeItem(itemId, { lifecycleState: state });
      await loadData();
    } catch (e) {
      Alert.alert("Error", "Failed to change item status.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Garment",
      "Are you sure you want to remove this garment from your wardrobe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteWardrobeItem(itemId);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Navigation */}
        <View style={styles.navRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Pressable
            style={styles.editHeaderBtn}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <Text style={styles.editHeaderBtnText}>{isEditing ? "Save" : "Edit"}</Text>
          </Pressable>
        </View>

        {/* Garment Image Box */}
        <View style={styles.imageCard}>
          <Image source={{ uri: item.imageUri }} style={styles.garmentImage} resizeMode="cover" />
          <View style={styles.colorBadge}>
            <View style={[styles.colorDot, { backgroundColor: item.dominantColor || colors.cocoa }]} />
            <Text style={styles.colorText}>{item.dominantColor}</Text>
          </View>
        </View>

        {/* Usage Stats Dashboard */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionHeader}>Garment Insights</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.wornThisMonth}</Text>
              <Text style={styles.statLabel}>Worn this month</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {stats.daysSinceLastWorn !== null ? `${stats.daysSinceLastWorn}d` : "Never"}
              </Text>
              <Text style={styles.statLabel}>Days since last worn</Text>
            </View>
          </View>
        </View>

        {/* Metadata Editor / Viewer */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Garment Attributes</Text>
          
          <View style={styles.attrRow}>
            <Text style={styles.attrLabel}>Category</Text>
            {isEditing ? (
              <View style={styles.pillWrap}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.optionPill, category === c && styles.optionPillSelected]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.optionPillText, category === c && styles.optionPillTextSelected]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.attrValue}>{item.category}</Text>
            )}
          </View>

          <View style={styles.attrRow}>
            <Text style={styles.attrLabel}>Pattern</Text>
            {isEditing ? (
              <View style={styles.pillWrap}>
                {PATTERNS.map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.optionPill, pattern === p && styles.optionPillSelected]}
                    onPress={() => setPattern(p)}
                  >
                    <Text style={[styles.optionPillText, pattern === p && styles.optionPillTextSelected]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.attrValue}>{item.pattern}</Text>
            )}
          </View>

          {/* Lifecycle State Selector */}
          <View style={styles.attrRow}>
            <Text style={styles.attrLabel}>Lifecycle Status</Text>
            <View style={styles.pillWrap}>
              {LIFECYCLES.map((st) => (
                <Pressable
                  key={st}
                  style={[styles.optionPill, item.lifecycleState === st && styles.optionPillSelected]}
                  onPress={() => handleLifecycleChange(st)}
                >
                  <Text style={[styles.optionPillText, item.lifecycleState === st && styles.optionPillTextSelected]}>
                    {st}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Style With Garment CTA */}
        <Pressable
          style={styles.styleWithBtn}
          onPress={() => {
            router.push({ pathname: "/(tabs)/home", params: { focusItemId: String(itemId) } });
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Style with this garment"
        >
          <Text style={styles.styleWithBtnText}>✨ Style With This Garment</Text>
        </Pressable>

        {/* Delete Action */}
        <Pressable
          style={styles.deleteBtn}
          onPress={handleDelete}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Delete Garment"
        >
          <Text style={styles.deleteBtnText}>Delete Garment</Text>
        </Pressable>
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
    gap: 20,
    paddingBottom: 60,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.creamLinen,
  },
  backBtnText: {
    fontFamily: "Nunito-Bold",
    color: colors.cocoa,
    fontSize: 14,
  },
  editHeaderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.rose,
  },
  editHeaderBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
  imageCard: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.creamLinen,
    position: "relative",
    borderWidth: 2,
    borderColor: colors.creamDeep,
    ...shadow.soft,
  },
  garmentImage: {
    width: "100%",
    height: "100%",
  },
  colorBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  colorText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  statsCard: {
    backgroundColor: colors.creamLinen,
    padding: 20,
    borderRadius: radius.md,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  sectionHeader: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    padding: 16,
    borderRadius: radius.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  statNumber: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 24,
    color: colors.cocoa,
  },
  statLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: colors.whiteSoft,
    padding: 20,
    borderRadius: radius.md,
    gap: 16,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    ...shadow.soft,
  },
  attrRow: {
    gap: 8,
  },
  attrLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoaSoft,
  },
  attrValue: {
    fontFamily: "Fraunces-Medium",
    fontSize: 16,
    color: colors.cocoa,
    textTransform: "capitalize",
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.creamLinen,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  optionPillSelected: {
    backgroundColor: colors.rose,
    borderColor: colors.roseDark,
  },
  optionPillText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
    textTransform: "capitalize",
  },
  optionPillTextSelected: {
    color: "#fff",
  },
  styleWithBtn: {
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: colors.rose,
    alignItems: "center",
    marginBottom: 8,
  },
  styleWithBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 15,
  },
  deleteBtn: {
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#FCE8E6",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.rose,
  },
  deleteBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: colors.roseDark,
    fontSize: 14,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  notFoundText: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 18,
    color: colors.cocoa,
  },
});
