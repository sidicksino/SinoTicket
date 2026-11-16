import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_SEEN_KEY = "sinoticket_onboarding_seen";

/** True once the user has finished or skipped the onboarding slides. */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen() {
  AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "1").catch(() => {});
}
