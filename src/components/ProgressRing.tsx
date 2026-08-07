import React from "react";
import Svg, { Circle } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/tokens";
import ReAnimated, { useSharedValue, withTiming, useAnimatedProps } from "react-native-reanimated";

const AnimatedCircle = ReAnimated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing = React.memo(function ProgressRing({
  current,
  target,
  size = 64,
  strokeWidth = 6,
}: ProgressRingProps) {
  const safeTarget = target > 0 ? target : 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(current / safeTarget, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  const animatedOffset = useSharedValue(circumference);

  React.useEffect(() => {
    animatedOffset.value = withTiming(strokeDashoffset, { duration: 500 });
  }, [strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: animatedOffset.value,
    };
  });

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: safeTarget, now: current }}
      accessibilityLabel={`Progress: ${current} of ${safeTarget}`}
    >
      <Svg width={size} height={size}>
        {/* Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.creamDeep}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.rose}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* Centered Progress Count */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>{current}/{safeTarget}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
});
