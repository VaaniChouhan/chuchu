import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, typeScale } from "@/theme/tokens";
import { ChuChuIllustration } from "@/components/ChuChuIllustration";
import { useProfileStore } from "@/store/useProfileStore";
import { ProgressRing } from "@/components/ProgressRing";
import { StepIndicator } from "@/components/StepIndicator";

const LINES = [
  "Learning your colors...",
  "Finding your rhythm...",
  "Building Style DNA...",
  "Knitting recommendations...",
  "Almost home...",
];

export default function Generating() {
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    // Cycle text lines every 300ms roughly, up to 1.5s
    const textInterval = setInterval(() => {
      if (isMounted) {
        setLineIndex((i) => (i + 1) % LINES.length);
      }
    }, 300);

    // Update progress ring to reach 100 in 1500ms (every 15ms + 1%)
    const progressInterval = setInterval(() => {
      if (isMounted) {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return p + 1;
        });
      }
    }, 15);

    const saveAndProceed = async () => {
      try {
        await completeOnboarding();
        if (!isMounted) return;

        timer = setTimeout(() => {
          if (isMounted) {
            router.replace("/onboarding/first-recommendation");
          }
        }, 1500);
      } catch (e) {
        console.error("Generating screen process failed:", e);
      }
    };

    saveAndProceed();

    return () => {
      isMounted = false;
      clearInterval(textInterval);
      clearInterval(progressInterval);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={6} currentStep={5} />
      <View style={styles.content}>
        <View style={styles.ringWrapper}>
          <ProgressRing current={progress} target={100} size={150} strokeWidth={6} />
          <View style={styles.illusCenter}>
            <ChuChuIllustration pose="knitting" size={90} animated={true} />
          </View>
        </View>
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
  ringWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  illusCenter: {
    position: "absolute",
  },
});
