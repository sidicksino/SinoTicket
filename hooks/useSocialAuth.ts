import { useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Alert } from "react-native";
import { useWarmUpBrowser } from "./useWarmUpBrowser";

const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  useWarmUpBrowser();

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/oauth-native-callback", { scheme: "sinoticket" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        // The Convex user row is created by <UserSync /> once the session is active.
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
