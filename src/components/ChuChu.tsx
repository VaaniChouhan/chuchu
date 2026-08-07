import React from "react";
import Svg, { Ellipse, Circle, Path, Rect, Line, G } from "react-native-svg";
import { archetypeAccents, Archetype, colors } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";

interface ChuChuMascotProps {
  size?: number;
  archetype?: Archetype;
}

export function ChuChuMascot({ size = 44, archetype: propArchetype }: ChuChuMascotProps) {
  const storeArchetype = useProfileStore((s) => s.archetype);
  const activeArchetype: Archetype = propArchetype || storeArchetype || "sunny";
  const accentColor = archetypeAccents[activeArchetype].accent;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Ears */}
      <Ellipse cx="30" cy="18" rx="8" ry="10" fill="#EAD9C4" />
      <Ellipse cx="70" cy="18" rx="8" ry="10" fill="#EAD9C4" />

      {/* Head */}
      <Circle cx="50" cy="52" r="38" fill="#F3E3CC" />

      {/* Collar / Band */}
      <Path d="M18 60 Q50 78 82 60 Q82 78 50 84 Q18 78 18 60Z" fill={accentColor} />

      {/* Eyes */}
      <Circle cx="38" cy="48" r="3.4" fill="#4A3226" />
      <Circle cx="62" cy="48" r="3.4" fill="#4A3226" />

      {/* Cheeks */}
      <Circle cx="28" cy="58" r="6" fill="#E9A9AE" opacity={0.7} />
      <Circle cx="72" cy="58" r="6" fill="#E9A9AE" opacity={0.7} />

      {/* Smile */}
      <Path d="M42 60 Q50 66 58 60" stroke="#4A3226" strokeWidth={2.5} fill="none" strokeLinecap="round" />

      {/* Archetype Accessory Overlays */}
      {activeArchetype === "dreamer" && (
        <G>
          <Path d="M42 6 C44 2 50 2 50 6 C48 3 44 3 42 6 Z" fill="#E9A9AE" />
          <Circle cx="38" cy="7" r="3" fill="#F3DEE1" />
          <Circle cx="50" cy="4" r="3" fill="#F3DEE1" />
          <Circle cx="62" cy="7" r="3" fill="#F3DEE1" />
        </G>
      )}

      {activeArchetype === "minimalist" && (
        <Rect x="26" y="10" width="48" height="6" rx="3" fill="#EFE7DC" />
      )}

      {activeArchetype === "sunny" && (
        <G>
          <Rect x="24" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity={0.85} />
          <Rect x="52" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity={0.85} />
          <Rect x="46" y="37" width="8" height="3" fill="#4A3226" opacity={0.85} />
        </G>
      )}

      {activeArchetype === "planner" && (
        <G>
          <Circle cx="38" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth={2} />
          <Circle cx="62" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth={2} />
          <Line x1="47" y1="48" x2="53" y2="48" stroke="#4A3226" strokeWidth={2} />
        </G>
      )}
    </Svg>
  );
}
