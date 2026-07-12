import { View, Text, StyleSheet, Pressable, Modal, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { colors, radius } from "@/theme/tokens";

export interface ActionOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionOption[];
}

export function ActionSheet({ visible, onClose, title, options }: ActionSheetProps) {
  const slideAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get("window").height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop Tap to Close */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Action Card Sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {title && <Text style={styles.title}>{title}</Text>}

          <View style={styles.optionsContainer}>
            {options.map((opt, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.optionBtn,
                  pressed && styles.pressed,
                  i < options.length - 1 && styles.borderBottom,
                ]}
                onPress={() => {
                  opt.onPress();
                  onClose();
                }}
              >
                <Text style={[styles.optionText, opt.destructive && styles.destructiveText]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: colors.whiteSoft,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 24,
    gap: 16,
    maxHeight: "80%",
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderBottomWidth: 0,
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 16,
    color: colors.cocoa,
    textAlign: "center",
    marginBottom: 8,
  },
  optionsContainer: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    backgroundColor: colors.whiteSoft,
    overflow: "hidden",
  },
  optionBtn: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  borderBottom: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.creamDeep,
  },
  optionText: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
    color: colors.cocoa,
  },
  destructiveText: {
    color: colors.roseDark,
  },
  closeBtn: {
    backgroundColor: colors.creamDeep,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: 8,
  },
  closeText: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 16,
    color: colors.cocoa,
  },
  pressed: {
    opacity: 0.7,
  },
});
