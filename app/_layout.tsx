import { initializeI18n } from "@/i18n";
import { ClerkProvider, useClerk } from "@clerk/expo";
import { Syne_700Bold, Syne_800ExtraBold } from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { LogBox, Platform, Text, View } from "react-native";
import { configureReanimatedLogger } from "react-native-reanimated";
import GlobalErrorBoundary, {
  ErrorBoundary,
} from "../components/ErrorBoundary";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../global.css";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { tokenCache } from "../lib/auth";

export { ErrorBoundary };

// NativeWind's CSS-interop runtime (react-native-css-interop) reads/writes
// shared values internally as part of its own style resolution on every
// styled render - this predates Reanimated 4.5's stricter "strict mode"
// render-purity checks and isn't something fixable in app code (confirmed:
// already on NativeWind's latest stable release, no upstream fix yet).
// Disabling only this check; other Reanimated warnings/errors still surface.
configureReanimatedLogger({ strict: false });

WebBrowser.maybeCompleteAuthSession();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

LogBox.ignoreLogs(["Clerk:"]);

// SplashManager: Hides splash only when fonts, i18n, and Clerk are all ready
// Runs outside ClerkLoaded to hide splash immediately when everything is ready
function SplashManager({
  fontsLoaded,
  i18nReady,
}: {
  fontsLoaded: boolean;
  i18nReady: boolean;
}) {
  const { loaded: isClerkLoaded } = useClerk();
  const hasHidden = useRef(false);

  useEffect(() => {
    const hide = () => {
      if (hasHidden.current) return;
      hasHidden.current = true;
      SplashScreen.hideAsync().catch((error) => {
        console.warn("Splash hide failed:", error);
      });
    };

    const timeout = setTimeout(hide, 6000);

    if (fontsLoaded && i18nReady && isClerkLoaded) {
      clearTimeout(timeout);
      hide();
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [fontsLoaded, i18nReady, isClerkLoaded]);

  return null;
}

function AppShell() {
  const { isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      // Android is edge-to-edge by default as of this SDK: the nav bar is
      // always transparent, so only the button/icon style is configurable.
      NavigationBar.setStyle(isDark ? "light" : "dark");
    }
  }, [isDark]);

  // Initialize Push Notifications
  usePushNotifications();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: "fade" }} />
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
    Syne_800ExtraBold,
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Prevent the splash screen from auto-hiding before asset loading is complete.
    SplashScreen.preventAutoHideAsync().catch(() => {
      // Ignore if already prevented
    });
  }, []);

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

  if (!fontsLoaded || !i18nReady) {
    return null;
  }

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
        <SplashManager fontsLoaded={fontsLoaded} i18nReady={i18nReady} />
        <GlobalErrorBoundary>
          <AppShell />
        </GlobalErrorBoundary>
      </ClerkProvider>
    </ThemeProvider>
  );
}
