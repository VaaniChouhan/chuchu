import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
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
import { hapticMedium, hapticSuccess } from "@/utils/haptics";

export type MascotEmotion =
  | "idle"
  | "sparkling_joy"
  | "contentment"
  | "laughing"
  | "crying"
  | "dejected"
  | "pouting"
  | "flustered_anger"
  | "angry"
  | "surprised"
  | "confused"
  | "puzzled"
  | "curious"
  | "happy"
  | "loving"
  | "sleepy";

export type PeekPosition = "none" | "bottom" | "left" | "right" | "top_right";

interface ChuChuMascot2DProps {
  size?: number;
  emotion?: MascotEmotion;
  peekPosition?: PeekPosition;
  randomPeek?: boolean;
  interactive?: boolean;
  onTap?: () => void;
}

export function ChuChuMascot2D({
  size = 88,
  emotion = "idle",
  peekPosition = "none",
  randomPeek = false,
  interactive = true,
  onTap,
}: ChuChuMascot2DProps) {
  const [activeEmotion, setActiveEmotion] = useState<MascotEmotion>(emotion);
  const [currentPeek, setCurrentPeek] = useState<PeekPosition>(peekPosition);

  useEffect(() => {
    setActiveEmotion(emotion);
  }, [emotion]);

  useEffect(() => {
    setCurrentPeek(peekPosition);
  }, [peekPosition]);

  // Periodic Random Peeking
  useEffect(() => {
    if (!randomPeek) return;

    const interval = setInterval(() => {
      const peeks: PeekPosition[] = ["bottom", "left", "right", "top_right"];
      const randomPos = peeks[Math.floor(Math.random() * peeks.length)];
      setCurrentPeek(randomPos);

      setTimeout(() => {
        setCurrentPeek("none");
      }, 3500);
    }, 12000);

    return () => clearInterval(interval);
  }, [randomPeek]);

  // Shared Motion Values
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scaleY = useSharedValue(1);

  // Peek Transform Animations
  useEffect(() => {
    switch (currentPeek) {
      case "bottom":
        translateY.value = withSpring(size * 0.35, { damping: 12 });
        translateX.value = withSpring(0);
        rotation.value = withSpring(0);
        break;

      case "left":
        translateX.value = withSpring(-size * 0.35, { damping: 12 });
        translateY.value = withSpring(0);
        rotation.value = withSpring(0.25); // Head tilt in from left
        break;

      case "right":
        translateX.value = withSpring(size * 0.35, { damping: 12 });
        translateY.value = withSpring(0);
        rotation.value = withSpring(-0.25); // Head tilt in from right
        break;

      case "top_right":
        translateX.value = withSpring(size * 0.3, { damping: 12 });
        translateY.value = withSpring(-size * 0.3, { damping: 12 });
        rotation.value = withSpring(-0.3);
        break;

      case "none":
      default:
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        break;
    }
  }, [currentPeek, size]);

  // Emotion Micro-Animations
  useEffect(() => {
    if (currentPeek !== "none") return;

    const emo = activeEmotion;
    if (emo === "sparkling_joy" || emo === "happy" || emo === "laughing") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 180, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) })
        ),
        4,
        true
      );
      rotation.value = withRepeat(
        withSequence(withTiming(0.08, { duration: 150 }), withTiming(-0.08, { duration: 150 })),
        6,
        true
      );
    } else if (emo === "curious" || emo === "confused" || emo === "puzzled") {
      rotation.value = withSpring(0.38, { damping: 9 });
      translateY.value = withRepeat(
        withSequence(withTiming(-4, { duration: 900 }), withTiming(4, { duration: 900 })),
        -1,
        true
      );
    } else if (emo === "crying" || emo === "dejected") {
      rotation.value = withTiming(0.1, { duration: 600 });
      translateY.value = withRepeat(
        withSequence(withTiming(3, { duration: 800 }), withTiming(0, { duration: 800 })),
        -1,
        true
      );
    } else if (emo === "angry" || emo === "flustered_anger" || emo === "pouting") {
      rotation.value = withRepeat(
        withSequence(withTiming(0.05, { duration: 80 }), withTiming(-0.05, { duration: 80 })),
        8,
        true
      );
      scaleY.value = withTiming(1.05, { duration: 200 });
    } else if (emo === "surprised") {
      translateY.value = withSequence(withSpring(-14, { damping: 5 }), withSpring(0, { damping: 8 }));
    } else {
      // Idle / Contentment / Sleepy
      rotation.value = withTiming(0, { duration: 400 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [activeEmotion, currentPeek]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}rad` },
      { scaleY: scaleY.value },
    ],
  }));

  const handlePress = () => {
    if (!interactive) return;
    hapticSuccess();
    setActiveEmotion("laughing");
    if (onTap) onTap();

    setTimeout(() => {
      setActiveEmotion(emotion);
    }, 2000);
  };

  const emo = activeEmotion;

  return (
    <Pressable
      onPress={handlePress}
      style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Chirpy Mascot expressing ${activeEmotion}`}
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

            {/* Blush Glow */}
            <RadialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FF385C" stopOpacity="0.75" />
              <Stop offset="100%" stopColor="#FF385C" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* 1. Tail Feathers */}
          <G id="Tail">
            <Path d="M145 130 Q175 125 165 145 Q150 155 135 140Z" fill="#FFE047" />
            <Path d="M150 135 Q180 138 170 155 Q152 165 138 145Z" fill="#F0BE18" />
          </G>

          {/* 2. Feet Claws */}
          <G id="Feet" stroke="#E67355" strokeWidth="3.8" strokeLinecap="round">
            <Path d="M82 172 L78 185 M84 172 L84 187 M86 172 L92 185" />
            <Path d="M114 172 L108 185 M116 172 L116 187 M118 172 L124 185" />
          </G>

          {/* 3. Main Round Fluffy Yellow Body */}
          <Ellipse cx="100" cy="120" rx="56" ry="51" fill="url(#yellowBody)" />

          {/* 4. Oversized Head & Peach Face Mask */}
          <G id="HeadAndFace">
            <Ellipse cx="100" cy="85" rx="57" ry="53" fill="url(#yellowBody)" />
            <Path
              d="M52 82 C46 52, 154 52, 148 82 C152 118, 135 140, 100 142 C65 140, 48 118, 52 82 Z"
              fill="url(#peachMask)"
            />
            <Path d="M62 58 Q100 75 138 58 Q100 44 62 58 Z" fill="url(#yellowBody)" opacity={0.95} />
          </G>

          {/* 5. Rosy Cheeks */}
          <Ellipse
            cx="62"
            cy="108"
            rx={emo === "flustered_anger" || emo === "angry" ? 18 : 14}
            ry={emo === "flustered_anger" || emo === "angry" ? 14 : 10}
            fill="url(#blushGlow)"
          />
          <Ellipse
            cx="138"
            cy="108"
            rx={emo === "flustered_anger" || emo === "angry" ? 18 : 14}
            ry={emo === "flustered_anger" || emo === "angry" ? 14 : 10}
            fill="url(#blushGlow)"
          />

          {/* 6. Fluffy Wings */}
          <G id="Wings">
            <Path
              d="M46 108 Q32 120 40 148 Q55 158 64 135 Z"
              fill="#FFD633"
              stroke="#E0AC00"
              strokeWidth="2"
            />
            {/* Puzzled Hand covering mouth */}
            {emo === "puzzled" ? (
              <Path d="M125 112 Q105 108 96 102 Q112 122 135 125 Z" fill="#FFD633" stroke="#E0AC00" strokeWidth="2" />
            ) : (
              <Path
                d="M154 108 Q168 120 160 148 Q145 158 136 135 Z"
                fill="#FFD633"
                stroke="#E0AC00"
                strokeWidth="2"
              />
            )}
          </G>

          {/* 7. Ivory Beak & Mouth Expressions */}
          <G id="Beak">
            {emo === "laughing" || emo === "sparkling_joy" || emo === "happy" ? (
              /* Open Happy Beak Smile */
              <G>
                <Path
                  d="M90 90 Q100 84 110 90 Q114 104 100 118 Q86 104 90 90 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.5"
                />
                <Path d="M92 102 Q100 115 108 102 Z" fill="#9E2B2B" />
              </G>
            ) : emo === "flustered_anger" || emo === "surprised" ? (
              /* Open Shocked Beak */
              <G>
                <Path
                  d="M90 92 Q100 86 110 92 Q114 112 100 122 Q86 112 90 92 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.5"
                />
                <Ellipse cx="100" cy="108" rx="6" ry="8" fill="#401810" />
              </G>
            ) : emo === "crying" || emo === "dejected" || emo === "pouting" || emo === "angry" ? (
              /* Downward Sad / Angry Beak */
              <G>
                <Path
                  d="M90 92 Q100 86 110 92 Q112 110 100 116 Q88 110 90 92 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.5"
                />
                <Path d="M92 106 Q100 100 108 106" fill="none" stroke="#663510" strokeWidth="2" strokeLinecap="round" />
              </G>
            ) : (
              /* Default Beak */
              <G>
                <Path
                  d="M90 92 Q100 86 110 92 Q114 112 100 120 Q86 112 90 92 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.5"
                />
                <Path d="M90 110 Q100 117 110 110" fill="none" stroke="#663510" strokeWidth="2.2" strokeLinecap="round" />
              </G>
            )}
          </G>

          {/* 8. Character Expression Eyes Sheet (12 Expressions) */}
          <G id="ExpressionEyes">
            {emo === "laughing" ? (
              /* 3. Laughing: Closed Happy Arcs (^▽^) */
              <G stroke="#2B150F" strokeWidth="5.5" strokeLinecap="round" fill="none">
                <Path d="M60 84 Q72 68 84 84" />
                <Path d="M116 84 Q128 68 140 84" />
              </G>
            ) : emo === "crying" ? (
              /* Crying Teary Eyes (🥺) */
              <G>
                <Ellipse cx="73" cy="80" rx="14" ry="16" fill="url(#irisGrad)" />
                <Ellipse cx="127" cy="80" rx="14" ry="16" fill="url(#irisGrad)" />
                <Circle cx="70" cy="74" r="5" fill="#FFF" />
                <Circle cx="124" cy="74" r="5" fill="#FFF" />
                {/* Tears Streaming Down Cheeks */}
                <Path d="M68 90 Q65 110 62 125" stroke="#7AD3FF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.85} />
                <Path d="M132 90 Q135 110 138 125" stroke="#7AD3FF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.85} />
              </G>
            ) : emo === "dejected" ? (
              /* Dejected Sad Eyes (._.) */
              <G>
                <Path d="M58 70 Q73 78 88 70" stroke="#2B150F" strokeWidth="4" fill="none" strokeLinecap="round" />
                <Path d="M112 70 Q127 78 142 70" stroke="#2B150F" strokeWidth="4" fill="none" strokeLinecap="round" />
                <Ellipse cx="73" cy="82" rx="12" ry="10" fill="url(#irisGrad)" />
                <Ellipse cx="127" cy="82" rx="12" ry="10" fill="url(#irisGrad)" />
              </G>
            ) : emo === "angry" || emo === "flustered_anger" || emo === "pouting" ? (
              /* Angry Clenched Eyebrows (💢) */
              <G>
                {/* Angry Slanted Eyebrows */}
                <Path d="M56 64 L85 75" stroke="#2B150F" strokeWidth="5.5" strokeLinecap="round" />
                <Path d="M144 64 L115 75" stroke="#2B150F" strokeWidth="5.5" strokeLinecap="round" />
                <Ellipse cx="73" cy="82" rx="13" ry="14" fill="url(#irisGrad)" />
                <Ellipse cx="127" cy="82" rx="13" ry="14" fill="url(#irisGrad)" />
                <Circle cx="70" cy="78" r="4" fill="#FFF" />
                <Circle cx="124" cy="78" r="4" fill="#FFF" />
              </G>
            ) : emo === "surprised" ? (
              /* Surprise Ouch (°□°) */
              <G>
                <Circle cx="73" cy="80" r="16" fill="#FFF" stroke="#2B150F" strokeWidth="4" />
                <Circle cx="127" cy="80" r="16" fill="#FFF" stroke="#2B150F" strokeWidth="4" />
                <Circle cx="73" cy="80" r="4.5" fill="#2B150F" />
                <Circle cx="127" cy="80" r="4.5" fill="#2B150F" />
              </G>
            ) : emo === "confused" ? (
              /* Confused Raised Eyebrow (⊙_o) */
              <G>
                <Path d="M58 64 Q73 58 88 64" stroke="#2B150F" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <Circle cx="73" cy="80" r="15" fill="#FFF" stroke="#2B150F" strokeWidth="3.5" />
                <Circle cx="73" cy="80" r="6" fill="#2B150F" />

                <Path d="M115 72 Q127 75 140 72" stroke="#2B150F" strokeWidth="4" fill="none" strokeLinecap="round" />
                <Ellipse cx="127" cy="82" rx="12" ry="8" fill="url(#irisGrad)" />
              </G>
            ) : (
              /* Sparkling Joy / Contentment / Curious / Default Anime Eyes */
              <G>
                <G id="LeftEye">
                  <Ellipse cx="73" cy="80" rx="14" ry="17" fill="url(#irisGrad)" />
                  <Path d="M58 75 Q73 60 88 75" fill="none" stroke="#24130E" strokeWidth="4.5" strokeLinecap="round" />
                  <Path d="M85 70 L91 66" stroke="#24130E" strokeWidth="3.5" strokeLinecap="round" />
                  <Circle cx="69" cy="74" r="5.5" fill="#FFFFFF" />
                  <Circle cx="78" cy="86" r="3" fill="#FFFFFF" opacity={0.9} />
                </G>

                <G id="RightEye">
                  <Ellipse cx="127" cy="80" rx="14" ry="17" fill="url(#irisGrad)" />
                  <Path d="M112 75 Q127 60 142 75" fill="none" stroke="#24130E" strokeWidth="4.5" strokeLinecap="round" />
                  <Path d="M141 71 L145 67" stroke="#24130E" strokeWidth="3.5" strokeLinecap="round" />
                  <Circle cx="123" cy="74" r="5.5" fill="#FFFFFF" />
                  <Circle cx="132" cy="86" r="3" fill="#FFFFFF" opacity={0.9} />
                </G>
              </G>
            )}
          </G>

          {/* 9. Floating Style Sheet Symbols */}
          {emo === "sparkling_joy" && (
            <G id="Sparkles">
              <Path d="M35 45 Q40 45 40 40 Q40 45 45 45 Q40 45 40 50 Q40 45 35 45Z" fill="#FFC845" />
              <Path d="M160 38 Q166 38 166 32 Q166 38 172 38 Q166 38 166 44 Q166 38 160 38Z" fill="#FFC845" />
            </G>
          )}

          {emo === "confused" && (
            <G id="QuestionMark">
              <Path d="M165 42 Q172 35 172 45 Q168 50 168 55" stroke="#E64A5A" strokeWidth="4" fill="none" strokeLinecap="round" />
              <Circle cx="168" cy="62" r="2.5" fill="#E64A5A" />
            </G>
          )}

          {(emo === "angry" || emo === "flustered_anger") && (
            <G id="AngerMark">
              <Path d="M160 35 L174 49 M174 35 L160 49" stroke="#E63950" strokeWidth="4" strokeLinecap="round" />
            </G>
          )}
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
