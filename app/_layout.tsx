import { initializeI18n } from "@/i18n";
import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { Syne_700Bold } from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { LogBox } from "react-native";
import "react-native-reanimated";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../global.css";
import { tokenCache } from "../lib/auth";

export { ErrorBoundary };

WebBrowser.maybeCompleteAuthSession();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

LogBox.ignoreLogs(["Clerk:"]);

function AppShell() {
  const { isDark } = useTheme();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(root)" />
        <Stack.Screen
          name="oauth-native-callback"
          options={{ presentation: "transparentModal" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const setupLocalization = async () => {
      await initializeI18n();
      if (isMounted) {
        setI18nReady(true);
      }
    };

    setupLocalization();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !i18nReady) return null;

  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <AppShell />
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeProvider>
  );
}
