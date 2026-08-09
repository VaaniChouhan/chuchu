import React, { useEffect, useState, useRef } from "react";
import { Pressable } from "react-native";
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
  Filter,
  FeDropShadow,
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

import { ChuChuSVG } from "./ChuChuSVG";

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
  useHDVector?: boolean;
  onTap?: () => void;
}

export function ChuChuMascot2D({
  size = 96,
  emotion = "idle",
  peekPosition = "none",
  randomPeek = false,
  interactive = true,
  useHDVector = true,
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
      }, 3600);
    }, 14000);

    return () => clearInterval(interval);
  }, [randomPeek]);

  // Reanimated Physics Shared Values
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const opacity = useSharedValue(1);
  const headTilt = useSharedValue(0);
  const wingFlap = useSharedValue(0);
  const eyeBlink = useSharedValue(1);

  const prevEmotionRef = useRef<MascotEmotion>(activeEmotion);

  // Expression Switching Spring Transition Pop
  useEffect(() => {
    if (prevEmotionRef.current !== activeEmotion) {
      prevEmotionRef.current = activeEmotion;

      // Organic Squash-and-Stretch Morph Pop on Expression Switch
      scaleX.value = withSequence(
        withTiming(1.12, { duration: 80, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 11, stiffness: 180 })
      );
      scaleY.value = withSequence(
        withTiming(0.88, { duration: 80, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 11, stiffness: 180 })
      );
      opacity.value = withSequence(
        withTiming(0.72, { duration: 60 }),
        withTiming(1, { duration: 120 })
      );
    }
  }, [activeEmotion]);

  // Periodic Natural Eye Blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        eyeBlink.value = withSequence(
          withTiming(0.1, { duration: 90 }),
          withTiming(1, { duration: 110 })
        );
      }
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Peek Transform Spring Animations
  useEffect(() => {
    switch (currentPeek) {
      case "bottom":
        translateY.value = withSpring(size * 0.35, { damping: 14, stiffness: 120 });
        translateX.value = withSpring(0);
        rotation.value = withSpring(0);
        break;

      case "left":
        translateX.value = withSpring(-size * 0.35, { damping: 14, stiffness: 120 });
        translateY.value = withSpring(0);
        rotation.value = withSpring(0.24, { damping: 12 });
        break;

      case "right":
        translateX.value = withSpring(size * 0.35, { damping: 14, stiffness: 120 });
        translateY.value = withSpring(0);
        rotation.value = withSpring(-0.24, { damping: 12 });
        break;

      case "top_right":
        translateX.value = withSpring(size * 0.3, { damping: 14, stiffness: 120 });
        translateY.value = withSpring(-size * 0.3, { damping: 14, stiffness: 120 });
        rotation.value = withSpring(-0.28);
        break;

      case "none":
      default:
        translateX.value = withSpring(0, { damping: 14, stiffness: 120 });
        translateY.value = withSpring(0, { damping: 14, stiffness: 120 });
        break;
    }
  }, [currentPeek, size]);

  // Emotion Micro-Animations with Organic Springs
  useEffect(() => {
    if (currentPeek !== "none") return;

    const emo = activeEmotion;
    if (emo === "sparkling_joy" || emo === "happy" || emo === "laughing") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 170, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 170, easing: Easing.in(Easing.quad) })
        ),
        5,
        true
      );
      rotation.value = withRepeat(
        withSequence(withTiming(0.09, { duration: 140 }), withTiming(-0.09, { duration: 140 })),
        7,
        true
      );
      wingFlap.value = withRepeat(
        withSequence(withTiming(15, { duration: 100 }), withTiming(0, { duration: 100 })),
        10,
        true
      );
    } else if (emo === "curious" || emo === "confused" || emo === "puzzled") {
      headTilt.value = withSpring(0.38, { damping: 8, stiffness: 100 });
      rotation.value = withRepeat(
        withSequence(withTiming(0.12, { duration: 600 }), withTiming(-0.12, { duration: 600 })),
        -1,
        true
      );
      translateY.value = withRepeat(
        withSequence(withTiming(-5, { duration: 750 }), withTiming(5, { duration: 750 })),
        -1,
        true
      );
    } else if (emo === "crying" || emo === "dejected") {
      rotation.value = withSpring(0.12, { damping: 12 });
      translateY.value = withRepeat(
        withSequence(withTiming(4, { duration: 750 }), withTiming(1, { duration: 750 })),
        -1,
        true
      );
      translateX.value = withRepeat(
        withSequence(withTiming(-1.5, { duration: 65 }), withTiming(1.5, { duration: 65 })),
        12,
        true
      );
    } else if (emo === "angry" || emo === "flustered_anger" || emo === "pouting") {
      translateX.value = withRepeat(
        withSequence(withTiming(-3, { duration: 55 }), withTiming(3, { duration: 55 })),
        16,
        true
      );
      rotation.value = withRepeat(
        withSequence(withTiming(0.06, { duration: 70 }), withTiming(-0.06, { duration: 70 })),
        9,
        true
      );
      scaleY.value = withSpring(1.06, { damping: 10 });
    } else if (emo === "surprised") {
      translateY.value = withSequence(
        withSpring(-18, { damping: 4, stiffness: 160 }),
        withSpring(0, { damping: 8 })
      );
      scaleY.value = withSequence(
        withTiming(1.18, { duration: 100 }),
        withSpring(1, { damping: 9 })
      );
      wingFlap.value = withSpring(28);
    } else if (emo === "sleepy") {
      headTilt.value = withSpring(0.15);
      rotation.value = withTiming(0.04, { duration: 600 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      scaleY.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else if (emo === "loving") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      rotation.value = withRepeat(
        withSequence(withTiming(0.08, { duration: 900 }), withTiming(-0.08, { duration: 900 })),
        -1,
        true
      );
    } else {
      // Idle / Contentment
      headTilt.value = withSpring(0);
      rotation.value = withTiming(0, { duration: 400 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-3.5, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      scaleY.value = withRepeat(
        withSequence(
          withTiming(1.025, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [activeEmotion, currentPeek]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}rad` },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
  }));

  const eyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeBlink.value }],
  }));

  const handlePress = () => {
    if (!interactive) return;
    hapticSuccess();

    // Tap Pop Elastic Burst Physics
    scaleX.value = withSequence(
      withTiming(1.22, { duration: 90 }),
      withSpring(1, { damping: 9, stiffness: 220 })
    );
    scaleY.value = withSequence(
      withTiming(0.82, { duration: 90 }),
      withSpring(1, { damping: 9, stiffness: 220 })
    );

    setActiveEmotion("sparkling_joy");
    if (onTap) onTap();

    setTimeout(() => {
      setActiveEmotion(emotion);
    }, 2200);
  };

  const emo = activeEmotion;

  return (
    <Pressable
      onPress={handlePress}
      style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Chirpy Lovebird Mascot expressing ${activeEmotion}`}
    >
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        {useHDVector ? (
          <ChuChuSVG size={size} emotion={activeEmotion} />
        ) : (
          <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            {/* Rich Feather Shading & Drop Shadows */}
            <Filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <FeDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4A291A" floodOpacity="0.18" />
            </Filter>

            {/* Sunny Body Gradient */}
            <LinearGradient id="yellowBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFF79A" />
              <Stop offset="40%" stopColor="#FFDE38" />
              <Stop offset="85%" stopColor="#F5C418" />
              <Stop offset="100%" stopColor="#E0B00C" />
            </LinearGradient>

            {/* Rosy Coral Peach Mask Gradient */}
            <RadialGradient id="peachMask" cx="50%" cy="42%" r="58%">
              <Stop offset="0%" stopColor="#FFA6B0" />
              <Stop offset="55%" stopColor="#FF7582" />
              <Stop offset="88%" stopColor="#F75263" />
              <Stop offset="100%" stopColor="#D93B4C" />
            </RadialGradient>

            {/* Beak 3D Shading Gradient */}
            <LinearGradient id="beakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFF1C5" />
              <Stop offset="45%" stopColor="#FFE0AA" />
              <Stop offset="85%" stopColor="#FFC17A" />
              <Stop offset="100%" stopColor="#E69845" />
            </LinearGradient>

            {/* Iris Deep Anime Gradient */}
            <LinearGradient id="irisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#1C0E0A" />
              <Stop offset="40%" stopColor="#3D2014" />
              <Stop offset="75%" stopColor="#7A4222" />
              <Stop offset="100%" stopColor="#C47E3D" />
            </LinearGradient>

            {/* Soft Blush Glow */}
            <RadialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FF385C" stopOpacity="0.8" />
              <Stop offset="70%" stopColor="#FF385C" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#FF385C" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* 1. Layered Tail Feathers */}
          <G id="Tail">
            <Path d="M142 128 Q176 122 168 144 Q152 156 134 140Z" fill="#FFE047" />
            <Path d="M148 133 Q182 136 172 156 Q154 167 138 146Z" fill="#F0BE18" />
            <Path d="M152 140 Q175 146 166 160 Q152 166 142 152Z" fill="#7AD3FF" opacity={0.9} />
          </G>

          {/* 2. Feet Claws */}
          <G id="Feet" stroke="#E67355" strokeWidth="4" strokeLinecap="round">
            <Path d="M80 172 L76 186 M83 172 L83 188 M86 172 L92 186" />
            <Path d="M114 172 L108 186 M117 172 L117 188 M120 172 L126 186" />
          </G>

          {/* 3. Main Round Fluffy Body */}
          <G filter="url(#dropShadow)">
            <Ellipse cx="100" cy="120" rx="57" ry="52" fill="url(#yellowBody)" />
          </G>

          {/* 4. Oversized Head & Peach Face Mask */}
          <G id="HeadAndFace" filter="url(#dropShadow)">
            <Ellipse cx="100" cy="84" rx="58" ry="54" fill="url(#yellowBody)" />
            {/* Feathery Fluff Tufts on Crown */}
            <Path d="M92 31 Q100 24 108 31 Q100 27 92 31Z" fill="#FFF79A" />
            <Path d="M84 34 Q90 28 96 34Z" fill="#FFF79A" />
            <Path d="M104 34 Q110 28 116 34Z" fill="#FFF79A" />

            {/* Peach Mask Overlay */}
            <Path
              d="M51 81 C45 50, 155 50, 149 81 C153 118, 135 141, 100 143 C65 141, 47 118, 51 81 Z"
              fill="url(#peachMask)"
            />

            {/* Forehead Yellow Transition Feather Curve */}
            <Path
              d="M60 57 Q100 76 140 57 Q100 42 60 57 Z"
              fill="url(#yellowBody)"
              opacity={0.95}
            />

            {/* Cheek Fluff Hatching Outlines */}
            <Path d="M46 86 Q38 97 44 112 Q54 123 65 119" fill="none" stroke="#FF8E99" strokeWidth="2.2" opacity={0.45} />
            <Path d="M154 86 Q162 97 156 112 Q146 123 135 119" fill="none" stroke="#FF8E99" strokeWidth="2.2" opacity={0.45} />
          </G>

          {/* 5. Rosy Cheeks */}
          <Ellipse
            cx="61"
            cy="108"
            rx={emo === "flustered_anger" || emo === "angry" ? 19 : 15}
            ry={emo === "flustered_anger" || emo === "angry" ? 15 : 11}
            fill="url(#blushGlow)"
          />
          <Ellipse
            cx="139"
            cy="108"
            rx={emo === "flustered_anger" || emo === "angry" ? 19 : 15}
            ry={emo === "flustered_anger" || emo === "angry" ? 15 : 11}
            fill="url(#blushGlow)"
          />

          {/* Blush Hatching Lines */}
          <G stroke="#E63950" strokeWidth="1.6" strokeLinecap="round" opacity={0.65}>
            <Line x1="55" y1="106" x2="59" y2="112" />
            <Line x1="60" y1="106" x2="64" y2="112" />
            <Line x1="136" y1="106" x2="140" y2="112" />
            <Line x1="141" y1="106" x2="145" y2="112" />
          </G>

          {/* 6. Wings */}
          <G id="Wings">
            {/* Left Wing */}
            <Path
              d="M45 107 Q30 120 38 149 Q54 160 64 136 Z"
              fill="#FFD633"
              stroke="#E0AC00"
              strokeWidth="2.2"
            />
            {/* Right Wing / Puzzled Hand */}
            {emo === "puzzled" ? (
              <Path d="M125 112 Q105 108 96 102 Q112 122 135 125 Z" fill="#FFD633" stroke="#E0AC00" strokeWidth="2.2" />
            ) : (
              <Path
                d="M155 107 Q170 120 162 149 Q146 160 136 136 Z"
                fill="#FFD633"
                stroke="#E0AC00"
                strokeWidth="2.2"
              />
            )}
          </G>

          {/* 7. Ivory Peach Beak */}
          <G id="Beak" filter="url(#dropShadow)">
            {emo === "laughing" || emo === "sparkling_joy" || emo === "happy" ? (
              /* Open Happy Beak Smile */
              <G>
                <Path
                  d="M89 90 Q100 83 111 90 Q115 105 100 119 Q85 105 89 90 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.6"
                />
                <Path d="M92 103 Q100 116 108 103 Z" fill="#9E2B2B" />
              </G>
            ) : emo === "flustered_anger" || emo === "surprised" ? (
              /* Open Shocked Beak */
              <G>
                <Path
                  d="M89 91 Q100 85 111 91 Q115 112 100 123 Q85 112 89 91 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.6"
                />
                <Ellipse cx="100" cy="109" rx="6.5" ry="8.5" fill="#3B160E" />
              </G>
            ) : emo === "crying" || emo === "dejected" || emo === "pouting" || emo === "angry" ? (
              /* Downward Sad / Angry Beak */
              <G>
                <Path
                  d="M89 91 Q100 85 111 91 Q113 110 100 117 Q87 110 89 91 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.6"
                />
                <Path d="M91 107 Q100 101 109 107" fill="none" stroke="#663510" strokeWidth="2.2" strokeLinecap="round" />
              </G>
            ) : (
              /* Default Beak */
              <G>
                <Path
                  d="M89 91 Q100 85 111 91 Q115 112 100 121 Q85 112 89 91 Z"
                  fill="url(#beakGrad)"
                  stroke="#B86C28"
                  strokeWidth="1.6"
                />
                {/* Nostril Cere Highlight */}
                <Path d="M94 93 Q100 89 106 93" fill="none" stroke="#FFF" strokeWidth="2" opacity={0.85} />
                <Path d="M89 110 Q100 118 111 110" fill="none" stroke="#663510" strokeWidth="2.4" strokeLinecap="round" />
              </G>
            )}
          </G>

          {/* 8. Expressive Anime Character Eyes (12 Expressions) */}
          <G id="ExpressionEyes">
            {emo === "laughing" ? (
              /* Laughing (^▽^) */
              <G stroke="#24130E" strokeWidth="6" strokeLinecap="round" fill="none">
                <Path d="M59 84 Q72 67 85 84" />
                <Path d="M115 84 Q128 67 141 84" />
              </G>
            ) : emo === "crying" ? (
              /* Crying Teary Eyes (🥺) */
              <G>
                <Ellipse cx="73" cy="80" rx="14" ry="17" fill="url(#irisGrad)" />
                <Ellipse cx="127" cy="80" rx="14" ry="17" fill="url(#irisGrad)" />
                <Circle cx="69" cy="74" r="5.5" fill="#FFF" />
                <Circle cx="123" cy="74" r="5.5" fill="#FFF" />
                <Path d="M67 89 Q64 110 61 126" stroke="#7AD3FF" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity={0.9} />
                <Path d="M133 89 Q136 110 139 126" stroke="#7AD3FF" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity={0.9} />
              </G>
            ) : emo === "dejected" ? (
              /* Dejected Sad Eyes (._.) */
              <G>
                <Path d="M57 69 Q73 78 89 69" stroke="#24130E" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <Path d="M111 69 Q127 78 143 69" stroke="#24130E" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <Ellipse cx="73" cy="82" rx="12" ry="10" fill="url(#irisGrad)" />
                <Ellipse cx="127" cy="82" rx="12" ry="10" fill="url(#irisGrad)" />
              </G>
            ) : emo === "angry" || emo === "flustered_anger" || emo === "pouting" ? (
              /* Angry Eyebrows (💢) */
              <G>
                <Path d="M55 63 L86 75" stroke="#24130E" strokeWidth="6" strokeLinecap="round" />
                <Path d="M145 63 L114 75" stroke="#24130E" strokeWidth="6" strokeLinecap="round" />
                <Ellipse cx="73" cy="82" rx="13" ry="14" fill="url(#irisGrad)" />
                <Ellipse cx="127" cy="82" rx="13" ry="14" fill="url(#irisGrad)" />
                <Circle cx="70" cy="78" r="4.2" fill="#FFF" />
                <Circle cx="124" cy="78" r="4.2" fill="#FFF" />
              </G>
            ) : emo === "surprised" ? (
              /* Surprise Ouch (°□°) */
              <G>
                <Circle cx="73" cy="80" r="16.5" fill="#FFF" stroke="#24130E" strokeWidth="4.5" />
                <Circle cx="127" cy="80" r="16.5" fill="#FFF" stroke="#24130E" strokeWidth="4.5" />
                <Circle cx="73" cy="80" r="4.5" fill="#24130E" />
                <Circle cx="127" cy="80" r="4.5" fill="#24130E" />
              </G>
            ) : emo === "confused" ? (
              /* Confused Raised Eyebrow (⊙_o) */
              <G>
                <Path d="M57 63 Q73 56 89 63" stroke="#24130E" strokeWidth="5" fill="none" strokeLinecap="round" />
                <Circle cx="73" cy="80" r="15.5" fill="#FFF" stroke="#24130E" strokeWidth="4" />
                <Circle cx="73" cy="80" r="6.5" fill="#24130E" />

                <Path d="M114 71 Q127 74 141 71" stroke="#24130E" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <Ellipse cx="127" cy="82" rx="12" ry="8.5" fill="url(#irisGrad)" />
              </G>
            ) : (
              /* Sparkling Joy / Contentment / Curious / Default Large Anime Eyes */
              <G>
                <G id="LeftEye">
                  <Ellipse cx="73" cy="80" rx="14.5" ry="17.5" fill="url(#irisGrad)" />
                  <Path d="M57 74 Q73 59 89 74" fill="none" stroke="#24130E" strokeWidth="4.8" strokeLinecap="round" />
                  <Path d="M86 69 L92 65" stroke="#24130E" strokeWidth="3.6" strokeLinecap="round" />
                  <Circle cx="69" cy="74" r="5.8" fill="#FFFFFF" />
                  <Circle cx="78" cy="86" r="3.2" fill="#FFFFFF" opacity={0.92} />
                  <Circle cx="65" cy="83" r="1.8" fill="#FFFFFF" opacity={0.7} />
                </G>

                <G id="RightEye">
                  <Ellipse cx="127" cy="80" rx="14.5" ry="17.5" fill="url(#irisGrad)" />
                  <Path d="M111 74 Q127 59 143 74" fill="none" stroke="#24130E" strokeWidth="4.8" strokeLinecap="round" />
                  <Path d="M142 70 L146 66" stroke="#24130E" strokeWidth="3.6" strokeLinecap="round" />
                  <Circle cx="123" cy="74" r="5.8" fill="#FFFFFF" />
                  <Circle cx="132" cy="86" r="3.2" fill="#FFFFFF" opacity={0.92} />
                  <Circle cx="119" cy="83" r="1.8" fill="#FFFFFF" opacity={0.7} />
                </G>
              </G>
            )}
          </G>

          {/* 9. Floating Style Sheet Symbols */}
          {emo === "sparkling_joy" && (
            <G id="Sparkles">
              <Path d="M34 44 Q40 44 40 38 Q40 44 46 44 Q40 44 40 50 Q40 44 34 44Z" fill="#FFC845" />
              <Path d="M158 37 Q165 37 165 30 Q165 37 172 37 Q165 37 165 44 Q165 37 158 37Z" fill="#FFC845" />
            </G>
          )}

          {emo === "confused" && (
            <G id="QuestionMark">
              <Path d="M165 40 Q173 33 173 44 Q169 49 169 54" stroke="#E64A5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <Circle cx="169" cy="62" r="2.8" fill="#E64A5A" />
            </G>
          )}

          {(emo === "angry" || emo === "flustered_anger") && (
            <G id="AngerMark">
              <Path d="M158 34 L174 50 M174 34 L158 50" stroke="#E63950" strokeWidth="4.5" strokeLinecap="round" />
            </G>
          )}
        </Svg>
        )}
      </Animated.View>
    </Pressable>
  );
}
