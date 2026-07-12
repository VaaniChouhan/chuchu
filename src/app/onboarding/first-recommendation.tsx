import { useEffect, useState } from "react";
import { StyleSheet, Pressable, View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, typeScale } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { getAllWardrobeItems, WardrobeItem } from "@/db/wardrobe.repository";
import { OutfitCard, Outfit } from "@/components/OutfitCard";

export default function FirstRecommendation() {
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendation() {
      try {
        const items = await getAllWardrobeItems();
        if (items.length > 0) {
          // Construct first recommendation from scanned items
          const recommendation: Outfit = {
            items: items.slice(0, 3).map((item) => ({
              id: item.id,
              category: item.category,
              imageUri: item.imageUri,
              dominantColor: item.dominantColor,
            })),
            score: 0.92,
            reasons: ["Fits your style profile", "Great color compatibility", "Ready to wear"],
          };
          setOutfit(recommendation);
        }
      } catch (e) {
        console.error("Failed to load first recommendation:", e);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendation();
  }, []);

  const handleFinish = async () => {
    // Marks onboarding as complete (writing to SQLite user_profile)
    await completeOnboarding();
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Looking sharp! 🌷</Text>
        <Text style={styles.subtitle}>Here is your first daily outfit recommendation designed by ChuChu.</Text>

        {loading && <ActivityIndicator size="large" color={colors.rose} />}

        {!loading && outfit && (
          <View style={styles.cardContainer}>
            <OutfitCard outfit={outfit} onWear={handleFinish} />
          </View>
        )}

        {!loading && !outfit && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Add some items to get started!</Text>
          </View>
        )}

        <Pressable
          style={styles.cta}
          onPress={handleFinish}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Finish Setup"
          accessibilityHint="Completes the onboarding flow and routes you to the daily home dashboard"
        >
          <Text style={styles.ctaText}>Finish Setup</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.greeting,
    color: colors.cocoa,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoaSoft,
    textAlign: "center",
    marginBottom: 10,
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
  cta: {
    backgroundColor: colors.rose,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 999,
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 20,
  },
  ctaText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#ffffff",
    fontSize: 16,
  },
});
