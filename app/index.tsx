import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) return <Redirect href="/(root)/(tabs)/home" />;

  return <Redirect href="/(auth)/onboarding" />;
};

export default Page;