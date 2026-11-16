import { useTheme } from "@/context/ThemeContext";
import { claimNativeSplash, hideNativeSplash } from "@/lib/splash";
import { useAuth } from "@clerk/expo";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

/** Shortest time the intro stays up, so it reads as intentional rather than a flash. */
const MIN_VISIBLE_MS = 900;
/** Never hold the user longer than this, even if sign-in state is slow to load. */
const MAX_VISIBLE_MS = 2500;

/** Must match `imageWidth` of the expo-splash-screen plugin in app.json. */
const NATIVE_ICON_SIZE = 200;
const SMALL_ICON_SCALE = 0.45;

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

type AnimatedSplashProps = {
  /** Called once it's safe to reveal the real app underneath. */
  onFinish: () => void;
};

/**
 * A short branded intro that continues seamlessly from the native launch
 * screen: it starts pixel-identical to it (same background, same icon at the
 * same size), then the icon shrinks, the "SinoTicket" wordmark fades in
 * underneath, and the first screen cross-fades in as soon as the app is
 * ready. About one second in total.
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { colors } = useTheme();
  const { isLoaded: authLoaded } = useAuth();
  // The native splash follows the device setting, not the in-app theme.
  const isDarkDevice = useColorScheme() === "dark";

  const iconScale = useSharedValue(1);
  const iconTranslateY = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(8);

  const hasFinished = useRef(false);

  // The next screen cross-fades in over the intro (see the root Stack's
  // `animation: "fade"`), so there is no separate fade-out here.
  const finish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    onFinish();
  };

  // Start only once the icon has actually painted, so the motion is never
  // spent while the image is still loading.
  // Take over hiding the native splash before the root layout tries to.
  useState(claimNativeSplash);
  const [iconLoaded, setIconLoaded] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (!iconLoaded) return;
    shownAt.current = Date.now();
    iconScale.value = withDelay(
      100,
      withTiming(SMALL_ICON_SCALE, { duration: 450, easing: EASE_OUT }),
    );
    iconTranslateY.value = withDelay(
      100,
      withTiming(-24, { duration: 450, easing: EASE_OUT }),
    );
    wordmarkOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 350, easing: EASE_OUT }),
    );
    wordmarkTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 350, easing: EASE_OUT }),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconLoaded]);

  useEffect(() => {
    const maxTimer = setTimeout(finish, MAX_VISIBLE_MS);
    return () => clearTimeout(maxTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authLoaded || !iconLoaded) return;
    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    const timer = setTimeout(finish, remaining);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, iconLoaded]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: iconTranslateY.value },
      { scale: iconScale.value },
    ],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        { backgroundColor: isDarkDevice ? "#000000" : "#FFFFFF" },
      ]}
    >
      <Animated.Image
        source={
          isDarkDevice
            ? require("@/assets/icons/splash-icon-light.png")
            : require("@/assets/icons/splash-icon-dark.png")
        }
        style={[styles.icon, iconStyle]}
        resizeMode="contain"
        onLoad={() => setIconLoaded(true)}
        onError={() => setIconLoaded(true)}
        // Hide the native splash on the first frame where this logo is visible,
        // so the hand-off is seamless.
        onLoadEnd={hideNativeSplash}
      />

      {/* Sits just under where the shrunken icon ends up. */}
      <Animated.View style={[styles.wordmarkWrapper, wordmarkStyle]}>
        <Text
          accessibilityRole="header"
          style={[styles.wordmark, { color: isDarkDevice ? "#FFFFFF" : "#111827" }]}
        >
          Sino<Text style={{ color: colors.primary }}>Ticket</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  icon: {
    width: NATIVE_ICON_SIZE,
    height: NATIVE_ICON_SIZE,
  },
  wordmarkWrapper: {
    position: "absolute",
    top: "50%",
    marginTop: (NATIVE_ICON_SIZE * SMALL_ICON_SCALE) / 2 - 8,
  },
  wordmark: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 30,
    letterSpacing: 0.3,
  },
});
