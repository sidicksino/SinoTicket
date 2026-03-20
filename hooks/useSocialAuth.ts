import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";

const BACKEND_TIMEOUT_MS = 8000;

const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        // Only sync new users — and only when all required fields are present
        if (
          signUp &&
          signUp.createdUserId &&
          signUp.emailAddress &&
          (signUp.firstName || signUp.lastName)
        ) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

            const name = [signUp.firstName, signUp.lastName]
              .filter(Boolean)
              .join(" ")
              .trim();

            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/api/users`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name,
                  email: signUp.emailAddress,
                  clerkId: signUp.createdUserId,
                  profilePhoto: (signUp as any).imageUrl || null,
                }),
                signal: controller.signal,
              },
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
              console.error("Backend sync failed with status:", response.status);
            }
          } catch (backendError: any) {
            if (backendError?.name === "AbortError") {
              console.error("Backend sync timed out");
            } else {
              console.error("Backend sync error:", backendError);
            }
            // Do NOT block the user — auth succeeded, backend sync is best-effort
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
