import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors, radius } from "@/theme/tokens";

interface ReasonPillRowProps {
  reasons: string[];
}

export function ReasonPillRow({ reasons }: ReasonPillRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {reasons.map((reason, i) => (
        <View key={i} style={styles.pill}>
          <Text style={styles.text}>{reason}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 4,
  },
  pill: {
    backgroundColor: colors.creamDeep,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cocoaSoft,
  },
  text: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
});
