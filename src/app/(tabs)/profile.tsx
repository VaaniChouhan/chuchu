import { useEffect, useState } from "react";
import { Platform, StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, typeScale } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";

import { router } from "expo-router";

import { calculateStyleDna, StyleDnaBreakdown } from "@/ml/styleEngine";
import { computeClosetHealth } from "@/ml/closetHealth";
import { getDb } from "@/db/schema";

import { ChuChuMascot } from "@/components/ChuChu";
import { useGreeting } from "@/hooks/useGreeting";

interface ColorStat {
  hex: string;
  count: number;
  pct: number;
}

export default function Profile() {
  const profile = useProfileStore();
  const greeting = useGreeting();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [colorStats, setColorStats] = useState<ColorStat[]>([]);
  const [styleDna, setStyleDna] = useState<StyleDnaBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [closetHealth, setClosetHealth] = useState(0);
  const [acceptanceRate, setAcceptanceRate] = useState(0);

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editHeight, setEditHeight] = useState(String(profile.tempHeightCm || "172"));
  const [editWeight, setEditWeight] = useState(String(profile.tempWeightKg || "68"));
  const [editFit, setEditFit] = useState(profile.tempPreferredFit || "Regular");
  const [editGender, setEditGender] = useState(profile.tempGender || "Women's");
  const [editBodyShape, setEditBodyShape] = useState(profile.tempBodyShape || "Rectangle");
  const [editColorSeason, setEditColorSeason] = useState(profile.tempColorSeason || "Warm Autumn");
  const [editClimate, setEditClimate] = useState(profile.tempClimate || "Temperate");
  const [editWaistSize, setEditWaistSize] = useState(String(profile.tempWaistSizeInch || "30"));

  const handleSaveProfile = async () => {
    try {
      const h = parseInt(editHeight, 10) || null;
      const w = parseInt(editWeight, 10) || null;
      const waist = parseInt(editWaistSize, 10) || 30;
      profile.setTempProfile({
        tempHeightCm: h,
        tempWeightKg: w,
        tempPreferredFit: editFit,
        tempGender: editGender,
        tempBodyShape: editBodyShape,
        tempColorSeason: editColorSeason,
        tempClimate: editClimate,
        tempWaistSizeInch: waist,
      });
      const db = getDb();
      await db.runAsync(
        `UPDATE user_profile SET height_cm = ?, weight_kg = ?, preferred_fit = ? WHERE id = 1`,
        [h, w, editFit]
      );
      setEditModalVisible(false);
      Alert.alert("Saved! ✨", "All personal specifications and styling parameters updated.");
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  useEffect(() => {
    async function loadProfileStats() {
      try {
        await profile.hydrate();
        const activeItems = await getAllWardrobeItems(false);
        setItems(activeItems);

        const computedDna = calculateStyleDna(activeItems);
        setStyleDna(computedDna);

        const health = computeClosetHealth(activeItems);
        setClosetHealth(Math.round(health.overall * 100));

        setAcceptanceRate(Math.round((activeItems.length / Math.max(activeItems.length + 2, 1)) * 100));

        const db = getDb();
        const logs = await db.getAllAsync<{ logged_at: number }>(
          "SELECT logged_at FROM mood_logs ORDER BY logged_at DESC"
        );
        
        let calculatedStreak = 0;
        if (logs.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          const firstLogDate = new Date(logs[0].logged_at * 1000);
          firstLogDate.setHours(0, 0, 0, 0);

          let currentCheckDate = new Date(firstLogDate);
          if (firstLogDate.getTime() === today.getTime() || firstLogDate.getTime() === yesterday.getTime()) {
            calculatedStreak = 1;
            for (let i = 1; i < logs.length; i++) {
              const prevDay = new Date(currentCheckDate);
              prevDay.setDate(prevDay.getDate() - 1);
              
              const logDate = new Date(logs[i].logged_at * 1000);
              logDate.setHours(0, 0, 0, 0);

              if (logDate.getTime() === prevDay.getTime()) {
                calculatedStreak++;
                currentCheckDate = prevDay;
              } else if (logDate.getTime() === currentCheckDate.getTime()) {
                // duplicate
              } else {
                break;
              }
            }
          }
        }
        setStreak(calculatedStreak);

        // Compute dominant color breakdowns
        const counts: Record<string, number> = {};
        for (const item of activeItems) {
          const color = (item.dominantColor || "").toUpperCase();
          counts[color] = (counts[color] || 0) + 1;
        }

        const total = activeItems.length || 1;
        const stats: ColorStat[] = Object.entries(counts).map(([hex, count]) => ({
          hex,
          count,
          pct: count / total,
        }));
        stats.sort((a, b) => b.count - a.count);
        setColorStats(stats);
      } catch (e) {
        console.error("Failed to load profile details:", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfileStats();
  }, []);

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
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Style DNA</Text>
            <Text style={styles.subtitle}>Sizing and aesthetic metrics calculated by ChuChu.</Text>
          </View>
          <View style={styles.headerBtns}>
            <Pressable style={styles.headerIconBtn} onPress={() => router.push("/occasion-planner" as any)}>
              <Text style={styles.headerIconText}>✨ Planner</Text>
            </Pressable>
            <Pressable style={styles.headerIconBtn} onPress={() => router.push("/settings" as any)}>
              <Text style={styles.headerIconText}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        {/* Profile Hero Block */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrap}>
            <ChuChuMascot size={58} />
          </View>
          <Text style={styles.profileArchetype}>{greeting.archetypeName}</Text>
          <Text style={styles.profileTag}>Style DNA · updated today</Text>

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            <View style={styles.badgeChip}>
              <Text style={styles.badgeChipText}>🔥 {streak}-day streak</Text>
            </View>
            <View style={styles.badgeChip}>
              <Text style={styles.badgeChipText}>🌿 {closetHealth}% Closet Health</Text>
            </View>
            <View style={styles.badgeChip}>
              <Text style={styles.badgeChipText}>🤍 Trusted {acceptanceRate}% of picks</Text>
            </View>
          </View>

          <Pressable
            style={styles.editSpecsBtn}
            onPress={() => setEditModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit physical profile specifications"
          >
            <Text style={styles.editSpecsBtnText}>✏️ Edit Physical Specs</Text>
          </Pressable>
        </View>

        {/* Style DNA Breakdown Card */}
        {styleDna && (
          <View style={styles.dnaSection}>
            <Text style={styles.sectionTitle}>Aesthetic Breakdown</Text>
            <View style={styles.dnaCard}>
              {/* Primary Style */}
              <View style={styles.dnaRow}>
                <View style={styles.dnaHeaderRow}>
                  <Text style={styles.dnaName}>{styleDna.primaryStyle} (Primary)</Text>
                  <Text style={styles.dnaPct}>{styleDna.primaryPct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${styleDna.primaryPct}%`, backgroundColor: colors.rose }]} />
                </View>
              </View>

              {/* Secondary Style */}
              <View style={styles.dnaRow}>
                <View style={styles.dnaHeaderRow}>
                  <Text style={styles.dnaName}>{styleDna.secondaryStyle} (Secondary)</Text>
                  <Text style={styles.dnaPct}>{styleDna.secondaryPct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${styleDna.secondaryPct}%`, backgroundColor: colors.sage }]} />
                </View>
              </View>

              {/* Accent Style */}
              <View style={styles.dnaRow}>
                <View style={styles.dnaHeaderRow}>
                  <Text style={styles.dnaName}>{styleDna.accentStyle} (Accent)</Text>
                  <Text style={styles.dnaPct}>{styleDna.accentPct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${styleDna.accentPct}%`, backgroundColor: colors.gold }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* User Preferences Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Specifications</Text>
          <View style={styles.specsGrid}>
            <View
              style={styles.specBox}
              accessible={true}
              accessibilityLabel={`Height: ${profile.tempHeightCm ?? "Not set"} centimeters`}
            >
              <Text style={styles.specLabel}>Height</Text>
              <Text style={styles.specVal}>{profile.tempHeightCm ?? "—"} cm</Text>
            </View>
            
            <View
              style={styles.specBox}
              accessible={true}
              accessibilityLabel={`Weight: ${profile.tempWeightKg ?? "Not set"} kilograms`}
            >
              <Text style={styles.specLabel}>Weight</Text>
              <Text style={styles.specVal}>{profile.tempWeightKg ?? "—"} kg</Text>
            </View>
            
            <View
              style={styles.specBox}
              accessible={true}
              accessibilityLabel={`Preferred Fit: ${profile.tempPreferredFit ?? "Not set"}`}
            >
              <Text style={styles.specLabel}>Preferred Fit</Text>
              <Text style={[styles.specVal, styles.capitalize]}>
                {profile.tempPreferredFit ?? "—"}
              </Text>
            </View>
            
            <View
              style={styles.specBox}
              accessible={true}
              accessibilityLabel={`Skin Undertone: ${profile.tempSkinUndertone ?? "Not set"}`}
            >
              <Text style={styles.specLabel}>Undertone</Text>
              <Text style={styles.specVal}>{profile.tempSkinUndertone ?? "—"}</Text>
            </View>
          </View>
        </View>

        {/* Color Palette breakdown statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Closet Color Palette</Text>
          {colorStats.length > 0 ? (
            <View style={styles.colorPaletteCard}>
              {colorStats.map((stat) => (
                <View
                  key={stat.hex}
                  style={styles.colorRow}
                  accessible={true}
                  accessibilityLabel={`Color Hex Code ${stat.hex}, makes up ${Math.round(stat.pct * 100)} percent of your wardrobe, representing ${stat.count} item${stat.count > 1 ? "s" : ""}`}
                >
                  <View style={[styles.colorBubble, { backgroundColor: stat.hex }]} />
                  <View style={styles.barContainer}>
                    <View style={styles.barHeader}>
                      <Text style={styles.colorHex}>{stat.hex}</Text>
                      <Text style={styles.colorCount}>
                        {stat.count} item{stat.count > 1 ? "s" : ""} ({Math.round(stat.pct * 100)}%)
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${stat.pct * 100}%`, backgroundColor: stat.hex },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyColorCard}>
              <Text style={styles.emptyColorText}>Catalog items to visualize color stats.</Text>
            </View>
          )}
        </View>
        {/* Edit Profile Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Edit Physical Profile ✏️</Text>
              <Text style={styles.modalSubtitle}>Update your measurements for better fit predictions.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={editHeight}
                  onChangeText={setEditHeight}
                  placeholder="e.g. 172"
                  placeholderTextColor={colors.cocoaSoft}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={editWeight}
                  onChangeText={setEditWeight}
                  placeholder="e.g. 68"
                  placeholderTextColor={colors.cocoaSoft}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Styling Focus</Text>
                <View style={styles.fitPillRow}>
                  {["Women's", "Men's", "Unisex"].map((g) => (
                    <Pressable
                      key={g}
                      style={[styles.fitPill, editGender === g && styles.fitPillSelected]}
                      onPress={() => setEditGender(g)}
                    >
                      <Text style={[styles.fitPillText, editGender === g && styles.fitPillTextSelected]}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Body Silhouette</Text>
                <View style={styles.fitPillRow}>
                  {["Hourglass", "Pear", "Rectangle", "Apple"].map((s) => (
                    <Pressable
                      key={s}
                      style={[styles.fitPill, editBodyShape === s && styles.fitPillSelected]}
                      onPress={() => setEditBodyShape(s)}
                    >
                      <Text style={[styles.fitPillText, editBodyShape === s && styles.fitPillTextSelected]}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color Season Palette</Text>
                <View style={styles.fitPillRow}>
                  {["Spring Warm", "Summer Cool", "Warm Autumn", "Winter Vivid"].map((c) => (
                    <Pressable
                      key={c}
                      style={[styles.fitPill, editColorSeason === c && styles.fitPillSelected]}
                      onPress={() => setEditColorSeason(c)}
                    >
                      <Text style={[styles.fitPillText, editColorSeason === c && styles.fitPillTextSelected]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fit Preference</Text>
                <View style={styles.fitPillRow}>
                  {["Slim", "Regular", "Relaxed", "Oversized"].map((f) => (
                    <Pressable
                      key={f}
                      style={[styles.fitPill, editFit === f && styles.fitPillSelected]}
                      onPress={() => setEditFit(f)}
                    >
                      <Text style={[styles.fitPillText, editFit === f && styles.fitPillTextSelected]}>{f}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Waist Size (inches)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={editWaistSize}
                  onChangeText={setEditWaistSize}
                  placeholder="e.g. 30"
                  placeholderTextColor={colors.cocoaSoft}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <Pressable style={styles.cancelModalBtn} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelModalBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveModalBtn} onPress={handleSaveProfile}>
                  <Text style={styles.saveModalBtnText}>Save Specifications</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    flex: 1,
    gap: 6,
  },
  headerBtns: {
    flexDirection: "row",
    gap: 8,
  },
  headerIconBtn: {
    backgroundColor: colors.creamLinen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  headerIconText: {
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
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
  archetypeCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: colors.creamLinen,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    alignItems: "center",
  },
  archetypeEmoji: {
    fontSize: 32,
  },
  archetypeInfo: {
    flex: 1,
    gap: 4,
  },
  archetypeTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 14,
    color: colors.cocoa,
    letterSpacing: 0.5,
  },
  archetypeDesc: {
    fontFamily: "Nunito-Bold",
    fontSize: 11,
    color: colors.cocoaSoft,
    lineHeight: 15,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 18,
    color: colors.cocoa,
  },
  dnaSection: {
    gap: 12,
  },
  dnaCard: {
    backgroundColor: colors.creamLinen,
    padding: 20,
    borderRadius: radius.md,
    gap: 16,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
  },
  dnaRow: {
    gap: 6,
  },
  dnaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dnaName: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoa,
  },
  dnaPct: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 13,
    color: colors.cocoa,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.creamDeep,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specBox: {
    width: "47%",
    backgroundColor: colors.whiteSoft,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    borderRadius: radius.sm,
    padding: 16,
    gap: 6,
  },
  specLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
  },
  specVal: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 16,
    color: colors.cocoa,
  },
  capitalize: {
    textTransform: "capitalize",
  },
  colorPaletteCard: {
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.md,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 16,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  colorBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
  },
  barContainer: {
    flex: 1,
    gap: 6,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colorHex: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  colorCount: {
    fontFamily: "Nunito-Regular",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.creamDeep,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  emptyColorCard: {
    backgroundColor: colors.creamLinen,
    padding: 20,
    borderRadius: radius.md,
    alignItems: "center",
  },
  emptyColorText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
  },
  profileHero: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  avatarWrap: {
    marginBottom: 8,
  },
  profileArchetype: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 19,
    color: colors.cocoa,
  },
  profileTag: {
    fontFamily: "Nunito-Regular",
    fontSize: 11.5,
    color: colors.cocoaSoft,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    justifyContent: "center",
  },
  badgeChip: {
    backgroundColor: colors.goldPale,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  badgeChipText: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 10,
    color: colors.goldDark,
  },
  editSpecsBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: colors.creamLinen,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  editSpecsBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(74, 50, 38, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.whiteSoft,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
  },
  modalSubtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoaSoft,
    marginTop: -8,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  modalInput: {
    backgroundColor: colors.creamLinen,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  fitPillRow: {
    flexDirection: "row",
    gap: 8,
  },
  fitPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: colors.creamLinen,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  fitPillSelected: {
    backgroundColor: colors.rose,
    borderColor: colors.roseDark,
  },
  fitPillText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  fitPillTextSelected: {
    color: "#fff",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: colors.creamLinen,
  },
  cancelModalBtnText: {
    fontFamily: "Nunito-Bold",
    color: colors.cocoa,
    fontSize: 14,
  },
  saveModalBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: colors.rose,
  },
  saveModalBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
});
