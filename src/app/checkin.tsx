import { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { getDb } from "@/db/schema";
import { useProfileStore } from "@/store/useProfileStore";

const MOODS = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "🥱", label: "Tired", value: "tired" },
  { emoji: "😤", label: "Frustrated", value: "frustrated" },
  { emoji: "💪", label: "Confident", value: "confident" },
  { emoji: "🤩", label: "Excited", value: "excited" },
  { emoji: "😐", label: "Meh", value: "meh" },
  { emoji: "🥺", label: "Down", value: "down" },
];

export default function CheckInScreen() {
  const archetype = useProfileStore((s) => s.archetype);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!selectedMood) {
      Alert.alert("Pick a mood", "Tap on an emoji to tell ChuChu how you feel today.");
      return;
    }
    setSaving(true);
    try {
      const db = getDb();
      await db.runAsync(
        `INSERT INTO daily_checkins (mood, note, archetype, created_at) VALUES (?, ?, ?, ?)`,
        [selectedMood, note.trim() || null, archetype, new Date().toISOString()]
      );
      router.back();
    } catch (e) {
      console.error("Failed to save check-in:", e);
      Alert.alert("Oops", "Couldn't save your check-in. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [selectedMood, note, archetype]);

  return (
    <SafeAreaView style={styles.backdrop}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.closeBtn} onPress={() => router.back()} accessible={true} accessibilityRole="button" accessibilityLabel="Close daily check-in">
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
            <Text style={styles.title}>Daily Check-in</Text>
            <View style={{ width: 36 }} />
          </View>

          <Text style={styles.subtitle}>
            How are you feeling today? This helps ChuChu learn your style moods.
          </Text>

          {/* Mood Grid */}
          <View style={styles.moodGrid}>
            {MOODS.map((mood) => (
              <Pressable
                key={mood.value}
                style={[
                  styles.moodChip,
                  selectedMood === mood.value && styles.moodChipActive,
                ]}
                onPress={() => setSelectedMood(mood.value)}
                accessible={true}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedMood === mood.value }}
                accessibilityLabel={mood.label}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.value && styles.moodLabelActive,
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Optional note */}
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)..."
            placeholderTextColor={colors.cocoaFaint}
            value={note}
            onChangeText={setNote}
            maxLength={200}
            multiline
            textAlignVertical="top"
            accessible={true}
            accessibilityLabel="Optional note about your outfit today"
          />

          {/* Save */}
          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save daily check-in"
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "✓ Save Check-in"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(74, 50, 38, 0.45)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: colors.whiteSoft,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
    ...shadow.lift,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: colors.cocoa,
    fontFamily: "Nunito-Bold",
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.screenTitle,
    color: colors.cocoa,
  },
  subtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: typeScale.body,
    color: colors.cocoaSoft,
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  moodChip: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.creamLinen,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 4,
  },
  moodChipActive: {
    backgroundColor: colors.rosePale,
    borderColor: colors.rose,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  moodLabelActive: {
    color: colors.roseDark,
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoa,
    minHeight: 72,
    backgroundColor: colors.creamLinen,
  },
  saveBtn: {
    backgroundColor: colors.cocoa,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    ...shadow.soft,
  },
  saveBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 15,
    color: colors.whiteSoft,
  },
});
