import { useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";
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

type AnimatedSplashProps = {
  /** Called once the intro animation has fully finished (safe to unmount). */
  onFinish: () => void;
};

/**
 * A branded animated intro shown for a brief moment right after the native
 * splash screen hides. Native splash screens can't be animated (a platform
 * limitation on both iOS and Android) - this screen is what actually
 * animates, and being a normal React screen, there's nothing here that can
 * break app store review or a production build.
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { colors, isDark } = useTheme();

  const bgProgress = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.6);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const containerOpacity = useSharedValue(1);

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

    // Hold briefly once fully revealed, then fade the whole intro out.
    containerOpacity.value = withDelay(
      1250,
      withTiming(0, { duration: 320 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount only
  }, []);

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
