import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Alert } from "react-native";
import { colors, radius, typeScale } from "@/theme/tokens";
import { getDb } from "@/db/schema";

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
}

const MOODS = [
  { val: "loved", label: "Loved it 💖", note: "Felt amazing and confident." },
  { val: "too_hot", label: "Too warm ☀️", note: "Outfits were a bit too heavy." },
  { val: "too_cold", label: "Too cold ❄️", note: "Need warmer layers next time." },
  { val: "not_me", label: "Not my style 🙅", note: "Didn't match my personality today." },
];

export function CheckInModal({ visible, onClose }: CheckInModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selected) return;

    try {
      const db = getDb();
      // Fetch latest logged outfit history row
      const historyRow = await db.getFirstAsync<any>(
        "SELECT id FROM outfit_history ORDER BY worn_at DESC LIMIT 1"
      );
      const historyId = historyRow ? historyRow.id : null;

      const moodConfig = MOODS.find((m) => m.val === selected);
      
      await db.runAsync(
        "INSERT INTO mood_logs (outfit_history_id, mood, note) VALUES (?, ?, ?)",
        [historyId, selected, moodConfig?.note ?? ""]
      );

      Alert.alert("Feedback Logged! 🎀", "Thank you! ChuChu will use this to optimize tomorrow's recommendations.");
      onClose();
    } catch (e) {
      console.error("Failed to insert mood log:", e);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.mascot}>🌷</Text>
          <Text style={styles.title}>Daily Check-in</Text>
          <Text style={styles.subtitle}>How did today's outfit feel?</Text>

          <View style={styles.choices}>
            {MOODS.map((m) => {
              const isSelected = selected === m.val;
              return (
                <Pressable
                  key={m.val}
                  style={[styles.choiceBtn, isSelected && styles.choiceActive]}
                  onPress={() => setSelected(m.val)}
                >
                  <Text style={[styles.choiceText, isSelected && styles.choiceTextActive]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.btnText}>Skip</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.submitBtn, !selected && styles.btnDisabled]}
              disabled={!selected}
              onPress={handleSubmit}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.lg,
    padding: 28,
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: colors.cocoa,
    gap: 16,
  },
  mascot: {
    fontSize: 48,
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.screenTitle,
    color: colors.cocoa,
  },
  subtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoaSoft,
    marginBottom: 8,
  },
  choices: {
    width: "100%",
    gap: 10,
  },
  choiceBtn: {
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.whiteSoft,
  },
  choiceActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rosePale,
  },
  choiceText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
  },
  choiceTextActive: {
    color: colors.roseDark,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    width: "100%",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  cancelBtn: {
    borderColor: colors.creamDeep,
    backgroundColor: colors.whiteSoft,
  },
  submitBtn: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: colors.creamDeep,
    borderColor: colors.creamDeep,
  },
  btnText: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 14,
    color: colors.cocoa,
  },
});
