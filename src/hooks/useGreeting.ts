import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { Archetype } from "@/theme/tokens";

const ARCHETYPE_CONFIG: Record<Archetype, {
  name: string;
  morning: { greet: string; sub: string; line: string };
  evening: { greet: string; sub: string; line: string };
}> = {
  dreamer: {
    name: "The Homebody Romantic",
    morning: { greet: "Morning, love.", sub: "Soft start today 🌷", line: "Feels like a soft hug 🤎" },
    evening: { greet: "Welcome back.", sub: "Time to unwind 🌙", line: "Time to get cozy ☕" },
  },
  minimalist: {
    name: "The Quiet Minimalist",
    morning: { greet: "Morning.", sub: "Simple, as always.", line: "Clean lines. Done." },
    evening: { greet: "Evening.", sub: "Day's done well.", line: "Uncluttered & simple." },
  },
  sunny: {
    name: "The Sunny Optimist",
    morning: { greet: "Rise & shine!", sub: "Let's glow today ☀️", line: "Pure sunshine today ☀️" },
    evening: { greet: "Hey there!", sub: "Golden hour looks good.", line: "Golden hour glow ✨" },
  },
  planner: {
    name: "The Cozy Planner",
    morning: { greet: "Morning! Sorted.", sub: "Everything's ready.", line: "Pre-approved, pre-loved." },
    evening: { greet: "Welcome home.", sub: "Tomorrow's all set 📝", line: "All planned out." },
  },
};

export function useGreeting() {
  const archetype = useProfileStore((s) => s.archetype) ?? "sunny";
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const timeOfDay = hour >= 5 && hour < 17 ? "morning" : "evening";
  const config = ARCHETYPE_CONFIG[archetype];
  const greeting = config[timeOfDay];

  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const timeName = timeOfDay === "morning" ? "Morning" : "Evening";
  const eyebrow = `${dayName} · ${timeName}`;

  return {
    eyebrow,
    greet: greeting.greet,
    sub: greeting.sub,
    line: greeting.line,
    archetypeName: config.name,
  };
}
