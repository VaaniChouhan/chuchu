import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { colors } from "@/theme/tokens";

export type ChuChuPose = "sleepy" | "waking" | "neutral" | "knitting";

interface ChuChuIllustrationProps {
  pose: ChuChuPose;
  size?: number;
  animated?: boolean;
}

export function ChuChuIllustration({ pose, size = 120, animated = true }: ChuChuIllustrationProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    if (pose === "sleepy") {
      // Slow breathing bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 0.05,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (pose === "knitting") {
      // Gentle side-to-side rocking
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // General slight hover bobbing
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 0.03,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pose, animated]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-8deg", "8deg"],
  });

  const renderEyes = () => {
    switch (pose) {
      case "sleepy":
        return (
          <View style={styles.eyeRow}>
            <Text style={styles.sleepyEye}>~</Text>
            <Text style={styles.sleepyEye}>~</Text>
          </View>
        );
      case "waking":
        return (
          <View style={styles.eyeRow}>
            <Text style={styles.sleepyEye}>~</Text>
            <View style={styles.dotEye} />
          </View>
        );
      case "knitting":
        return (
          <View style={styles.eyeRow}>
            <Text style={styles.knittingEye}>^</Text>
            <Text style={styles.knittingEye}>^</Text>
          </View>
        );
      case "neutral":
      default:
        return (
          <View style={styles.eyeRow}>
            <View style={styles.dotEye} />
            <View style={styles.dotEye} />
          </View>
        );
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      {/* Body Ball */}
      <View style={[styles.bodyBall, { borderRadius: size / 2 }]}>
        {/* Soft shadow accent on ball */}
        <View style={styles.shading} />
        
        {/* Cute Ears */}
        <View style={styles.earLeft} />
        <View style={styles.earRight} />

        {/* Blush Cheeks */}
        <View style={styles.blushLeft} />
        <View style={styles.blushRight} />

        {/* Render Eyes */}
        {renderEyes()}

        {/* Small Mouth */}
        <View style={styles.mouth} />

        {/* Special Accessories for Poses */}
        {pose === "knitting" && (
          <View style={styles.yarnOverlay}>
            <View style={styles.yarnBall} />
            <View style={styles.needleLeft} />
            <View style={styles.needleRight} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  bodyBall: {
    width: "90%",
    height: "90%",
    backgroundColor: colors.creamLinen,
    borderWidth: 3,
    borderColor: colors.cocoa,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },
  shading: {
    position: "absolute",
    bottom: "5%",
    right: "10%",
    width: "80%",
    height: "20%",
    backgroundColor: colors.creamDeep,
    borderRadius: 999,
    opacity: 0.6,
    zIndex: 1,
  },
  earLeft: {
    position: "absolute",
    top: "-8%",
    left: "15%",
    width: "25%",
    height: "25%",
    backgroundColor: colors.creamLinen,
    borderWidth: 3,
    borderColor: colors.cocoa,
    borderRadius: 12,
    transform: [{ rotate: "-20deg" }],
  },
  earRight: {
    position: "absolute",
    top: "-8%",
    right: "15%",
    width: "25%",
    height: "25%",
    backgroundColor: colors.creamLinen,
    borderWidth: 3,
    borderColor: colors.cocoa,
    borderRadius: 12,
    transform: [{ rotate: "20deg" }],
  },
  eyeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "45%",
    alignItems: "center",
    zIndex: 2,
    marginBottom: 6,
  },
  sleepyEye: {
    fontSize: 22,
    color: colors.cocoa,
    fontWeight: "bold",
    lineHeight: 22,
  },
  knittingEye: {
    fontSize: 20,
    color: colors.cocoa,
    fontWeight: "bold",
    lineHeight: 20,
  },
  dotEye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cocoa,
  },
  blushLeft: {
    position: "absolute",
    left: "15%",
    top: "52%",
    width: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rosePale,
    opacity: 0.9,
  },
  blushRight: {
    position: "absolute",
    right: "15%",
    top: "52%",
    width: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rosePale,
    opacity: 0.9,
  },
  mouth: {
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cocoa,
    zIndex: 2,
  },
  yarnOverlay: {
    position: "absolute",
    bottom: "-10%",
    width: "50%",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  yarnBall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.rose,
    borderWidth: 2,
    borderColor: colors.cocoa,
  },
  needleLeft: {
    position: "absolute",
    left: "5%",
    bottom: "20%",
    width: 3,
    height: 24,
    backgroundColor: colors.cocoaSoft,
    transform: [{ rotate: "-45deg" }],
  },
  needleRight: {
    position: "absolute",
    right: "5%",
    bottom: "20%",
    width: 3,
    height: 24,
    backgroundColor: colors.cocoaSoft,
    transform: [{ rotate: "45deg" }],
  },
});
