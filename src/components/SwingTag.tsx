import { View, Text, StyleSheet } from "react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { archetypeAccents, colors } from "@/theme/tokens";

interface SwingTagProps {
  percent: number;
  label: string;
}

export function SwingTag({ percent, label }: SwingTagProps) {
  const archetype = useProfileStore((s) => s.archetype) ?? "sunny";
  const accentColor = archetypeAccents[archetype].accent;

  return (
    <View style={styles.wrapper} accessibilityLabel={`Confidence: ${percent} percent, ${label}`}>
      {/* Little tag string */}
      <View style={styles.string} />
      {/* Tag body */}
      <View style={[styles.tagBody, { backgroundColor: accentColor }]}>
        <Text style={styles.tagText}>{percent}% {label}</Text>
      </View>
      {/* Punch hole */}
      <View style={styles.hole} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    position: "absolute",
    top: -12,
    right: 20,
    zIndex: 10,
  },
  string: {
    width: 2,
    height: 12,
    backgroundColor: colors.cocoaSoft,
  },
  tagBody: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.cocoa,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tagText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#ffffff",
    fontSize: 11,
    textTransform: "uppercase",
  },
  hole: {
    position: "absolute",
    top: 15,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.whiteSoft,
    borderWidth: 1.5,
    borderColor: colors.cocoa,
  },
});
