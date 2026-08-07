import React, { useState } from "react";
import { View, Image, Text, StyleSheet, Pressable } from "react-native";
import ReAnimated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { colors, radius, shadow } from "@/theme/tokens";
import { SwingTag } from "./SwingTag";
import { ReasonPillRow } from "./ReasonPillRow";

export interface OutfitItem {
  id: number;
  category: string;
  imageUri: string;
  dominantColor?: string;
}

export interface Outfit {
  items: OutfitItem[];
  score: number;
  reasons: string[];
}

interface OutfitCardProps {
  outfit: Outfit;
  onWear: () => void;
  onShowAnother?: () => void;
}

export const OutfitCard = React.memo(function OutfitCard({ outfit, onWear, onShowAnother }: OutfitCardProps) {
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const confidencePercent = Math.round(outfit.score * 100);
  const confidenceLabel = outfit.score >= 0.85 ? "Great" : outfit.score >= 0.7 ? "Good" : "Low";

  const handleImageError = (itemId: number) => {
    setFailedImages((prev) => ({ ...prev, [itemId]: true }));
  };

  return (
    <ReAnimated.View entering={FadeIn.duration(400).delay(100)}>
      <View
        style={styles.card}
        accessible={true}
        accessibilityLabel={`Outfit recommendation with ${outfit.items.length} items, ${confidencePercent}% match score`}
      >
      {/* SwingTag Overlay */}
      <SwingTag percent={confidencePercent} label={confidenceLabel} />

      {/* Suggestion header spacing */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>Today's Pick</Text>
      </View>

      {/* Grid of Garments in Outfit */}
      <View style={styles.garmentGrid}>
        {outfit.items.map((item) => (
          <View key={item.id} style={styles.garmentSlot}>
            {failedImages[item.id] || !item.imageUri ? (
              <View style={styles.imageFallback}>
                <Text style={styles.fallbackEmoji}>👔</Text>
                <Text style={styles.fallbackCategory}>{item.category}</Text>
              </View>
            ) : (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.garmentImage}
                resizeMode="cover"
                onError={() => handleImageError(item.id)}
              />
            )}
            <View style={styles.badgeContainer}>
              <View style={[styles.colorIndicator, { backgroundColor: item.dominantColor ?? colors.cocoa }]} />
              <Text style={styles.categoryLabel}>{item.category}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Explanatory Reasons using horizontal scrollable ReasonPillRow */}
      <View style={styles.reasonsContainer}>
        <ReasonPillRow reasons={outfit.reasons} />
      </View>

      {/* Interactive Actions */}
      <View style={styles.actionBlock}>
        <Pressable
          style={styles.primaryBtn}
          onPress={onWear}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Wear This Outfit"
          accessibilityHint="Log this outfit to your daily wear history"
        >
          <Text style={styles.primaryBtnText}>Wear This</Text>
        </Pressable>

        {onShowAnother && (
          <Pressable
            style={styles.secondaryBtn}
            onPress={onShowAnother}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Show another outfit option"
          >
            <Text style={styles.secondaryBtnText}>Show another</Text>
          </Pressable>
        )}
      </View>
    </View>
    </ReAnimated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.whiteSoft,
    borderRadius: radius.lg,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    alignSelf: "stretch",
    gap: 16,
    position: "relative",
    overflow: "visible",
    ...shadow.soft,
  },
  header: {
    paddingTop: 10,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Nunito-Bold",
    color: colors.cocoaSoft,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  garmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  garmentSlot: {
    width: "45%",
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    overflow: "hidden",
    backgroundColor: colors.creamLinen,
    position: "relative",
  },
  garmentImage: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.creamDeep,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  fallbackEmoji: {
    fontSize: 28,
  },
  fallbackCategory: {
    fontFamily: "Nunito-Bold",
    fontSize: 10,
    color: colors.cocoaSoft,
    textTransform: "uppercase",
  },
  badgeContainer: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 253, 249, 0.95)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 10,
    color: colors.cocoa,
    textTransform: "capitalize",
  },
  reasonsContainer: {
    marginTop: 8,
    height: 38,
  },
  actionBlock: {
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: colors.rose,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.roseDark,
  },
  primaryBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#ffffff",
    fontSize: 15,
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
    textDecorationLine: "underline",
  },
});
