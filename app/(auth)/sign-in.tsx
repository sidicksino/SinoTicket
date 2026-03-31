import InputField from "@/components/InputField";
import { useClerk, useSignIn } from "@clerk/expo";
import { useTheme } from "@/context/ThemeContext";
import useSocialAuth from "@/hooks/useSocialAuth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  // @ts-ignore — @clerk/expo v3 types are stricter than runtime; signIn IS a full resource
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const { handleGoogleAuth, loading: googleLoading } = useSocialAuth();
  const { colors } = useTheme();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [apiError, setApiError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isMfaPending, setIsMfaPending] = React.useState(false);

  const handleSubmit = async () => {
    if (!signIn || isSubmitting) return;
    setApiError("");
    setIsSubmitting(true);

    if (!emailAddress) {
      setApiError("Email or phone number is required.");
      setIsSubmitting(false);
      return;
    }

    if (emailAddress.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        setApiError("Please enter a valid email address.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const { error } = await (signIn as any).create({
        identifier: emailAddress,
        password,
      });

      if (error) {
        const msg =
          (error as any).errors?.[0]?.longMessage ||
          (error as any).errors?.[0]?.message ||
          "Log in failed.";
        Alert.alert("Error", msg);
        setApiError(msg);
        return;
      }

      if ((signIn as any).status === "complete") {
        if ((signIn as any).createdSessionId) {
          await setActive({ session: (signIn as any).createdSessionId });
        }
        router.replace("/(root)/(tabs)/home");
      } else if ((signIn as any).status === "needs_second_factor") {
        try {
          await (signIn as any).prepareSecondFactor({ strategy: "email_code" });
          setIsMfaPending(true);
        } catch (mfaErr: any) {
          const msg =
            mfaErr.errors?.[0]?.longMessage || "Failed to send verification code.";
          Alert.alert("Error", msg);
          setApiError(msg);
        }
      } else {
        Alert.alert("Error", "Log in failed. Please try again.");
        setApiError("Log in failed.");
      }
    } catch (err: any) {
      console.error("Sign in error:", JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "An error occurred.";
      Alert.alert("Error", msg);
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signIn || isSubmitting) return;
    setApiError("");
    setIsSubmitting(true);
    try {
      await (signIn as any).mfa?.verifyEmailCode({ code });

      if ((signIn as any).status === "complete") {
        if ((signIn as any).createdSessionId) {
          await setActive({ session: (signIn as any).createdSessionId });
        }
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Verification attempt not complete.");
      }
    } catch (err: any) {
      console.error("Verify error:", JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "An error occurred.";
      Alert.alert("Error", msg);
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMfaPending) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 px-8 pt-16">
          <Text className="font-syne text-[32px] font-black mb-4" style={{ color: colors.text }}>
            Verify Account
          </Text>
          <InputField
            label="Verification Code"
            placeholder="Enter your verification code"
            icon="key-outline"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          {apiError ? (
            <Text className="font-medium mb-4 text-center" style={{ color: colors.error }}>{apiError}</Text>
          ) : null}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={isSubmitting || !code}
            className="w-full h-[60px] rounded-full flex items-center justify-center shadow-lg active:opacity-80 mt-4"
            style={[isSubmitting || !code ? { opacity: 0.6 } : {}, { backgroundColor: colors.primary, shadowColor: colors.primaryLight }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="font-syne font-bold text-[18px]" style={{ color: colors.white }}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = fetchStatus === "fetching" || isSubmitting;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="flex-1 px-8 pt-8">
            {/* HEADER SECTION */}
            <Animated.View
              entering={FadeInDown.duration(800).delay(100).springify().damping(18)}
            >
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px]" style={{ backgroundColor: colors.primaryLight }}>
                <Ionicons name="log-in-outline" size={32} color={colors.primary} />
              </View>
              <Text className="font-syne text-[42px] font-black leading-tight" style={{ color: colors.text }}>
                Welcome
              </Text>
              <Text className="font-syne text-[42px] font-black leading-tight mb-4" style={{ color: colors.primary }}>
                Back.
              </Text>
              <Text className="mb-8 text-[16px] font-medium leading-relaxed" style={{ color: colors.subtext }}>
                Log in to SinoTicket to manage your tickets and discover fantastic events.
              </Text>
            </Animated.View>

            {/* FORM SECTION */}
            <View className="w-full mt-2">
              <Animated.View
                entering={FadeInDown.duration(800).delay(200).springify().damping(18)}
              >
                <InputField
                  label="Email or Phone Number"
                  placeholder="Enter email or phone"
                  icon="person-outline"
                  autoCapitalize="none"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(800).delay(300).springify().damping(18)}
              >
                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(800).delay(400).springify().damping(18)}
                style={styles.forgotPassword}
              >
                <Link href="/(auth)/forgot-password">
                  <Text className="text-[14px] font-bold" style={{ color: colors.primary }}>
                    Forgot Password?
                  </Text>
                </Link>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(800).delay(500).springify().damping(18)}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!emailAddress || !password || isLoading}
                  className="w-full h-[60px] rounded-full flex items-center justify-center shadow-lg active:opacity-80"
                  style={[!emailAddress || !password || isLoading ? { opacity: 0.6 } : {}, { backgroundColor: colors.primary, shadowColor: colors.primaryLight }]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text className="font-syne font-bold text-[18px]" style={{ color: colors.white }}>Log In</Text>
                  )}
                </TouchableOpacity>
                {apiError ? (
                  <Text className="font-medium text-[14px] mt-4 text-center" style={{ color: colors.error }}>
                    {apiError}
                  </Text>
                ) : null}
              </Animated.View>
            </View>

            {/* DIVIDER */}
            <Animated.View
              entering={FadeInDown.duration(800).delay(600).springify().damping(18)}
              style={styles.divider}
            >
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text className="text-[13px] font-bold uppercase tracking-widest" style={{ color: colors.subtext }}>
                Or continue with
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </Animated.View>

            {/* SOCIAL LOGIN */}
            <Animated.View
              entering={FadeInDown.duration(800).delay(700).springify().damping(18)}
              style={styles.socialRow}
            >
              <TouchableOpacity
                onPress={handleGoogleAuth}
                disabled={googleLoading}
                className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border"
                style={[googleLoading ? { opacity: 0.6 } : {}, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#0286FF" />
                ) : (
                  <Image
                    source={require("@/assets/icons/google-icon.png")}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* FOOTER */}
            <Animated.View
              entering={FadeInUp.duration(800).delay(800).springify().damping(18)}
              style={styles.footer}
            >
              <Text className="text-[15px] font-medium" style={{ color: colors.subtext }}>
                Don&apos;t have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-up">
                <Text className="text-[15px] font-bold" style={{ color: colors.primary }}>
                  Sign Up
                </Text>
              </Link>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
    marginTop: 4,
  },
  divider: {
    marginTop: 40,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dividerLine: {
    height: 1,
    flex: 1,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignIn;