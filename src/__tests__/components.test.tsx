import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("react-native-svg", () => {
  const React = require("react");
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Circle: View,
    Text: View,
    G: View,
    Path: View,
  };
});

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (init: any) => ({ value: init }),
    useAnimatedProps: () => ({}),
    withTiming: (val: any) => val,
    FadeIn: { duration: () => ({ delay: () => ({}) }) },
    SlideInDown: { springify: () => ({ damping: () => ({}) }) },
  };
});

import { SwingTag } from "../components/SwingTag";
import { ReasonPillRow } from "../components/ReasonPillRow";
import { ProgressRing } from "../components/ProgressRing";

describe("UI Components Rendering Tests", () => {
  it("should render SwingTag without throwing", () => {
    const rendered = render(<SwingTag percent={88} label="Great" />);
    expect(rendered).toBeDefined();
  });

  it("should render ReasonPillRow without throwing", () => {
    const reasons = ["Matches your undertone", "Perfect for a warm day"];
    const rendered = render(<ReasonPillRow reasons={reasons} />);
    expect(rendered).toBeDefined();
  });

  it("should render ProgressRing without throwing", () => {
    const rendered = render(<ProgressRing current={3} target={5} />);
    expect(rendered).toBeDefined();
  });
});
