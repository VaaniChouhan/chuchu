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
    SvgXml: View,
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
    useAnimatedStyle: (fn: any) => ({}),
    withTiming: (val: any) => val,
    withSequence: (...args: any[]) => args[0],
    withRepeat: (val: any) => val,
    withSpring: (val: any) => val,
    Easing: {
      inOut: () => ({}),
      sin: {},
      quad: {},
      out: () => ({}),
      in: () => ({}),
    },
    FadeIn: { duration: () => ({ delay: () => ({}) }) },
    SlideInDown: { springify: () => ({ damping: () => ({}) }) },
  };
});

import { SwingTag } from "../components/SwingTag";
import { ReasonPillRow } from "../components/ReasonPillRow";
import { ProgressRing } from "../components/ProgressRing";
import { ChuChuMascot } from "../components/ChuChu";
import { ChuChuSVG } from "../components/ChuChuSVG";

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

  it("should render ChuChuSVG without throwing", () => {
    const rendered = render(<ChuChuSVG size={100} emotion="happy" />);
    expect(rendered).toBeDefined();
  });

  it("should render ChuChuMascot in HD vector mode with sparkling_joy", () => {
    const res = render(<ChuChuMascot size={96} useHDVector={true} emotion="sparkling_joy" />);
    expect(res).toBeDefined();
  });

  it("should render ChuChuMascot in HD vector mode with crying emotion", () => {
    const res1 = render(<ChuChuMascot size={96} useHDVector={true} emotion="crying" />);
    expect(res1).toBeDefined();
  });

  it("should render ChuChuMascot in HD vector mode with angry emotion", () => {
    const res2 = render(<ChuChuMascot size={96} useHDVector={true} emotion="angry" />);
    expect(res2).toBeDefined();
  });
});
