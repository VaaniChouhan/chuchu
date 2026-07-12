import { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, typeScale } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";

interface ColorStat {
  hex: string;
  count: number;
  pct: number;
}

export default function Profile() {
  const profile = useProfileStore();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [colorStats, setColorStats] = useState<ColorStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileStats() {
      try {
        await profile.hydrate();
        const activeItems = await getAllWardrobeItems(false);
        setItems(activeItems);

        // Compute dominant color breakdowns
        const counts: Record<string, number> = {};
        for (const item of activeItems) {
          const color = item.dominantColor.toUpperCase();
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
        <View style={styles.header}>
          <Text style={styles.title}>Your DNA</Text>
          <Text style={styles.subtitle}>Sizing and styling metrics tracked by ChuChu.</Text>
        </View>

        {/* Persona Archetype Badge */}
        <View
          style={styles.archetypeCard}
          accessible={true}
          accessibilityLabel={`Active Persona Archetype: ${profile.archetype || "sunny"}`}
        >
          <Text style={styles.archetypeEmoji}>🌷</Text>
          <View style={styles.archetypeInfo}>
            <Text style={styles.archetypeTitle}>
              Archetype: {String(profile.archetype || "sunny").toUpperCase()}
            </Text>
            <Text style={styles.archetypeDesc}>
              Your styling recommendations follow a customized tone tailored to this persona.
            </Text>
          </View>
        </View>

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
});
