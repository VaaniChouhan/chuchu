import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useProfileStore } from "@/store/useProfileStore";
import { useSessionStore } from "@/store/useSessionStore";

export default function Index() {
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);
  const isHydrated = useProfileStore((s) => s.isHydrated);
  const sessionCompleted = useSessionStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    // Synchronize session store with profile store when hydrated
    if (isHydrated && (onboardingComplete || sessionCompleted)) {
      if (!sessionCompleted) {
        useSessionStore.getState().setHasCompletedOnboarding(true);
      }
    }
  }, [isHydrated, onboardingComplete, sessionCompleted]);

  // Wait for profile & session store to hydrate before deciding route
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#C97B84" />
      </View>
    );
  }

  const isComplete = onboardingComplete || sessionCompleted;

  if (!isComplete) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
