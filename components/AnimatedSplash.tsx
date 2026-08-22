import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// Minimum time the branded animation stays visible (allows full sequence + 1.3s hero hold)
const MIN_VISIBLE_MS = 2900;
// Safety cap: never hold past this even if auth is slow
const MAX_VISIBLE_MS = 4500;

const BRAND_LETTERS = ["S", "i", "n", "o", "T", "i", "c", "k", "e", "t"];
const CIRCLE_SIZE = 120;

// Apple-style ease-out cubic bezier curve
const APPLE_EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

type AnimatedSplashProps = {
  /** Called once it's safe to reveal the real app underneath. */
  onFinish: () => void;
};

/**
 * Individual letter component with Apple-style fluid spring entrance.
 */
function AnimatedLetter({
  char,
  index,
  baseDelay,
}: {
  char: string;
  index: number;
  baseDelay: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(26);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = baseDelay + index * 45;

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 340, easing: APPLE_EASE_OUT })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 420, easing: APPLE_EASE_OUT })
    );
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 420, easing: APPLE_EASE_OUT })
    );
  }, [baseDelay, index, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.letter, animatedStyle]}>
      {char}
    </Animated.Text>
  );
}

/**
 * AnimatedSplash:
 * Apple-inspired launch animation:
 * 1. Rich gradient blue circle drops into center with momentum.
 * 2. Expands smoothly to flood the viewport with deep royal/electric blue.
 * 3. White ticket logo + perfectly centered glass circle + ambient aura reveal together after blue fills screen.
 * 4. "SinoTicket" reveals letter-by-letter in tall Syne_800ExtraBold typography.
 * 5. Tracked uppercase tagline and minimal accent line reveal.
 * 6. Dedicated 1.3s "Hero Hold" phase so the user can clearly admire the brand.
 * 7. Cinematic zoom & dissolve exit.
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { colors, isDark } = useTheme();
  const { isLoaded: authLoaded } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Max scale to ensure the circle blankets any screen diagonal completely
  const maxScale = Math.ceil(
    (Math.hypot(screenWidth, screenHeight) / CIRCLE_SIZE) * 2.2
  );

  // Background circle shared values
  const circleTranslateY = useSharedValue(-screenHeight * 0.65);
  const circleScale = useSharedValue(1);

  // Icon and glass circle shared values (Both start hidden with opacity 0)
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.5);
  const glassRimOpacity = useSharedValue(0);
  const glassRimScale = useSharedValue(0.5);

  // Multi-layered diffused aura shared values
  const auraOuterScale = useSharedValue(0.7);
  const auraOuterOpacity = useSharedValue(0);
  const auraInnerScale = useSharedValue(0.8);
  const auraInnerOpacity = useSharedValue(0);

  // Tagline and pulse bar shared values
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(12);
  const pulseBarWidth = useSharedValue(14);
  const pulseBarOpacity = useSharedValue(0);

  // Exit transition shared values
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  const [mountedAt] = useState(() => Date.now());
  const hasFinished = useRef(false);

  const finish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;

    // Apple-style cinematic zoom & dissolve exit
    containerScale.value = withTiming(1.08, {
      duration: 380,
      easing: APPLE_EASE_OUT,
    });

    containerOpacity.value = withTiming(
      0,
      {
        duration: 360,
        easing: APPLE_EASE_OUT,
      },
      (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }
    );
  };

  // Entrance animations sequence
  useEffect(() => {
    // 1. Blue gradient circle drops from top into center (0ms - 420ms)
    circleTranslateY.value = withTiming(0, {
      duration: 420,
      easing: APPLE_EASE_OUT,
    });

    // 2. Circle expands smoothly to cover screen (380ms - 880ms)
    circleScale.value = withDelay(
      380,
      withTiming(maxScale, {
        duration: 500,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // 3. Ticket Logo AND Glass Circle reveal together ONLY AFTER blue covers the screen (720ms)
    iconOpacity.value = withDelay(
      720,
      withTiming(1, { duration: 320, easing: APPLE_EASE_OUT })
    );
    iconScale.value = withDelay(
      720,
      withTiming(1, {
        duration: 480,
        easing: Easing.out(Easing.back(1.5)),
      })
    );

    glassRimOpacity.value = withDelay(
      720,
      withTiming(1, { duration: 320, easing: APPLE_EASE_OUT })
    );
    glassRimScale.value = withDelay(
      720,
      withTiming(1, {
        duration: 480,
        easing: APPLE_EASE_OUT,
      })
    );

    // 4. Multi-layered Soft Diffused Ambient Aura (Organic, no harsh circles)
    auraOuterOpacity.value = withDelay(
      780,
      withSequence(
        withTiming(0.45, { duration: 400 }),
        withRepeat(
          withSequence(
            withTiming(0.2, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.45, { duration: 1100, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      )
    );
    auraOuterScale.value = withDelay(
      780,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 1100, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    auraInnerOpacity.value = withDelay(
      780,
      withSequence(
        withTiming(0.65, { duration: 400 }),
        withRepeat(
          withSequence(
            withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.65, { duration: 900, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      )
    );
    auraInnerScale.value = withDelay(
      780,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.98, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // 5. Tracked Tagline Reveal (After letters finish at ~1400ms)
    taglineOpacity.value = withDelay(1450, withTiming(0.95, { duration: 400 }));
    taglineTranslateY.value = withDelay(
      1450,
      withTiming(0, { duration: 420, easing: APPLE_EASE_OUT })
    );

    // 6. Minimalist Accent Progress Bar
    pulseBarOpacity.value = withDelay(1600, withTiming(0.75, { duration: 320 }));
    pulseBarWidth.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(42, { duration: 650, easing: Easing.inOut(Easing.ease) }),
          withTiming(18, { duration: 650, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Safety fallback timeout
    const maxTimer = setTimeout(finish, MAX_VISIBLE_MS);
    return () => clearTimeout(maxTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxScale]);

  // Exit trigger: Wait for auth AND the full 2.9s duration so the user sees the final screen
  useEffect(() => {
    if (!authLoaded) return;
    const elapsed = Date.now() - mountedAt;
    const remainingHold = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = setTimeout(finish, remainingHold);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded]);

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: circleTranslateY.value },
      { scale: circleScale.value },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const glassRimStyle = useAnimatedStyle(() => ({
    opacity: glassRimOpacity.value,
    transform: [{ scale: glassRimScale.value }],
  }));

  const auraOuterStyle = useAnimatedStyle(() => ({
    opacity: auraOuterOpacity.value,
    transform: [{ scale: auraOuterScale.value }],
  }));

  const auraInnerStyle = useAnimatedStyle(() => ({
    opacity: auraInnerOpacity.value,
    transform: [{ scale: auraInnerScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const pulseBarStyle = useAnimatedStyle(() => ({
    opacity: pulseBarOpacity.value,
    width: pulseBarWidth.value,
  }));

  const initialBg = isDark ? "#000000" : "#FFFFFF";

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        { backgroundColor: initialBg },
        containerStyle,
      ]}
      pointerEvents="none"
    >
      {/* 1. Dropping & Expanding Rich Gradient Blue Circle */}
      <Animated.View
        style={[
          styles.blueCircle,
          circleAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={["#1D4ED8", colors.primary, "#1E40AF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* 2. Content Layer (Pure White & Apple Keynote Aesthetics) */}
      <View style={styles.contentContainer}>
        {/* Dedicated Icon & Centered Ambient Aura Wrapper */}
        <View style={styles.iconWrapper}>
          {/* Layer 1: Soft Diffused Outer Ambient Aura */}
          <Animated.View style={[styles.auraOuter, auraOuterStyle]} />

          {/* Layer 2: Soft Diffused Inner Glow */}
          <Animated.View style={[styles.auraInner, auraInnerStyle]} />

          {/* Layer 3: Glassmorphic Specular Rim (Perfect Centering) */}
          <Animated.View style={[styles.glassRim, glassRimStyle]} />

          {/* White Ticket Brand Icon (Perfect Centering) */}
          <Animated.Image
            source={require("@/assets/icons/splash-icon-light.png")}
            style={[styles.icon, iconStyle]}
            resizeMode="contain"
          />
        </View>

        {/* Apple-Style "SinoTicket" Letter-by-Letter Staggered Reveal */}
        <View style={styles.wordmarkRow}>
          {BRAND_LETTERS.map((char, index) => (
            <AnimatedLetter
              key={index}
              char={char}
              index={index}
              baseDelay={920}
            />
          ))}
        </View>

        {/* Tracked Luxury Uppercase Tagline */}
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          SMART & SEAMLESS TICKETING
        </Animated.Text>
      </View>

      {/* Minimalist Apple-Style Accent Progress Indicator */}
      <View style={styles.pulseBarContainer}>
        <Animated.View style={[styles.pulseBar, pulseBarStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 999,
  },
  blueCircle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    top: "50%",
    left: "50%",
    marginTop: -CIRCLE_SIZE / 2,
    marginLeft: -CIRCLE_SIZE / 2,
    overflow: "hidden",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  // Dedicated icon wrapper ensuring 100% pixel-perfect centering of aura & icon
  iconWrapper: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  // Multi-layered soft diffused ambient aura
  auraOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  auraInner: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  glassRim: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  icon: {
    width: 90,
    height: 90,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 38,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  tagline: {
    fontFamily: "Syne_700Bold",
    fontSize: 11.5,
    marginTop: 10,
    letterSpacing: 2.8,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.9)",
  },
  pulseBarContainer: {
    position: "absolute",
    bottom: 54,
    height: 3,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  pulseBar: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
});




