import { useClerk, useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Alert } from "react-native";
import { useWarmUpBrowser } from "./useWarmUpBrowser";

const BACKEND_TIMEOUT_MS = 8000;

const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();

  useWarmUpBrowser();

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { createdSessionId, setActive, signUp, signIn } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/oauth-native-callback", { scheme: "sinoticket" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        // Extract the user data directly from the fully-hydrated Clerk Client after activation!
        const currentUser = clerk.user;
        const fallbackSignUp = signUp as any;
        const fallbackSignIn = signIn as any;

        const syncId = currentUser?.id || fallbackSignUp?.createdUserId || fallbackSignIn?.id;

        if (syncId) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

            // First check the authoritative active user, then fallback to signUp objects
            const firstName = currentUser?.firstName || fallbackSignUp?.firstName || "";
            const lastName = currentUser?.lastName || fallbackSignUp?.lastName || "";
            const name = currentUser?.fullName || [firstName, lastName].filter(Boolean).join(" ").trim();
            const email = currentUser?.primaryEmailAddress?.emailAddress || fallbackSignUp?.emailAddress || fallbackSignIn?.identifier || "";
            const clerkId = syncId;
            const profilePhoto = currentUser?.imageUrl || fallbackSignUp?.imageUrl || null;

            // console.log("📤 Syncing user to backend:", { name, email, clerkId, profilePhoto });

            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/api/users`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name,
                  email,
                  clerkId,
                  profilePhoto,
                }),
                signal: controller.signal,
              },
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorText = await response.text();
              console.error("Backend sync failed:", response.status, errorText);
            } else {
              console.log("Backend sync successful");
            }
          } catch (backendError: any) {
            console.error("Backend sync error:", backendError);
          }
        }
      } else {
        Alert.alert(
          "Sign-in incomplete",
          "Google sign-in did not complete. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("💥 Error in Google auth:", error);
      Alert.alert("Error", "Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleAuth, loading };
};

export default useSocialAuth;
