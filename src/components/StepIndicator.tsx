import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/tokens";

interface StepIndicatorProps {
  /** Total number of steps */
  totalSteps: number;
  /** Current step (1-indexed) */
  currentStep: number;
}

/**
 * Reusable onboarding progress dots. Shows which step the user is on.
 * Active steps are filled with cocoa, upcoming steps are cream.
 */
export const StepIndicator = React.memo(function StepIndicator({
  totalSteps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < currentStep ? colors.cocoa : colors.creamDeep,
              width: i === currentStep - 1 ? 18 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
