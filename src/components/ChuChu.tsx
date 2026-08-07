import React from "react";
import { ChuChuMascot2D, MascotEmotion } from "./ChuChuMascot2D";

interface ChuChuMascotProps {
  size?: number;
  emotion?: MascotEmotion;
  interactive?: boolean;
  onTap?: () => void;
}

export function ChuChuMascot({
  size = 56,
  emotion = "idle",
  interactive = true,
  onTap,
}: ChuChuMascotProps) {
  return <ChuChuMascot2D size={size} emotion={emotion} interactive={interactive} onTap={onTap} />;
}

export { ChuChuMascot2D };
