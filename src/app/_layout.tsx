import { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { initDatabase } from "@/db/schema";
import { useProfileStore } from "@/store/useProfileStore";
import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);
  const hydrate = useProfileStore((s) => s.hydrate);
  const onboardingComplete = useProfileStore((s) => s.onboardingComplete);

  const [fontsLoaded] = useFonts({
    "Fraunces-Medium": require("../../assets/fonts/Fraunces-Medium.ttf"),
    "Fraunces-SemiBold": require("../../assets/fonts/Fraunces-SemiBold.ttf"),
    "Nunito-Regular": require("../../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Bold": require("../../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-ExtraBold": require("../../assets/fonts/Nunito-ExtraBold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        await hydrate();
        setDbReady(true);
      } catch (e) {
        console.error("Database initialization failed:", e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) {
    return null; // Keep native splash screen showing
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-item" options={{ presentation: "modal" }} />
        <Stack.Screen name="item/[id]" />
        <Stack.Screen name="checkin" options={{ presentation: "transparentModal" }} />
      </Stack>
      {/* Route redirects based on onboarding status */}
      {!onboardingComplete && <Redirect href="/onboarding/welcome" />}
      {onboardingComplete && <Redirect href="/(tabs)/home" />}
    </ThemeProvider>
  );
}
