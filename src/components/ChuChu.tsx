import React from "react";
import { ChuChuMascot2D, MascotEmotion, PeekPosition } from "./ChuChuMascot2D";
import { ChuChuSVG } from "./ChuChuSVG";

interface ChuChuMascotProps {
  size?: number;
  emotion?: MascotEmotion;
  peekPosition?: PeekPosition;
  randomPeek?: boolean;
  interactive?: boolean;
  useHDVector?: boolean;
  onTap?: () => void;
}

export function ChuChuMascot({
  size = 88,
  emotion = "idle",
  peekPosition = "none",
  randomPeek = false,
  interactive = true,
  useHDVector = true,
  onTap,
}: ChuChuMascotProps) {
  return (
    <ChuChuMascot2D
      size={size}
      emotion={emotion}
      peekPosition={peekPosition}
      randomPeek={randomPeek}
      interactive={interactive}
      useHDVector={useHDVector}
      onTap={onTap}
    />
  );
}

export { ChuChuMascot2D, ChuChuSVG, MascotEmotion, PeekPosition };
