import React, { memo } from "react";
import { ChuChuMascot2D, MascotEmotion } from "./ChuChuMascot2D";

export type ChuChuPose = "sleepy" | "waking" | "neutral" | "knitting";

interface ChuChuIllustrationProps {
  pose?: ChuChuPose;
  size?: number;
  animated?: boolean;
}

const POSE_TO_EMOTION_MAP: Record<ChuChuPose, MascotEmotion> = {
  sleepy: "sleepy",
  waking: "sparkling_joy",
  neutral: "idle",
  knitting: "contentment",
};

/**
 * ChuChuIllustration Component.
 * Delegates directly to the authentic multi-colored Chirpy Lovebird mascot (ChuChuMascot2D).
 * Replaces old legacy bear face placeholders across splash overlays and headers.
 */
export const ChuChuIllustration = memo(function ChuChuIllustration({
  pose = "neutral",
  size = 120,
  animated = true,
}: ChuChuIllustrationProps) {
  const emotion = POSE_TO_EMOTION_MAP[pose] ?? "idle";

  return (
    <ChuChuMascot2D
      size={size}
      emotion={emotion}
      interactive={animated}
      useHDVector={false}
    />
  );
});
