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
      const { createdSessionId, setActive, signUp, signIn } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        // Identify the user data for sync (from either signUp or signIn result)
        // If it's a new user, signUp is populated. If returning, signIn is populated.
        const syncData = signUp || (signIn as any);

        if (syncData && (syncData.createdUserId || syncData.userData?.id || (signIn as any)?.id)) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

            // Robust name & email extraction
            const firstName = syncData.firstName || syncData.userData?.firstName || "";
            const lastName = syncData.lastName || syncData.userData?.lastName || "";
            const name = [firstName, lastName].filter(Boolean).join(" ").trim();
            const email = syncData.emailAddress || syncData.userData?.emailAddress || "";
            const clerkId = syncData.createdUserId || syncData.userData?.id || (signIn as any)?.id;

            // Robust profile photo extraction
            const profilePhoto =
              (syncData as any).imageUrl ||
              (syncData as any).publicUserData?.imageUrl ||
              (syncData as any).userData?.imageUrl ||
              (syncData as any).externalAccounts?.[0]?.imageUrl ||
              (syncData as any).externalAccounts?.[0]?.avatarUrl ||
              (syncData as any).externalAccounts?.[0]?.picture ||
              (syncData as any).externalAccounts?.[0]?.external_metadata?.picture ||
              null;

            console.log("📤 Syncing user to backend:", { name, email, clerkId, profilePhoto });

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
              console.log("✅ Backend sync successful");
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
