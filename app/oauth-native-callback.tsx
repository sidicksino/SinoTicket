import LoadingScreen from "@/components/LoadingScreen";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function OAuthCallback() {
  const { isSignedIn } = useAuth();
  
  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <LoadingScreen />;
}
