import AnimatedSplash from "@/components/AnimatedSplash";
import { hasSeenOnboarding } from "@/lib/onboarding";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

const Page = () => {
  const { isSignedIn } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [seenOnboarding, setSeenOnboarding] = useState<boolean | null>(null);

  // Read while the splash plays, so it never delays the app.
  useEffect(() => {
    hasSeenOnboarding().then(setSeenOnboarding);
  }, []);

  // AnimatedSplash waits for Clerk before calling onFinish, so isSignedIn is
  // a definite value once the intro is gone.
  if (showIntro || seenOnboarding === null) {
    return <AnimatedSplash onFinish={() => setShowIntro(false)} />;
  }

  if (isSignedIn) return <Redirect href="/(root)/(tabs)/home" />;

  return (
    <Redirect href={seenOnboarding ? "/(auth)/welcome" : "/(auth)/onboarding"} />
  );
};

export default Page;
