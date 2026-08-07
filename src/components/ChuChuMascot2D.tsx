import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Line,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { hapticMedium } from "@/utils/haptics";

export type MascotEmotion = "idle" | "happy" | "thinking" | "loving" | "sleepy" | "surprised";

interface ChuChuMascot2DProps {
  size?: number;
  emotion?: MascotEmotion;
  interactive?: boolean;
  onTap?: () => void;
}

export function ChuChuMascot2D({
  size = 120,
  emotion = "idle",
  interactive = true,
  onTap,
}: ChuChuMascot2DProps) {
  const [activeEmotion, setActiveEmotion] = useState<MascotEmotion>(emotion);

  useEffect(() => {
    setActiveEmotion(emotion);
  }, [emotion]);

  // Reanimated Motion Shared Values
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scaleY = useSharedValue(1);
  const wingAngle = useSharedValue(0);

  useEffect(() => {
    switch (activeEmotion) {
      case "happy":
        translateY.value = withRepeat(
          withSequence(
            withTiming(-12, { duration: 200, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
          ),
          4,
          true
        );
        wingAngle.value = withRepeat(
          withSequence(withTiming(20, { duration: 120 }), withTiming(0, { duration: 120 })),
          8,
          true
        );
        break;

      case "thinking":
        rotation.value = withSpring(0.35, { damping: 10 });
        translateY.value = withRepeat(
          withSequence(withTiming(-4, { duration: 1000 }), withTiming(4, { duration: 1000 })),
          -1,
          true
        );
        break;

      case "loving":
        translateY.value = withRepeat(
          withSequence(withTiming(-6, { duration: 350 }), withTiming(0, { duration: 350 })),
          -1,
          true
        );
        wingAngle.value = withRepeat(
          withSequence(withTiming(12, { duration: 250 }), withTiming(0, { duration: 250 })),
          -1,
          true
        );
        break;

      case "sleepy":
        scaleY.value = withRepeat(
          withSequence(
            withTiming(0.96, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        rotation.value = withTiming(0.12, { duration: 1500 });
        break;

      case "surprised":
        translateY.value = withSequence(
          withSpring(-15, { damping: 6 }),
          withSpring(0, { damping: 8 })
        );
        wingAngle.value = withSpring(35);
        break;

      case "idle":
      default:
        rotation.value = withTiming(0, { duration: 400 });
        translateY.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        scaleY.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        break;
    }
  }, [activeEmotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}rad` },
      { scaleY: scaleY.value },
    ],
  }));

  const handlePress = () => {
    if (!interactive) return;
    hapticMedium();
    setActiveEmotion("happy");
    if (onTap) onTap();

    setTimeout(() => {
      setActiveEmotion(emotion);
    }, 1800);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Lutino Peach-Faced Lovebird Mascot ChuChu"
    >
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            {/* Body Yellow Gradient */}
            <LinearGradient id="yellowBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFF275" />
              <Stop offset="50%" stopColor="#FFDE38" />
              <Stop offset="100%" stopColor="#F5C71A" />
            </LinearGradient>

            {/* Peach Mask Gradient */}
            <RadialGradient id="peachMask" cx="50%" cy="45%" r="55%">
              <Stop offset="0%" stopColor="#FF8E99" />
              <Stop offset="65%" stopColor="#FF6B7A" />
              <Stop offset="100%" stopColor="#E64A5A" />
            </RadialGradient>

            {/* Beak Gradient */}
            <LinearGradient id="beakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFE0AA" />
              <Stop offset="70%" stopColor="#FFC380" />
              <Stop offset="100%" stopColor="#E69D53" />
            </LinearGradient>

            {/* Iris Gradient */}
            <LinearGradient id="irisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#24130E" />
              <Stop offset="50%" stopColor="#4A291A" />
              <Stop offset="100%" stopColor="#9E6133" />
            </LinearGradient>

            {/* Blush Gradient */}
            <RadialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FF385C" stopOpacity="0.65" />
              <Stop offset="100%" stopColor="#FF385C" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* 1. Tail Feathers */}
          <G id="Tail">
            <Path d="M145 130 Q175 125 165 145 Q150 155 135 140Z" fill="#FFE047" />
            <Path d="M150 135 Q180 138 170 155 Q152 165 138 145Z" fill="#F0BE18" />
          </G>

          {/* 2. Feet Claws */}
          <G id="Feet" stroke="#E67355" strokeWidth="3.5" strokeLinecap="round">
            <Path d="M82 172 L78 184 M84 172 L84 186 M86 172 L92 184" />
            <Path d="M114 172 L108 184 M116 172 L116 186 M118 172 L124 184" />
          </G>

          {/* 3. Main Round Fluffy Yellow Body */}
          <Ellipse cx="100" cy="120" rx="55" ry="50" fill="url(#yellowBody)" />

          {/* 4. Oversized Head & Peach Face Mask */}
          <G id="HeadAndFace">
            {/* Crown Yellow Feathers */}
            <Ellipse cx="100" cy="85" rx="56" ry="52" fill="url(#yellowBody)" />

            {/* Peach Mask Overlay */}
            <Path
              d="M52 82 C46 52, 154 52, 148 82 C152 118, 135 140, 100 142 C65 140, 48 118, 52 82 Z"
              fill="url(#peachMask)"
            />

            {/* Forehead Yellow Transition Curve */}
            <Path
              d="M62 58 Q100 75 138 58 Q100 44 62 58 Z"
              fill="url(#yellowBody)"
              opacity={0.95}
            />

            {/* Cheek Fluff Outlines */}
            <Path
              d="M48 88 Q40 98 46 112 Q56 122 66 118"
              fill="none"
              stroke="#FF8E99"
              strokeWidth="2"
              opacity={0.4}
            />
            <Path
              d="M152 88 Q160 98 154 112 Q144 122 134 118"
              fill="none"
              stroke="#FF8E99"
              strokeWidth="2"
              opacity={0.4}
            />
          </G>

          {/* 5. Rosy Cheeks */}
          <Ellipse cx="62" cy="108" rx="14" ry="10" fill="url(#blushGlow)" />
          <Ellipse cx="138" cy="108" rx="14" ry="10" fill="url(#blushGlow)" />
          {/* Blush Hatching Lines */}
          <G stroke="#E63950" strokeWidth="1.5" opacity={0.6}>
            <Line x1="56" y1="106" x2="60" y2="112" />
            <Line x1="61" y1="106" x2="65" y2="112" />
            <Line x1="134" y1="106" x2="138" y2="112" />
            <Line x1="139" y1="106" x2="143" y2="112" />
          </G>

          {/* 6. Wings */}
          <G id="Wings">
            {/* Left Wing */}
            <Path
              d="M46 108 Q32 120 40 148 Q55 158 64 135 Z"
              fill="#FFD633"
              stroke="#E0AC00"
              strokeWidth="2"
            />
            {/* Right Wing */}
            <Path
              d="M154 108 Q168 120 160 148 Q145 158 136 135 Z"
              fill="#FFD633"
              stroke="#E0AC00"
              strokeWidth="2"
            />
          </G>

          {/* 7. Ivory Peach Beak */}
          <G id="Beak">
            <Path
              d="M90 92 Q100 86 110 92 Q114 112 100 120 Q86 112 90 92 Z"
              fill="url(#beakGrad)"
              stroke="#B86C28"
              strokeWidth="1.5"
            />
            {/* Beak Highlight & Smile Curve */}
            <Path d="M93 94 Q100 90 107 94" fill="none" stroke="#FFF" strokeWidth="1.8" opacity={0.8} />
            <Path d="M90 110 Q100 117 110 110" fill="none" stroke="#663510" strokeWidth="2.2" strokeLinecap="round" />
          </G>

          {/* 8. Expressive Anime Character Eyes */}
          <G id="AnimeEyes">
            {activeEmotion === "happy" ? (
              /* Happy Eye Arc (^◡^) */
              <G stroke="#2B150F" strokeWidth="5.5" strokeLinecap="round" fill="none">
                <Path d="M62 86 Q73 70 84 86" />
                <Path d="M116 86 Q127 70 138 86" />
              </G>
            ) : activeEmotion === "sleepy" ? (
              /* Sleepy Closed Arc (◡_◡) */
              <G stroke="#2B150F" strokeWidth="5" strokeLinecap="round" fill="none">
                <Path d="M62 82 Q73 94 84 82" />
                <Path d="M116 82 Q127 94 138 82" />
              </G>
            ) : activeEmotion === "surprised" ? (
              /* Surprised Wide Eye (°□°) */
              <G>
                <Circle cx="73" cy="80" r="16" fill="#FFF" stroke="#2B150F" strokeWidth="4" />
                <Circle cx="127" cy="80" r="16" fill="#FFF" stroke="#2B150F" strokeWidth="4" />
                <Circle cx="73" cy="80" r="5" fill="#2B150F" />
                <Circle cx="127" cy="80" r="5" fill="#2B150F" />
              </G>
            ) : (
              /* Large Sparkling Anime Eyes (Idle, Curious, Loving) */
              <G>
                {/* Left Eye */}
                <G id="LeftEye">
                  {/* Eye Base Outline & Iris */}
                  <Ellipse cx="73" cy="80" rx="14" ry="17" fill="url(#irisGrad)" />
                  <Path
                    d="M58 75 Q73 60 88 75"
                    fill="none"
                    stroke="#24130E"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Anime Eyelashes */}
                  <Path d="M85 70 L91 66" stroke="#24130E" strokeWidth="3.5" strokeLinecap="round" />
                  <Path d="M59 71 L55 67" stroke="#24130E" strokeWidth="3" strokeLinecap="round" />

                  {/* Highlights */}
                  {activeEmotion === "loving" ? (
                    <Path
                      d="M71 74 C71 71, 67 71, 67 74 C67 77, 71 80, 71 82 C71 80, 75 77, 75 74 C75 71, 71 71, 71 74 Z"
                      fill="#FFFFFF"
                    />
                  ) : (
                    <>
                      {/* Main Large White Catchlight */}
                      <Circle cx="69" cy="74" r="5.5" fill="#FFFFFF" />
                      {/* Secondary Bottom Reflection */}
                      <Circle cx="78" cy="86" r="3" fill="#FFFFFF" opacity={0.9} />
                    </>
                  )}
                </G>

                {/* Right Eye */}
                <G id="RightEye">
                  {/* Eye Base Outline & Iris */}
                  <Ellipse cx="127" cy="80" rx="14" ry="17" fill="url(#irisGrad)" />
                  <Path
                    d="M112 75 Q127 60 142 75"
                    fill="none"
                    stroke="#24130E"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Anime Eyelashes */}
                  <Path d="M141 71 L145 67" stroke="#24130E" strokeWidth="3.5" strokeLinecap="round" />
                  <Path d="M115 70 L109 66" stroke="#24130E" strokeWidth="3" strokeLinecap="round" />

                  {/* Highlights */}
                  {activeEmotion === "loving" ? (
                    <Path
                      d="M125 74 C125 71, 121 71, 121 74 C121 77, 125 80, 125 82 C125 80, 129 77, 129 74 C129 71, 125 71, 125 74 Z"
                      fill="#FFFFFF"
                    />
                  ) : (
                    <>
                      {/* Main Large White Catchlight */}
                      <Circle cx="123" cy="74" r="5.5" fill="#FFFFFF" />
                      {/* Secondary Bottom Reflection */}
                      <Circle cx="132" cy="86" r="3" fill="#FFFFFF" opacity={0.9} />
                    </>
                  )}
                </G>
              </G>
            )}
          </G>

          {/* 9. Floating Emotion Reaction Accents */}
          {activeEmotion === "loving" && (
            <G id="HeartAccents">
              <Path
                d="M100 35 C100 28, 92 28, 92 35 C92 42, 100 48, 100 52 C100 48, 108 42, 108 35 C108 28, 100 28, 100 35 Z"
                fill="#FF385C"
              />
            </G>
          )}

          {activeEmotion === "thinking" && (
            <G id="SparkleAccents">
              <Path d="M165 40 Q172 40 172 33 Q172 40 179 40 Q172 40 172 47 Q172 40 165 40Z" fill="#FFC845" />
            </G>
          )}
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
