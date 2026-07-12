import { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";

const SWATCHES = [
  { name: "Cool", color: "#F5D4C1", description: "Pink/blue undertones, burns easily" },
  { name: "Neutral", color: "#EED1B5", description: "Mix of warm and cool, tans/burns equally" },
  { name: "Warm", color: "#E0B796", description: "Golden/yellow undertones, tans easily" },
];

export default function BodyProfile() {
  const setTempProfile = useProfileStore((s) => s.setTempProfile);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fit, setFit] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  
  const [undertoneMethod, setUndertoneMethod] = useState<"selfie" | "manual" | null>(null);
  const [undertone, setUndertone] = useState<string | null>(null);

  const handleNext = () => {
    setTempProfile({
      tempHeightCm: height ? parseFloat(height) : null,
      tempWeightKg: weight ? parseFloat(weight) : null,
      tempPreferredFit: fit,
      tempBudgetTier: budget,
      tempSkinUndertone: undertone,
    });
    router.replace("/onboarding/add-items");
  };

  const isFormValid = fit && budget && (undertoneMethod !== null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Dots */}
        <View style={styles.dots}>
          {[1, 1, 1, 1, 0, 0].map((done, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: done ? colors.cocoa : colors.creamDeep },
              ]}
            />
          ))}
        </View>

        <Text style={styles.question}>Tell us about yourself</Text>
        <Text style={styles.subtext}>This helps ChuChu customize sizing and color matching options.</Text>

        {/* Height & Weight Inputs */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="e.g. 175"
              style={styles.input}
              accessibilityLabel="Height in centimeters"
              accessibilityHint="Type your height using numbers"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="e.g. 68"
              style={styles.input}
              accessibilityLabel="Weight in kilograms"
              accessibilityHint="Type your weight using numbers"
            />
          </View>
        </View>

        {/* Preferred Fit Segmented Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Preferred Fit</Text>
          <View style={styles.toggleRow}>
            {["fitted", "regular", "loose"].map((f) => (
              <Pressable
                key={f}
                style={[styles.toggleBtn, fit === f && styles.toggleActive]}
                onPress={() => setFit(f)}
                accessible={true}
                accessibilityRole="button"
                accessibilityState={{ selected: fit === f }}
                accessibilityLabel={`${f} fit`}
                accessibilityHint={`Sets clothing sizing fit preference to ${f}`}
              >
                <Text style={[styles.toggleText, fit === f && styles.toggleTextActive]}>{f}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Budget Segmented Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget Tier</Text>
          <View style={styles.toggleRow}>
            {["low", "mid", "high"].map((b) => (
              <Pressable
                key={b}
                style={[styles.toggleBtn, budget === b && styles.toggleActive]}
                onPress={() => setBudget(b)}
                accessible={true}
                accessibilityRole="button"
                accessibilityState={{ selected: budget === b }}
                accessibilityLabel={`${b} budget`}
                accessibilityHint={`Sets shopping budget tier preference to ${b}`}
              >
                <Text style={[styles.toggleText, budget === b && styles.toggleTextActive]}>{b}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Equal-Weight Undertone Method Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Skin Undertone Selection</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.halfToggleBtn, undertoneMethod === "selfie" && styles.toggleActive]}
              onPress={() => {
                setUndertoneMethod("selfie");
                setUndertone("Neutral"); // Mock selfie result immediately
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ selected: undertoneMethod === "selfie" }}
              accessibilityLabel="Selfie Scanner"
              accessibilityHint="Use camera to analyze facial coloring profile"
            >
              <Text style={[styles.toggleText, undertoneMethod === "selfie" && styles.toggleTextActive]}>Selfie Scanner</Text>
            </Pressable>
            <Pressable
              style={[styles.halfToggleBtn, undertoneMethod === "manual" && styles.toggleActive]}
              onPress={() => setUndertoneMethod("manual")}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ selected: undertoneMethod === "manual" }}
              accessibilityLabel="Pick Manually"
              accessibilityHint="Pick your skin undertone category manually from a swatch list"
            >
              <Text style={[styles.toggleText, undertoneMethod === "manual" && styles.toggleTextActive]}>Pick Manually</Text>
            </Pressable>
          </View>
        </View>

        {/* Selfie Mode Feedback */}
        {undertoneMethod === "selfie" && (
          <View style={styles.feedbackBox} accessible={true} accessibilityLabel="Detected skin profile: Neutral">
            <Text style={styles.feedbackEmoji}>📷</Text>
            <Text style={styles.feedbackTitle}>Scan Simulation Active</Text>
            <Text style={styles.feedbackDesc}>Detected: **Neutral Undertone** based on your facial color profile.</Text>
          </View>
        )}

        {/* Manual Swatch Selection */}
        {undertoneMethod === "manual" && (
          <View style={styles.swatchContainer}>
            {SWATCHES.map((swatch) => {
              const isSelected = undertone === swatch.name;
              return (
                <Pressable
                  key={swatch.name}
                  style={[styles.swatchCard, isSelected && styles.swatchCardSelected]}
                  onPress={() => setUndertone(swatch.name)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${swatch.name} undertone`}
                  accessibilityHint={swatch.description}
                >
                  <View style={[styles.swatchCircle, { backgroundColor: swatch.color }]} />
                  <View style={styles.swatchTextContainer}>
                    <Text style={styles.swatchName}>{swatch.name}</Text>
                    <Text style={styles.swatchDesc}>{swatch.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Continue Button */}
        <Pressable
          style={[styles.cta, !isFormValid && styles.ctaDisabled]}
          disabled={!isFormValid}
          onPress={handleNext}
          accessible={true}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isFormValid }}
          accessibilityLabel="Continue"
          accessibilityHint="Confirm physical details and proceed to scanning wardrobe items"
        >
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 24,
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
    marginBottom: 8,
    lineHeight: 28,
  },
  subtext: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoaSoft,
    textAlign: "center",
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: colors.cocoa,
    backgroundColor: colors.whiteSoft,
  },
  section: {
    gap: 10,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.whiteSoft,
  },
  halfToggleBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.whiteSoft,
  },
  toggleActive: {
    borderColor: colors.rose,
    backgroundColor: colors.rosePale,
  },
  toggleText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
    textTransform: "capitalize",
  },
  toggleTextActive: {
    color: colors.roseDark,
  },
  feedbackBox: {
    backgroundColor: colors.creamLinen,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  feedbackEmoji: {
    fontSize: 32,
  },
  feedbackTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
    color: colors.cocoa,
  },
  feedbackDesc: {
    fontFamily: "Nunito-Regular",
    fontSize: 12,
    color: colors.cocoaSoft,
    textAlign: "center",
  },
  swatchContainer: {
    gap: 12,
    marginBottom: 24,
  },
  swatchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.whiteSoft,
  },
  swatchCardSelected: {
    borderColor: colors.rose,
    backgroundColor: colors.rosePale,
  },
  swatchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cocoaSoft,
  },
  swatchTextContainer: {
    flex: 1,
  },
  swatchName: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
  },
  swatchDesc: {
    fontFamily: "Nunito-Regular",
    fontSize: 11,
    color: colors.cocoaSoft,
  },
  cta: {
    backgroundColor: colors.rose,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 20,
  },
  ctaDisabled: {
    opacity: 0.5,
    backgroundColor: colors.creamDeep,
  },
  ctaText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#ffffff",
    fontSize: 16,
  },
});
