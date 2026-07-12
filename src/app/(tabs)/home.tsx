import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { useGreeting } from "@/hooks/useGreeting";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";
import { generateOutfitSuggestion, Outfit } from "@/ml/styleEngine";
import { OutfitCard } from "@/components/OutfitCard";
import { CheckInModal } from "@/components/CheckInModal";
import { getDb } from "@/db/schema";

export default function Home() {
  const greeting = useGreeting();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [suggestion, setSuggestion] = useState<Outfit | null>(null);
  const [seed, setSeed] = useState(0);
  const [regensToday, setRegensToday] = useState(0);
  const [checkInVisible, setCheckInVisible] = useState(false);

  const loadWardrobe = async () => {
    try {
      const allItems = await getAllWardrobeItems();
      setItems(allItems);
      if (allItems.length > 0) {
        const suggestionResult = generateOutfitSuggestion(allItems, seed);
        setSuggestion(suggestionResult);
      }
    } catch (e) {
      console.error("Failed to load suggestions:", e);
    }
  };

  const checkLogStatus = async () => {
    try {
      const db = getDb();
      const row = await db.getFirstAsync<any>(
        "SELECT logged_at FROM mood_logs ORDER BY logged_at DESC LIMIT 1"
      );
      if (row) {
        const lastLogDate = new Date(row.logged_at * 1000).toDateString();
        const todayStr = new Date().toDateString();
        if (lastLogDate !== todayStr) {
          setCheckInVisible(true);
        }
      } else {
        setCheckInVisible(true); // First check-in ever
      }
    } catch (e) {
      console.warn("Failed to check daily feedback log status:", e);
    }
  };

  useEffect(() => {
    loadWardrobe();
    checkLogStatus();
  }, [seed]);

  const handleShowAnother = () => {
    if (regensToday >= 3) {
      Alert.alert(
        "Trust ChuChu! 🎀",
        "That's 3 alternatives generated already! We recommend trusting these or adding more items to your closet.",
        [{ text: "OK" }]
      );
      return;
    }
    setSeed((prev) => prev + 1);
    setRegensToday((prev) => prev + 1);
  };

  const handleWear = async () => {
    if (!suggestion) return;
    try {
      const db = getDb();
      const ids = suggestion.items.map((i) => i.id);
      await db.runAsync(
        "INSERT INTO outfit_history (item_ids, confidence) VALUES (?, ?)",
        [JSON.stringify(ids), suggestion.score]
      );
      Alert.alert(
        "Outfit Logged! ✨",
        "Your outfit for today is registered. Check back this evening for feedback!",
        [{ text: "Awesome" }]
      );
    } catch (e) {
      console.error("Failed to log worn outfit:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Greetings Section */}
        <View style={styles.header}>
          <Text style={styles.greetingTitle}>{greeting.greet}</Text>
          <Text style={styles.greetingSubtitle}>{greeting.sub}</Text>
        </View>

        {/* Outfit suggestion display card or empty state */}
        {suggestion && suggestion.score >= 0.7 ? (
          <View style={styles.suggestionBox}>
            <OutfitCard
              outfit={suggestion}
              onWear={handleWear}
              onShowAnother={handleShowAnother}
            />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🧥</Text>
            <Text style={styles.emptyTitle}>Closet is building</Text>
            <Text style={styles.emptyDesc}>
              Scan at least 5 core items so ChuChu has enough style data to formulate outfits.
            </Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => router.push("/add-item" as any)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Scan Garments"
              accessibilityHint="Proceed to scan wardrobe items page"
            >
              <Text style={styles.emptyBtnText}>Scan Garments</Text>
            </Pressable>
          </View>
        )}

        {/* Cute speech bubble advice from ChuChu */}
        <View style={styles.bubble}>
          <Text style={styles.bubbleMascot}>🌷</Text>
          <View style={styles.bubbleContent}>
            <Text style={styles.bubbleTitle}>ChuChu's Tip</Text>
            <Text style={styles.bubbleText}>
              "Wear light, soft fabrics when styling warm neutral colors to maintain visual balance."
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Daily feedback check-in loop */}
      <CheckInModal visible={checkInVisible} onClose={() => setCheckInVisible(false)} />
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
    gap: 24,
  },
  header: {
    gap: 6,
  },
  greetingTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.greeting,
    color: colors.cocoa,
    lineHeight: 34,
  },
  greetingSubtitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
  suggestionBox: {
    alignSelf: "stretch",
  },
  emptyCard: {
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.lg,
    padding: 32,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    alignItems: "center",
    gap: 12,
    ...shadow.soft,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
  },
  emptyDesc: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoaSoft,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyBtn: {
    backgroundColor: colors.rose,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  emptyBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
  bubble: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: colors.creamLinen,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    borderRadius: radius.md,
    padding: 16,
    alignItems: "center",
  },
  bubbleMascot: {
    fontSize: 32,
  },
  bubbleContent: {
    flex: 1,
    gap: 4,
  },
  bubbleTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 14,
    color: colors.cocoa,
  },
  bubbleText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
    lineHeight: 16,
  },
});
