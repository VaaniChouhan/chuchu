import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";
import { generateOutfitSuggestion, Outfit } from "@/ml/styleEngine";

const EVENT_PRESETS = [
  { id: "wedding", name: "Wedding / Sangeet", formality: "formal", emoji: "✨" },
  { id: "interview", name: "Job Interview", formality: "business", emoji: "💼" },
  { id: "office", name: "Office / Work", formality: "business", emoji: "🏢" },
  { id: "date", name: "Dinner / Date", formality: "smart-casual", emoji: "🕯️" },
  { id: "festival", name: "Festival / Celebration", formality: "festive", emoji: "🪔" },
];

export default function OccasionPlanner() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"single" | "travel">("single");
  const [selectedEvent, setSelectedEvent] = useState<string>("wedding");
  const [customEvent, setCustomEvent] = useState("");
  const [tripDays, setTripDays] = useState("4");
  const [tripDestination, setTripDestination] = useState("Goa");

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [singleOutfit, setSingleOutfit] = useState<Outfit | null>(null);
  const [capsuleOutfits, setCapsuleOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const allItems = await getAllWardrobeItems(false);
        setItems(allItems);
        if (allItems.length > 0) {
          const suggested = generateOutfitSuggestion(allItems, 1);
          if (suggested) setSingleOutfit(suggested);
        }
      } catch (e) {
        console.error("Failed to load occasion data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGenerateSingle = () => {
    if (items.length === 0) return;
    const seed = Math.floor(Math.random() * 100);
    const suggested = generateOutfitSuggestion(items, seed);
    if (suggested) setSingleOutfit(suggested);
  };

  const handleGenerateCapsule = () => {
    if (items.length === 0) return;
    const days = parseInt(tripDays, 10) || 3;
    const outfits: Outfit[] = [];
    for (let i = 0; i < Math.min(days, 7); i++) {
      const suggested = generateOutfitSuggestion(items, i * 17);
      if (suggested) outfits.push(suggested);
    }
    setCapsuleOutfits(outfits);
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
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(60, insets.bottom + 24) }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Occasion & Travel Planner</Text>
          <Text style={styles.subtitle}>Plan curated outfits for special events or multi-day trips.</Text>
        </View>

        {/* Mode Switcher */}
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeBtn, mode === "single" && styles.modeBtnActive]}
            onPress={() => setMode("single")}
          >
            <Text style={[styles.modeBtnText, mode === "single" && styles.modeBtnTextActive]}>
              ✨ Single Event
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === "travel" && styles.modeBtnActive]}
            onPress={() => setMode("travel")}
          >
            <Text style={[styles.modeBtnText, mode === "travel" && styles.modeBtnTextActive]}>
              ✈️ Travel Capsule
            </Text>
          </Pressable>
        </View>

        {/* Single Event Mode */}
        {mode === "single" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Upcoming Event</Text>
            <View style={styles.presetGrid}>
              {EVENT_PRESETS.map((preset) => (
                <Pressable
                  key={preset.id}
                  style={[styles.presetCard, selectedEvent === preset.id && styles.presetCardActive]}
                  onPress={() => setSelectedEvent(preset.id)}
                >
                  <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                  <Text style={styles.presetName}>{preset.name}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Or custom event (e.g. Sangeet Party)"
              placeholderTextColor={colors.cocoaSoft}
              value={customEvent}
              onChangeText={setCustomEvent}
            />

            <Pressable style={styles.generateBtn} onPress={handleGenerateSingle}>
              <Text style={styles.generateBtnText}>Generate Occasion Outfit ✨</Text>
            </Pressable>

            {singleOutfit && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>
                    {EVENT_PRESETS.find((p) => p.id === selectedEvent)?.name || customEvent || "Event Pick"}
                  </Text>
                  <Text style={styles.resultScore}>{Math.round(singleOutfit.score * 100)}% Match</Text>
                </View>

                <View style={styles.itemsRow}>
                  {singleOutfit.items.map((item) => (
                    <View key={item.id} style={styles.itemBadge}>
                      <View style={[styles.colorDot, { backgroundColor: item.dominantColor }]} />
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.reasonText}>
                  {singleOutfit.reasons.join(" • ")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Multi-Day Travel Capsule Mode */}
        {mode === "travel" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Multi-Day Trip Capsule Generator</Text>
            <View style={styles.travelInputs}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Goa, Manali, Mumbai"
                  value={tripDestination}
                  onChangeText={setTripDestination}
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Duration (Days)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="4"
                  keyboardType="numeric"
                  value={tripDays}
                  onChangeText={setTripDays}
                />
              </View>
            </View>

            <Pressable style={styles.generateBtn} onPress={handleGenerateCapsule}>
              <Text style={styles.generateBtnText}>Generate {tripDays}-Day Packing Capsule 🧳</Text>
            </Pressable>

            {capsuleOutfits.length > 0 && (
              <View style={styles.capsuleList}>
                <Text style={styles.capsuleHeader}>
                  Suggested Outfits for {tripDestination} ({capsuleOutfits.length} Days)
                </Text>
                {capsuleOutfits.map((outfit, index) => (
                  <View key={index} style={styles.dayCard}>
                    <Text style={styles.dayTitle}>Day {index + 1} Outfit</Text>
                    <View style={styles.itemsRow}>
                      {outfit.items.map((item) => (
                        <View key={item.id} style={styles.itemBadge}>
                          <View style={[styles.colorDot, { backgroundColor: item.dominantColor }]} />
                          <Text style={styles.itemCategory}>{item.category}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.whiteSoft,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
    paddingBottom: 60,
  },
  header: {
    gap: 8,
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
  subtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
  modeRow: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.creamLinen,
    padding: 6,
    borderRadius: radius.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  modeBtnActive: {
    backgroundColor: colors.rose,
  },
  modeBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoa,
  },
  modeBtnTextActive: {
    color: "#fff",
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetCard: {
    width: "48%",
    backgroundColor: colors.creamLinen,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    alignItems: "center",
    gap: 6,
  },
  presetCardActive: {
    borderColor: colors.rose,
    backgroundColor: colors.whiteSoft,
  },
  presetEmoji: {
    fontSize: 24,
  },
  presetName: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.creamLinen,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoa,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  generateBtn: {
    backgroundColor: colors.rose,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  generateBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 15,
  },
  resultCard: {
    backgroundColor: colors.creamLinen,
    padding: 20,
    borderRadius: radius.md,
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 16,
    color: colors.cocoa,
  },
  resultScore: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 13,
    color: colors.roseDark,
  },
  itemsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  itemBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.whiteSoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemCategory: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
    textTransform: "capitalize",
  },
  reasonText: {
    fontFamily: "Nunito-Regular",
    fontSize: 12,
    color: colors.cocoaSoft,
  },
  travelInputs: {
    flexDirection: "row",
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  capsuleList: {
    gap: 12,
    marginTop: 8,
  },
  capsuleHeader: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 15,
    color: colors.cocoa,
  },
  dayCard: {
    backgroundColor: colors.creamLinen,
    padding: 14,
    borderRadius: radius.md,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  dayTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoa,
  },
});
