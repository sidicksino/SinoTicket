import { Stack } from "expo-router";

const Layout = () => {
  return (
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
  );
};

export default Layout;