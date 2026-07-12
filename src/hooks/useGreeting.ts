import { useProfileStore } from "@/store/useProfileStore";

const GREETINGS = {
  dreamer: {
    morning: { greet: "Morning, love.", sub: "Soft start today 🌷" },
    evening: { greet: "Welcome back.", sub: "Time to unwind 🌙" },
  },
  minimalist: {
    morning: { greet: "Morning.", sub: "Simple, as always." },
    evening: { greet: "Evening.", sub: "Day's done well." },
  },
  sunny: {
    morning: { greet: "Rise & shine!", sub: "Let's glow today ☀️" },
    evening: { greet: "Hey there!", sub: "Golden hour looks good." },
  },
  planner: {
    morning: { greet: "Morning! Sorted.", sub: "Everything's ready." },
    evening: { greet: "Welcome home.", sub: "Tomorrow's all set 📝" },
  },
};

export function useGreeting() {
  const archetype = useProfileStore((s) => s.archetype) ?? "sunny";
  const hour = new Date().getHours();
  const timeOfDay = hour >= 5 && hour < 17 ? "morning" : "evening";
  return GREETINGS[archetype][timeOfDay];
}
