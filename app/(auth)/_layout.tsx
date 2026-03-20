import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const Layout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
            animation: "slide_from_right"
          }}
        />
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
            animation: "slide_from_right"
          }}
        />
        <Stack.Screen
          name="sign-up-phone"
          options={{
            headerShown: false,
            animation: "slide_from_right"
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            headerShown: false,
            animation: "slide_from_right"
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
};

export default Layout;