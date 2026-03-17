// import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import "react-native-reanimated";
import "../global.css";

// import { tokenCache } from "@/lib/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// if (!publishableKey) {
//   throw new Error(
//     "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
//   );
// }

// LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {

  return (
    // <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
    // <ClerkLoaded>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(root)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
    // </ClerkLoaded>
    // </ClerkProvider>
  );
}
