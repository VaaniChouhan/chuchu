import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { archetypeAccents, Archetype, colors, radius, typeScale } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";

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
    setSelected(a);
    setArchetype(a);
    // Visual delay to let the user see the selected choice
    setTimeout(() => {
      router.replace("/onboarding/style-import");
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Dots */}
      <View style={styles.dots}>
        {[1, 1, 0, 0, 0, 0].map((done, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: done ? colors.cocoa : colors.creamDeep },
            ]}
          />
        ))}
      </View>

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
  dots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
