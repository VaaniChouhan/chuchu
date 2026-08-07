import React from "react";
import { ChuChuMascot2D, MascotEmotion, PeekPosition } from "./ChuChuMascot2D";

interface ChuChuMascotProps {
  size?: number;
  emotion?: MascotEmotion;
  peekPosition?: PeekPosition;
  randomPeek?: boolean;
  interactive?: boolean;
  onTap?: () => void;
}

export function ChuChuMascot({
  size = 88,
  emotion = "idle",
  peekPosition = "none",
  randomPeek = false,
  interactive = true,
  onTap,
}: ChuChuMascotProps) {
  return (
    <ChuChuMascot2D
      size={size}
      emotion={emotion}
      peekPosition={peekPosition}
      randomPeek={randomPeek}
      interactive={interactive}
      onTap={onTap}
    />
  );
}

export { ChuChuMascot2D, MascotEmotion, PeekPosition };
