import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Alert, TextInput } from "react-native";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { getDb } from "@/db/schema";
import { ChuChuMascot } from "@/components/ChuChu";
import { hapticSuccess } from "@/utils/haptics";
import ReAnimated, { SlideInDown } from "react-native-reanimated";

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
}

const MOOD_OPTIONS = [
  { val: "loved", emoji: "😍", label: "Loved it" },
  { val: "fine", emoji: "😌", label: "It's fine" },
  { val: "not_quite", emoji: "😕", label: "Not quite" },
];

export function CheckInModal({ visible, onClose }: CheckInModalProps) {
  const [selected, setSelected] = useState<string>("loved");
  const [note, setNote] = useState<string>("");

  const handleSubmit = async () => {
    try {
      const db = getDb();
      const historyRow = await db.getFirstAsync<any>(
        "SELECT id FROM outfit_history ORDER BY worn_at DESC LIMIT 1"
      );
      const historyId = historyRow ? historyRow.id : null;

      await db.runAsync(
        "INSERT INTO mood_logs (outfit_history_id, mood, note) VALUES (?, ?, ?)",
        [historyId, selected, note]
      );

      hapticSuccess();
      Alert.alert("Feedback Logged! 🎀", "Thank you! ChuChu will use this to optimize tomorrow's recommendations.");
      onClose();
    } catch (e) {
      console.error("Failed to insert mood log:", e);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <ReAnimated.View entering={SlideInDown.springify().damping(15)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8} accessibilityLabel="Close modal">
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>

          <ChuChuMascot size={64} />
          
          <View style={styles.checkinBubble}>
            <Text style={styles.bubbleText}>How'd today's fit feel?</Text>
          </View>

          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((m) => {
              const isSelected = selected === m.val;
              return (
                <Pressable
                  key={m.val}
                  style={[styles.moodBtn, isSelected && styles.moodBtnPicked]}
                  onPress={() => setSelected(m.val)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={styles.moodLbl}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={styles.noteBox}
            multiline
            numberOfLines={3}
            placeholder="Tell ChuChu more (optional)"
            placeholderTextColor={colors.cocoaSoft}
            value={note}
            onChangeText={setNote}
          />

          <Pressable style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Save & carry on</Text>
          </Pressable>
          </Pressable>
        </ReAnimated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(74, 50, 38, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    gap: 16,
    position: "relative",
    ...shadow.lift,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.creamDeep,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
    lineHeight: 16,
  },
  checkinBubble: {
    backgroundColor: colors.rosePale,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingVertical: 13,
    paddingHorizontal: 17,
    maxWidth: 245,
  },
  bubbleText: {
    fontFamily: "Nunito-Bold",
    fontSize: 13.5,
    color: colors.cocoa,
    textAlign: "center",
  },
  moodRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  moodBtn: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 6,
  },
  moodBtnPicked: {
    borderColor: colors.rose,
    backgroundColor: colors.rosePale,
  },
  moodEmoji: {
    fontSize: 21,
  },
  moodLbl: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 9.5,
    color: colors.cocoaSoft,
  },
  noteBox: {
    width: "100%",
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    padding: 12,
    fontFamily: "Nunito-Regular",
    fontSize: 12.5,
    backgroundColor: colors.whiteSoft,
    color: colors.cocoa,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: colors.rose,
    paddingVertical: 14,
    borderRadius: 999,
    width: "100%",
    alignItems: "center",
    ...shadow.soft,
  },
  submitBtnText: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 14.5,
    color: "#fff",
  },
});
