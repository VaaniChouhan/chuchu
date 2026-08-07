import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors, radius } from "@/theme/tokens";

interface ReasonPillRowProps {
  reasons: string[];
}

export const ReasonPillRow = React.memo(function ReasonPillRow({ reasons }: ReasonPillRowProps) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityLabel={`Styling reasons: ${reasons.join(", ")}`}
    >
      {reasons.map((reason, i) => (
        <View key={i} style={styles.pill}>
          <Text style={styles.text}>{reason}</Text>
        </View>
      ))}
    </ScrollView>
  );
});

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
