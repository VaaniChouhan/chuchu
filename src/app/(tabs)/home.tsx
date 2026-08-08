import { useEffect, useState } from "react";
import { Platform, StyleSheet, View, Text, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { useGreeting } from "@/hooks/useGreeting";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";
import { generateOutfitSuggestion, Outfit } from "@/ml/styleEngine";
import { OutfitCard } from "@/components/OutfitCard";
import { CheckInModal } from "@/components/CheckInModal";
import { QuickActionDial } from "@/components/QuickActionDial";
import { ChuChuMascot } from "@/components/ChuChu";
import { getDb } from "@/db/schema";
import { hapticLight, hapticSuccess } from "@/utils/haptics";

export default function Home() {

  const greeting = useGreeting();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [suggestion, setSuggestion] = useState<Outfit | null>(null);
  const [altOutfits, setAltOutfits] = useState<Outfit[]>([]);
  const [seed, setSeed] = useState(0);
  const [checkInVisible, setCheckInVisible] = useState(false);

  const loadWardrobe = async () => {
    try {
      const allItems = await getAllWardrobeItems();
      setItems(allItems);
      if (allItems.length > 0) {
        const suggestionResult = generateOutfitSuggestion(allItems, seed);
        setSuggestion(suggestionResult);
        
        const alt1 = generateOutfitSuggestion(allItems, seed + 1);
        const alt2 = generateOutfitSuggestion(allItems, seed + 2);
        const alt3 = generateOutfitSuggestion(allItems, seed + 3);
        const alts = [alt1, alt2, alt3].filter((a): a is Outfit => a !== null);
        setAltOutfits(alts);
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
    hapticLight();
    setSeed((prev) => prev + 1);
  };

  const handleWear = async () => {
    hapticSuccess();
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
        <View style={styles.greetingBlock} accessible={true} accessibilityRole="header">
          <Text style={styles.greetingEyebrow}>{greeting.eyebrow}</Text>
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
              accessibilityLabel="Scan garments to add to your closet"
            >
              <Text style={styles.emptyBtnText}>Scan Garments</Text>
            </Pressable>
          </View>
        )}

        {/* Alternate Outfits Row */}
        <View style={styles.altSection}>
          <Text style={styles.altSectionTitle}>Alternate Pairings</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.altRow}>
            {altOutfits.map((alt, idx) => {
              const bg = alt.items[0]?.dominantColor || colors.sagePale;
              const conf = Math.round(alt.score * 100);
              return (
                <Pressable 
                  key={idx} 
                  style={styles.altCard} 
                  onPress={() => { hapticLight(); setSeed(seed + idx + 1); }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Show alternate outfit ${idx + 1}`}
                  accessibilityHint="Shows another outfit combination"
                >
                  <View style={[styles.altSwatch, { backgroundColor: bg }]} />
                  <Text style={styles.altConf}>{conf}% Match</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Big ChuChu Mascot Feature Card at Bottom Center */}
        <View style={styles.bigMascotCard}>
          <View style={styles.speechBubbleBig}>
            <Text style={styles.speechTextBig}>"{greeting.line}"</Text>
            <Text style={styles.chuchuSignature}>✨ Tap ChuChu for instant joy!</Text>
          </View>

          <View style={styles.mascotCenterFrame}>
            <ChuChuMascot
              size={190}
              emotion="sparkling_joy"
              interactive={true}
            />
          </View>
        </View>
      </ScrollView>

      {/* Daily feedback check-in loop */}
      <CheckInModal visible={checkInVisible} onClose={() => setCheckInVisible(false)} />

      {/* Floating Speed Dial (+) for Quick Actions */}
      <QuickActionDial />
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
    paddingBottom: 80,
  },
  greetingBlock: {
    paddingHorizontal: 4,
    gap: 2,
  },
  greetingEyebrow: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.roseDark,
    marginBottom: 2,
  },
  greetingTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 26,
    color: colors.cocoa,
    letterSpacing: -0.2,
  },
  greetingSubtitle: {
    fontFamily: "Nunito-Regular",
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
  bigMascotCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBF2",
    borderRadius: radius.lg,
    padding: 20,
    paddingTop: 24,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F4E3C1",
    gap: 16,
    ...shadow.soft,
  },
  speechBubbleBig: {
    backgroundColor: colors.goldPale,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: "92%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAD6AF",
    ...shadow.soft,
  },
  speechTextBig: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
    textAlign: "center",
    lineHeight: 20,
  },
  chuchuSignature: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 11,
    color: colors.roseDark,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  mascotCenterFrame: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  altSection: {
    gap: 10,
    marginTop: 4,
  },
  altSectionTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 14,
    color: colors.cocoa,
  },
  altRow: {
    gap: 12,
    paddingVertical: 4,
  },
  altCard: {
    width: 100,
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.md,
    padding: 10,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.creamDeep,
    ...shadow.soft,
  },
  altSwatch: {
    width: "100%",
    height: 56,
    borderRadius: 10,
  },
  altConf: {
    fontFamily: "Nunito-Bold",
    fontSize: 10,
    color: colors.cocoaSoft,
  },
});
