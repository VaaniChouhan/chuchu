import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow } from "@/theme/tokens";
import { hapticLight, hapticMedium } from "@/utils/haptics";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export function QuickActionDial() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDial = () => {
    hapticMedium();
    setIsOpen((prev) => !prev);
  };

  const navigateTo = (route: string) => {
    hapticLight();
    setIsOpen(false);
    router.push(route as any);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Sub-Actions Menu */}
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.actionsMenu}
        >
          <Pressable
            style={styles.actionItem}
            onPress={() => navigateTo("/add-item")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Scan Garment"
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.rosePale }]}>
              <Ionicons name="camera" size={20} color={colors.roseDark} />
            </View>
            <Text style={styles.actionLabel}>Scan Garment</Text>
          </Pressable>

          <Pressable
            style={styles.actionItem}
            onPress={() => navigateTo("/checkin")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Log Daily Outfit Check-in"
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.goldPale }]}>
              <Ionicons name="heart" size={20} color={colors.goldDark} />
            </View>
            <Text style={styles.actionLabel}>Log Mood</Text>
          </Pressable>

          <Pressable
            style={styles.actionItem}
            onPress={() => navigateTo("/occasion-planner")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Plan Event Occasion"
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.sagePale }]}>
              <Ionicons name="calendar" size={20} color={colors.sageDark} />
            </View>
            <Text style={styles.actionLabel}>Plan Event</Text>
          </Pressable>

          <Pressable
            style={styles.actionItem}
            onPress={() => navigateTo("/wishlist")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View Wishlist and Gaps"
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.lilacPale }]}>
              <Ionicons name="pricetag" size={20} color={colors.lilacDark} />
            </View>
            <Text style={styles.actionLabel}>Wishlist</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Main Floating Trigger (+) Button */}
      <Pressable
        style={[styles.mainFab, isOpen && styles.mainFabActive]}
        onPress={toggleDial}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isOpen ? "Close speed dial actions" : "Open quick actions menu"}
      >
        <Ionicons
          name={isOpen ? "close" : "add"}
          size={28}
          color="#fff"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 20,
    alignItems: "flex-end",
    zIndex: 999,
  },
  actionsMenu: {
    gap: 10,
    marginBottom: 12,
    alignItems: "flex-end",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.whiteSoft,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.creamDeep,
    ...shadow.soft,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoa,
  },
  mainFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.rose,
    justifyContent: "center",
    alignItems: "center",
    ...shadow.lift,
  },
  mainFabActive: {
    backgroundColor: colors.cocoa,
  },
});
