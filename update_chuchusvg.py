import os

svg_path = r'd:\AI\ChuChu\chuchu\assets\images\chuchu_expression_sheet.svg'
with open(svg_path, 'r', encoding='utf-8') as f:
    svg_raw = f.read().strip()

ts_content = "import React, { memo } from \"react\";\n"
ts_content += "import { StyleProp, ViewStyle, View } from \"react-native\";\n"
ts_content += "import { SvgXml } from \"react-native-svg\";\n"
ts_content += "import { MascotEmotion } from \"./ChuChuMascot2D\";\n\n"

ts_content += "export const CHUCHU_EXPRESSION_SHEET_SVG_RAW = `" + svg_raw + "`;\n\n"

ts_content += """export const EMOTION_VIEWBOX_MAP: Record<MascotEmotion, string> = {
  idle: "938 0 938 512",
  sparkling_joy: "0 0 938 512",
  contentment: "938 0 938 512",
  laughing: "938 512 938 512",
  crying: "0 1024 938 512",
  dejected: "938 1024 938 512",
  pouting: "938 1024 938 512",
  flustered_anger: "1877 512 938 512",
  angry: "1877 512 938 512",
  surprised: "0 512 938 512",
  confused: "0 512 938 512",
  puzzled: "1877 0 938 512",
  curious: "1877 0 938 512",
  happy: "0 0 938 512",
  loving: "1877 1024 938 512",
  sleepy: "1877 1024 938 512",
};

interface ChuChuSVGProps {
  size?: number;
  width?: number;
  height?: number;
  emotion?: MascotEmotion;
  showFullSheet?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ChuChuSVG = memo(function ChuChuSVG({
  size,
  width = 120,
  height = 120,
  emotion,
  showFullSheet = false,
  style,
}: ChuChuSVGProps) {
  const actualWidth = size ?? width;
  const actualHeight = size ?? height;

  let viewBox = "0 0 2816 1536";
  if (!showFullSheet && emotion && EMOTION_VIEWBOX_MAP[emotion]) {
    viewBox = EMOTION_VIEWBOX_MAP[emotion];
  } else if (!showFullSheet) {
    viewBox = EMOTION_VIEWBOX_MAP.idle;
  }

  const targetXml = CHUCHU_EXPRESSION_SHEET_SVG_RAW.replace(
    /viewBox="[^"]+"/,
    `viewBox="${viewBox}"`
  );

  return (
    <View style={[{ width: actualWidth, height: actualHeight, overflow: "hidden" }, style]}>
      <SvgXml
        xml={targetXml}
        width="100%"
        height="100%"
      />
    </View>
  );
});
"""

out_path = r'd:\AI\ChuChu\chuchu\src\components\ChuChuSVG.tsx'
with open(out_path, 'w', encoding='utf-8') as out:
    out.write(ts_content)

print(f"Successfully generated {out_path}, size: {len(ts_content)} bytes")
