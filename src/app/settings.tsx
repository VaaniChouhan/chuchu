
import { StyleSheet, View, Text, Pressable, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import { colors, radius, typeScale } from "@/theme/tokens";
import { getDb } from "@/db/schema";
import { useProfileStore, ThemeOverride } from "@/store/useProfileStore";

export default function SettingsScreen() {
  const profile = useProfileStore();

  // Read persisted preferences from store
  const cloudBackup = useProfileStore((s) => s.cloudBackup);
  const telemetry = useProfileStore((s) => s.telemetry);
  const implicitLearning = useProfileStore((s) => s.implicitLearning);
  const themeOverride = useProfileStore((s) => s.themeOverride);
  const setPreference = useProfileStore((s) => s.setPreference);
  const setThemeOverride = useProfileStore((s) => s.setThemeOverride);

  const handleExportData = async () => {
    try {
      const db = getDb();
      const userProfile = await db.getFirstAsync("SELECT * FROM user_profile");
      const wardrobe = await db.getAllAsync("SELECT * FROM wardrobe_items");
      const history = await db.getAllAsync("SELECT * FROM outfit_history");
      const moods = await db.getAllAsync("SELECT * FROM mood_logs");
      const wishlist = await db.getAllAsync("SELECT * FROM wishlist_items");

      const exportBundle = {
        exportedAt: new Date().toISOString(),
        profile: userProfile,
        wardrobeItemsCount: wardrobe.length,
        wardrobe,
        outfitHistory: history,
        moodLogs: moods,
        wishlist,
      };

      const fs = FileSystem as any;
      const dir = fs.documentDirectory || fs.cacheDirectory || "";
      const path = `${dir.replace(/\/?$/, "/")}chuchu_export.json`;
      await FileSystem.writeAsStringAsync(path, JSON.stringify(exportBundle, null, 2));

      Alert.alert(
        "Export Complete! 📦",
        `Export saved to app documents.\n\nContains ${wardrobe.length} catalogued items and full wear history.`
      );
    } catch (e) {
      console.error("Export failed:", e);
      Alert.alert("Error", "Failed to compile wardrobe export data.");
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete All Data & Account?",
      "This action cannot be undone. All wardrobe items, wear logs, and style metrics will be permanently erased.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase Everything",
          style: "destructive",
          onPress: async () => {
            try {
              const db = getDb();
              await db.execAsync(`
                DELETE FROM wardrobe_items;
                DELETE FROM outfit_history;
                DELETE FROM mood_logs;
                DELETE FROM wishlist_items;
                DELETE FROM outfit_items;
                DELETE FROM occasions;
                UPDATE user_profile SET onboarding_complete = 0, archetype = NULL;
              `);
              profile.setArchetype(null as any);
              await profile.hydrate();
              Alert.alert("Cleared", "All wardrobe data has been reset.");
              router.replace("/onboarding/welcome");
            } catch (e) {
              console.error("Failed to delete account data:", e);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} accessible={true} accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Settings & Privacy</Text>
          <Text style={styles.subtitle}>Manage privacy preferences, data exports, and account settings.</Text>
        </View>

        {/* Privacy Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>

          <View style={styles.toggleCard}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Implicit Style Learning</Text>
              <Text style={styles.toggleSub}>Learn from your daily mood check-ins to refine style engine scores.</Text>
            </View>
            <Switch
              value={implicitLearning}
              onValueChange={(v) => setPreference("implicitLearning", v)}
              trackColor={{ false: colors.creamDeep, true: colors.rose }}
              accessible={true}
              accessibilityLabel="Toggle implicit style learning"
            />
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Cloud Backup (Encrypted Sync)</Text>
              <Text style={styles.toggleSub}>Backup wardrobe metadata safely to encrypted cloud storage.</Text>
            </View>
            <Switch
              value={cloudBackup}
              onValueChange={(v) => setPreference("cloudBackup", v)}
              trackColor={{ false: colors.creamDeep, true: colors.rose }}
              accessible={true}
              accessibilityLabel="Toggle cloud backup"
            />
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Anonymous Telemetry</Text>
              <Text style={styles.toggleSub}>Help improve recommendations with privacy-respecting aggregate data.</Text>
            </View>
            <Switch
              value={telemetry}
              onValueChange={(v) => setPreference("telemetry", v)}
              trackColor={{ false: colors.creamDeep, true: colors.rose }}
              accessible={true}
              accessibilityLabel="Toggle anonymous telemetry"
            />
          </View>

          {/* Theme Selector */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Appearance</Text>
              <Text style={styles.toggleSub}>Choose light, dark, or follow system theme.</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["system", "light", "dark"] as ThemeOverride[]).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setThemeOverride(t)}
                  style={[
                    styles.themeChip,
                    themeOverride === t && styles.themeChipActive,
                  ]}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: themeOverride === t }}
                  accessibilityLabel={t === "system" ? "Auto" : t.charAt(0).toUpperCase() + t.slice(1)}
                >
                  <Text style={[
                    styles.themeChipText,
                    themeOverride === t && styles.themeChipTextActive,
                  ]}>
                    {t === "system" ? "Auto" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Ownership & Rights</Text>

          <Pressable style={styles.actionBtn} onPress={handleExportData} accessible={true} accessibilityRole="button" accessibilityLabel="Export My Data">
            <Text style={styles.actionBtnEmoji}>📦</Text>
            <View style={styles.actionBtnTextWrap}>
              <Text style={styles.actionBtnTitle}>Export My Data</Text>
              <Text style={styles.actionBtnSub}>Download chuchu_export.json bundle containing all items & metrics.</Text>
            </View>
          </Pressable>

          <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDeleteData} accessible={true} accessibilityRole="button" accessibilityLabel="Delete My Account & Data" accessibilityHint="This action cannot be undone">
            <Text style={styles.actionBtnEmoji}>🗑️</Text>
            <View style={styles.actionBtnTextWrap}>
              <Text style={[styles.actionBtnTitle, { color: colors.roseDark }]}>Delete My Account & Data</Text>
              <Text style={styles.actionBtnSub}>Permanently wipe SQLite records & reset onboarding status.</Text>
            </View>
          </Pressable>
        </View>

        {/* Legal & Policies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Policies</Text>

          <Pressable style={styles.actionBtn} accessible={true} accessibilityRole="button" accessibilityLabel="Privacy Policy" onPress={() => {
            Alert.alert(
              "Privacy Policy Summary",
              "We respect your privacy under the DPDP Act.\n\n" +
              "1. Data Localisation: All wardrobe and style data stays on your device.\n" +
              "2. Minimal Telemetry: Analytics are strictly anonymous and opt-in.\n" +
              "3. User Rights: You hold full rights to export or permanently delete your data at any time.\n" +
              "4. No Third-Party Selling: Your personal data is never sold to third parties."
            );
          }}>
            <Text style={styles.actionBtnEmoji}>🛡️</Text>
            <View style={styles.actionBtnTextWrap}>
              <Text style={styles.actionBtnTitle}>Privacy Policy</Text>
              <Text style={styles.actionBtnSub}>Read our data handling summary and your rights.</Text>
            </View>
          </Pressable>

          <Pressable style={styles.actionBtn} accessible={true} accessibilityRole="button" accessibilityLabel="Terms of Service" onPress={() => {
            Alert.alert(
              "Terms of Service Summary",
              "Welcome to ChuChu.\n\n" +
              "1. Usage: The app is for personal wardrobe management.\n" +
              "2. Content Ownership: You retain ownership of all images you upload.\n" +
              "3. Service Availability: We provide this app 'as is' without guarantees of uptime.\n" +
              "4. Safety: Do not upload inappropriate or illicit content."
            );
          }}>
            <Text style={styles.actionBtnEmoji}>📜</Text>
            <View style={styles.actionBtnTextWrap}>
              <Text style={styles.actionBtnTitle}>Terms of Service</Text>
              <Text style={styles.actionBtnSub}>Rules for using the ChuChu application.</Text>
            </View>
          </Pressable>
        </View>

        {/* App Meta Info */}
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>ChuChu v{Constants.expoConfig?.version ?? '1.0.0'} (Build 2026.08)</Text>
          <Text style={styles.metaSub}>Offline-First ML Architecture • DPDP Act Compliant</Text>
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.creamLinen,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 14,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
  },
  toggleSub: {
    fontFamily: "Nunito-Regular",
    fontSize: 11,
    color: colors.cocoaSoft,
    lineHeight: 15,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.creamLinen,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 14,
  },
  deleteBtn: {
    borderColor: colors.rosePale,
    backgroundColor: colors.creamLinen,
  },
  actionBtnEmoji: {
    fontSize: 24,
  },
  actionBtnTextWrap: {
    flex: 1,
    gap: 2,
  },
  actionBtnTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
  },
  actionBtnSub: {
    fontFamily: "Nunito-Regular",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  metaBox: {
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  metaText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
  },
  metaSub: {
    fontFamily: "Nunito-Regular",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  themeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.creamDeep,
  },
  themeChipActive: {
    backgroundColor: colors.cocoa,
  },
  themeChipText: {
    fontFamily: "Nunito-Bold",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  themeChipTextActive: {
    color: colors.whiteSoft,
  },
});
