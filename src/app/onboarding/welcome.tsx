import { StyleSheet, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, typeScale } from "@/theme/tokens";
import { ChuChuIllustration } from "@/components/ChuChuIllustration";

export default function Welcome() {
  return (
    <LinearGradient colors={[colors.lilacPale, colors.creamLinen]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mascotContainer}>
          <ChuChuIllustration pose="sleepy" size={140} />
        </View>
        <Text style={styles.headline}>Your closet's about to feel like home.</Text>
        <Pressable
          style={styles.cta}
          onPress={() => router.replace("/onboarding/quiz")}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          accessibilityHint="Start the closet onboarding questionnaire"
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

import { View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 32,
  },
  mascotContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 180,
  },
  headline: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.greeting,
    textAlign: "center",
    color: colors.cocoa,
    lineHeight: 36,
  },
  cta: {
    backgroundColor: colors.rose,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 999,
  },
  ctaText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#ffffff",
    fontSize: 16,
  },
});
