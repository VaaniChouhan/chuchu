import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase } from "@/db/schema";
import { useProfileStore } from "@/store/useProfileStore";
import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const hydrate = useProfileStore((s) => s.hydrate);

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
        setInitError(
          e instanceof Error ? e.message : "Unknown initialization error"
        );
        // Still mark as "ready" so splash screen hides and error UI shows
        setDbReady(true);
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

  // Show error UI instead of deadlocking on splash screen
  if (initError) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.emoji}>😿</Text>
        <Text style={errorStyles.title}>ChuChu couldn't start</Text>
        <Text style={errorStyles.message}>{initError}</Text>
        <Text style={errorStyles.hint}>
          Try closing and reopening the app. If the problem persists, reinstall
          the app.
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-item" options={{ presentation: "modal" }} />
        <Stack.Screen name="item/[id]" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen
          name="occasion-planner"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="settings" />
        <Stack.Screen
          name="checkin"
          options={{ presentation: "transparentModal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFF8F0",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A3226",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#8B6F5E",
    marginBottom: 16,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: "#B0967E",
    textAlign: "center",
    lineHeight: 18,
  },
});
