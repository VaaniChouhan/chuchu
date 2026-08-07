import { useState } from "react";
import { Platform, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { archetypeAccents, Archetype, colors, radius, typeScale } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { StepIndicator } from "@/components/StepIndicator";

const OPTIONS: { archetype: Archetype; emoji: string; label: string }[] = [
  { archetype: "dreamer", emoji: "🌷", label: "Tea in bed, taking it slow" },
  { archetype: "minimalist", emoji: "🤍", label: "Quiet, tidy, no fuss" },
  { archetype: "sunny", emoji: "🌤️", label: "Farmers market, sun on my face" },
  { archetype: "planner", emoji: "📝", label: "Already mapping out the week" },
];

export default function Quiz() {
  const [selected, setSelected] = useState<Archetype | null>(null);
  const setArchetype = useProfileStore((s) => s.setArchetype);

  const handleSelect = (a: Archetype) => {
    if (selected) return;
    setSelected(a);
    setArchetype(a);
    // Visual delay to let the user see the selected choice
    setTimeout(() => {
      router.replace("/onboarding/style-import");
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <StepIndicator totalSteps={6} currentStep={2} />

      <Text style={styles.question}>Your ideal Sunday morning looks like...</Text>

      <View style={styles.optionsContainer}>
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.archetype;
          const config = archetypeAccents[opt.archetype];
          return (
            <Pressable
              key={opt.archetype}
              onPress={() => handleSelect(opt.archetype)}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? config.accent : colors.creamDeep,
                  backgroundColor: isSelected ? config.pale : colors.whiteSoft,
                },
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${opt.label}`}
              accessibilityHint={isSelected ? "Selected" : "Double tap to select this option"}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[styles.label, { color: colors.cocoa }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  question: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.screenTitle,
    textAlign: "center",
    color: colors.cocoa,
    marginBottom: 40,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderRadius: radius.md,
    padding: 20,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
    flexShrink: 1,
  },
});
