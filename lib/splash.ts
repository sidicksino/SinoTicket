import * as SplashScreen from "expo-splash-screen";

/**
 * Coordinates who hides the native launch screen.
 *
 * When the animated intro (components/AnimatedSplash) is on screen, it hides
 * the native splash itself, but only once its own logo has painted, so there
 * is never a blank frame between the two. Otherwise the root layout hides it
 * as soon as fonts, translations and Clerk are ready.
 */
let introOwnsSplash = false;
let hidden = false;

export function claimNativeSplash() {
  introOwnsSplash = true;
}

export function isNativeSplashClaimed() {
  return introOwnsSplash;
}

export function hideNativeSplash() {
  if (hidden) return;
  hidden = true;
  SplashScreen.hideAsync().catch((error) => {
    console.warn("Splash hide failed:", error);
  });
}
