import { ActivityIndicator, View } from "react-native";
import { Platform } from "react-native";
import { Redirect } from "expo-router";
import { useProfileStore } from "@/store/useProfileStore";

export default function Index() {
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);
  const isHydrated = useProfileStore((s) => s.isHydrated);

  // Wait for profile store to hydrate from SQLite before deciding route
  // This prevents flashing onboarding for returning users
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#C97B84" />
      </View>
    );
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
