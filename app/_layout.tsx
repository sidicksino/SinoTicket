// import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { Syne_700Bold } from "@expo-google-fonts/syne";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

// import { tokenCache } from "@/lib/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// if (!publishableKey) {
//   throw new Error(
//     "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
//   );
// }

// LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 2000); // wait 2 seconds

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    // <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
    // <ClerkLoaded>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    // </ClerkLoaded>
    // </ClerkProvider>
  );
}
