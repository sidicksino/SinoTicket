import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@clerk/expo";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// Must match the native splash screen's actual background colors in app.json
// (expo-splash-screen plugin config) exactly, so the hand-off from native
// splash to this screen has zero color flash.
const NATIVE_SPLASH_BACKGROUND = { light: "#ffffff", dark: "#000000" };

// Minimum time the reveal stays fully visible even if auth resolves instantly,
// so it registers as a deliberate brand moment rather than a flash.
const MIN_VISIBLE_MS = 900;
// Safety cap: never hold the branded screen past this even if auth is
// unusually slow to resolve - matches the ~3s ceiling real apps use.
const MAX_VISIBLE_MS = 3000;

type AnimatedSplashProps = {
  /** Called once it's safe to reveal the real app underneath. */
  onFinish: () => void;
};

/**
 * A single branded screen shown right after the native splash hides, that
 * stays up through the entire auth check and only fades out once we know
 * where to send the user - never handing off to a separate loading/spinner
 * screen. This mirrors how Instagram/Spotify/TikTok/Netflix structure their
 * launch sequence: one native frame, one branded screen, then straight into
 * the app - never three sequential screens.
 *
 * Native splash screens can't themselves be animated (a platform limitation
 * on both iOS and Android) - this screen is what actually animates, and
 * being a normal React screen, there's nothing here that can break App
 * Store review or a production build.
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { colors, isDark } = useTheme();
  const { isLoaded: authLoaded } = useAuth();

  const bgProgress = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.6);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const containerOpacity = useSharedValue(1);

  const [mountedAt] = useState(() => Date.now());
  const hasFinished = useRef(false);

  const finish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    containerOpacity.value = withTiming(0, { duration: 320 }, (finished) => {
      if (finished) {
        runOnJS(onFinish)();
      }
    });
  };

  // Entrance reveal - runs once on mount.
  useEffect(() => {
    bgProgress.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    iconOpacity.value = withDelay(80, withTiming(1, { duration: 380 }));
    iconScale.value = withDelay(
      80,
      withTiming(1, { duration: 480, easing: Easing.out(Easing.back(1.4)) }),
    );

    textOpacity.value = withDelay(420, withTiming(1, { duration: 380 }));
    textTranslateY.value = withDelay(
      420,
      withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );

    // Safety fallback: fade out regardless once the max hold elapses, in
    // case auth resolution is unusually slow or never resolves.
    const maxWaitTimer = setTimeout(finish, MAX_VISIBLE_MS);
    return () => clearTimeout(maxWaitTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount only
  }, []);

  // Fade out and reveal the app only once auth has actually resolved -
  // this is what replaces the separate LoadingScreen/spinner screen.
  useEffect(() => {
    if (!authLoaded) return;
    const elapsed = Date.now() - mountedAt;
    const remainingHold = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = setTimeout(finish, remainingHold);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finish is stable enough for this purpose
  }, [authLoaded]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      [
        isDark ? NATIVE_SPLASH_BACKGROUND.dark : NATIVE_SPLASH_BACKGROUND.light,
        colors.primary,
      ],
    ),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, containerStyle]}
      pointerEvents="none"
    >
      <Animated.Image
        source={require("@/assets/icons/splash-icon-light.png")}
        style={[styles.icon, iconStyle]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.wordmark, textStyle]}>
        SinoTicket
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  icon: {
    width: 84,
    height: 84,
    marginBottom: 18,
  },
  wordmark: {
    fontFamily: "Syne_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
