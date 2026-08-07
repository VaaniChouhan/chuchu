import React from "react";
import { ChuChu3DMascot, MascotEmotion } from "./ChuChu3DMascot";

interface ChuChuMascotProps {
  size?: number;
  emotion?: MascotEmotion;
  interactive?: boolean;
  onTap?: () => void;
}

export function ChuChuMascot({
  size = 52,
  emotion = "idle",
  interactive = true,
  onTap,
}: ChuChuMascotProps) {
  return <ChuChu3DMascot size={size} emotion={emotion} interactive={interactive} onTap={onTap} />;
}

export { ChuChu3DMascot };
