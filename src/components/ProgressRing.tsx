import Svg, { Circle } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/tokens";

interface ProgressRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ current, target, size = 64, strokeWidth = 6 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(current / target, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.rose}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* Centered Progress Count */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>{current}/{target}</Text>
      </View>
    </View>
  );
}

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
