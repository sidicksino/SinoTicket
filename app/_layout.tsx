import { initializeI18n } from "@/i18n";
import { ClerkProvider, useAuth, useClerk } from "@clerk/expo";
import { Syne_700Bold, Syne_800ExtraBold } from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { LogBox, Platform, Text, View } from "react-native";
import { configureReanimatedLogger } from "react-native-reanimated";
import GlobalErrorBoundary, {
  ErrorBoundary,
} from "../components/ErrorBoundary";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../global.css";
import { usePushNotifications } from "../hooks/usePushNotifications";
import UserSync from "../components/UserSync";
import { tokenCache } from "../lib/auth";
import { hideNativeSplash, isNativeSplashClaimed } from "../lib/splash";
import { convex } from "../lib/convex";

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

// SplashManager: hides the native splash once fonts, i18n and Clerk are ready,
// unless the animated intro has taken over that job.
function SplashManager({
  fontsLoaded,
  i18nReady,
}: {
  fontsLoaded: boolean;
  i18nReady: boolean;
}) {
  const { loaded: isClerkLoaded } = useClerk();

  useEffect(() => {
    // Safety net: never keep the native splash up for more than 6 seconds.
    const timeout = setTimeout(hideNativeSplash, 6000);

    // When the animated intro is showing, it hides the native splash itself
    // once its logo has painted (see lib/splash.ts).
    if (fontsLoaded && i18nReady && isClerkLoaded && !isNativeSplashClaimed()) {
      clearTimeout(timeout);
      hideNativeSplash();
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [fontsLoaded, i18nReady, isClerkLoaded]);

  return null;
}

function AppShell() {
  const { isDark, colors } = useTheme();

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
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        <Stack.Screen name="(root)" options={{ animation: "fade" }} />
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
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <SplashManager fontsLoaded={fontsLoaded} i18nReady={i18nReady} />
          <UserSync />
          <GlobalErrorBoundary>
            <AppShell />
          </GlobalErrorBoundary>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  );
}
