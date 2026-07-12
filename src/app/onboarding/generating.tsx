import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, typeScale } from "@/theme/tokens";
import { ChuChuIllustration } from "@/components/ChuChuIllustration";
import { useProfileStore } from "@/store/useProfileStore";

const LINES = [
  "Learning your colors...",
  "Finding your rhythm...",
  "Building Style DNA...",
  "Knitting recommendations...",
  "Almost home...",
];

export default function Generating() {
  const [lineIndex, setLineIndex] = useState(0);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  useEffect(() => {
    // Cycle text lines every 3 seconds for a responsive feel
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % LINES.length);
    }, 3000);

    const saveAndProceed = async () => {
      try {
        // Run database batch insert/write profile
        await completeOnboarding();
        // Wait 10 seconds total to show style DNA generation process
        await new Promise((resolve) => setTimeout(resolve, 10000));
        router.replace("/onboarding/first-recommendation");
      } catch (e) {
        console.error("Generating screen process failed:", e);
      }
    };

    saveAndProceed();

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChuChuIllustration pose="knitting" size={130} animated={true} />
        <Text style={styles.headline}>{LINES[lineIndex]}</Text>
        <Text style={styles.subtext}>ChuChu is analyzing your wardrobe elements.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 24,
    padding: 32,
  },
  headline: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.screenTitle,
    color: colors.cocoa,
    textAlign: "center",
    minHeight: 32,
  },
  subtext: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoaSoft,
    textAlign: "center",
  },
});
