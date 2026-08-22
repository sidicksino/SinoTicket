import AnimatedSplash from "@/components/AnimatedSplash";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useState } from "react";

const Page = () => {
  const { isSignedIn } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  // AnimatedSplash itself waits for auth to resolve before calling onFinish,
  // so isSignedIn is guaranteed to be a definitive value by the time this
  // flips - no separate loading screen needed after it.
  if (showIntro) {
    return <AnimatedSplash onFinish={() => setShowIntro(false)} />;
  }

  if (isSignedIn) return <Redirect href="/(root)/(tabs)/home" />;

  return <Redirect href="/(auth)/onboarding" />;
};

export default Page;
