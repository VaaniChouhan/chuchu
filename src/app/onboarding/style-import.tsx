import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors, radius, typeScale } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";

export default function StyleImport() {
  const setTempProfile = useProfileStore((s) => s.setTempProfile);
  const [photoCount, setPhotoCount] = useState(0);

  const handleUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Please grant access to your photos to upload inspiration.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoCount(result.assets.length);
        setTempProfile({ tempStyleImportSource: "photos" });
        // Proceed automatically after a brief delay
        setTimeout(() => {
          router.replace("/onboarding/body-profile");
        }, 1000);
      }
    } catch (e) {
      console.error("Style import upload failed:", e);
    }
  };

  const handleSkip = () => {
    setTempProfile({ tempStyleImportSource: "skipped" });
    router.replace("/onboarding/body-profile");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Dots */}
      <View style={styles.dots}>
        {[1, 1, 1, 0, 0, 0].map((done, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: done ? colors.cocoa : colors.creamDeep },
            ]}
          />
        ))}
      </View>

      <Text style={styles.question}>Seed your Style DNA</Text>
      <Text style={styles.subtext}>Share some images that inspire your style, or skip to start clean.</Text>

      <View style={styles.cardContainer}>
        {/* Pinterest Card (Coming Soon) */}
        <View
          style={[styles.card, styles.disabledCard]}
          accessible={true}
          accessibilityLabel="Pinterest board integration, coming soon"
          accessibilityState={{ disabled: true }}
        >
          <Text style={styles.cardEmoji}>📌</Text>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.cocoaSoft }]}>Pinterest Boards</Text>
            <Text style={styles.badgeText}>Coming Soon</Text>
          </View>
        </View>

        {/* Upload Photos Card */}
        <Pressable
          style={styles.card}
          onPress={handleUpload}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={photoCount > 0 ? `${photoCount} Photos Selected` : "Upload Inspiration Photos"}
          accessibilityHint="Select photos from your image gallery to seed your Style DNA"
        >
          <Text style={styles.cardEmoji}>🖼️</Text>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.cocoa }]}>
              {photoCount > 0 ? `${photoCount} Photos Selected` : "Upload Inspiration Photos"}
            </Text>
            <Text style={styles.cardSub}>Select photos from library</Text>
          </View>
        </Pressable>
      </View>

      {/* Skip Button */}
      <Pressable
        style={styles.skipBtn}
        onPress={handleSkip}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Skip for now"
        accessibilityHint="Skip setting style DNA for now and continue setup"
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
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
    marginBottom: 10,
    lineHeight: 28,
  },
  subtext: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoaSoft,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  cardContainer: {
    gap: 16,
    marginBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderRadius: radius.md,
    padding: 20,
    backgroundColor: colors.whiteSoft,
  },
  disabledCard: {
    opacity: 0.6,
    backgroundColor: "#f5f5f5",
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
  },
  cardSub: {
    fontFamily: "Nunito-Regular",
    fontSize: 12,
    color: colors.cocoaSoft,
  },
  badgeText: {
    alignSelf: "flex-start",
    backgroundColor: colors.creamDeep,
    color: colors.cocoa,
    fontSize: 10,
    fontFamily: "Nunito-ExtraBold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    textTransform: "uppercase",
  },
  skipBtn: {
    alignSelf: "center",
    padding: 12,
  },
  skipText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
    textDecorationLine: "underline",
  },
});
