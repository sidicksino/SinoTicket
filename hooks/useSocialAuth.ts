import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";

const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleGoogleAuth = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({ 
        strategy: "oauth_google",
        // Redirect to a specific route if needed, or Clerk handles it
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        // If it's a new user (sign up), we might want to sync with our backend
        if (signUp && signUp.createdUserId) {
          try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: `${signUp.firstName} ${signUp.lastName}`,
                email: signUp.emailAddress,
                clerkId: signUp.createdUserId,
              }),
            });

            if (!response.ok) {
              console.error("Failed to sync user to backend");
            }
          } catch (backendError) {
            console.error("Backend sync error:", backendError);
          }
        }
      } else {
        Alert.alert(
          "Sign-in incomplete",
          "Google sign-in did not complete. Please try again.",
        );
      }
    } catch (error) {
      console.log("💥 Error in Google auth:", error);
      Alert.alert("Error", "Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleAuth, loading };
};



export default useSocialAuth;
