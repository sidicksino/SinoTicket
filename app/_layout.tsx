import { initializeI18n } from "@/i18n";
import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { Syne_700Bold } from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { LogBox, Text, View } from "react-native";
import "react-native-reanimated";
import GlobalErrorBoundary, {
  ErrorBoundary,
} from "../components/ErrorBoundary";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../global.css";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { tokenCache } from "../lib/auth";

export { ErrorBoundary };

WebBrowser.maybeCompleteAuthSession();

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

LogBox.ignoreLogs(["Clerk:"]);

function AppShell() {
  const { isDark } = useTheme();

  // Initialize Push Notifications
  usePushNotifications();
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
      try {
        await initializeI18n();
      } catch (error) {
        console.error("i18n initialization failed:", error);
      } finally {
        if (isMounted) {
          setI18nReady(true);
        }
      }
    };

    setupLocalization();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let forceHideTimer: ReturnType<typeof setTimeout> | null = null;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn("Splash hide failed:", error);
      }
    };

    if (fontsLoaded && i18nReady) {
      hideTimer = setTimeout(() => {
        void hideSplash();
      }, 500);
    }

    // Fail-safe: never keep users trapped on the splash screen forever.
    forceHideTimer = setTimeout(() => {
      void hideSplash();
    }, 6000);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      if (forceHideTimer) clearTimeout(forceHideTimer);
    };
  }, [fontsLoaded, i18nReady]);

  if (!fontsLoaded || !i18nReady) return null;

  if (!publishableKey) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          backgroundColor: "#0f172a",
        }}
      >
        <Text
          selectable
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontFamily: "Syne_700Bold",
            textAlign: "center",
          }}
        >
          Missing Clerk Publishable Key
        </Text>
        <Text
          selectable
          style={{
            color: "#cbd5e1",
            marginTop: 8,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY for your EAS preview environment
          and rebuild.
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <GlobalErrorBoundary>
            <AppShell />
          </GlobalErrorBoundary>
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeProvider>
  );
}
