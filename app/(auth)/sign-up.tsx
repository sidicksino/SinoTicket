import InputField from "@/components/InputField";
import LoadingScreen from "@/components/LoadingScreen";
import useSocialAuth from "@/hooks/useSocialAuth";
import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.View;

const CLERK_ERRORS = {
  EMAIL_EXISTS: "form_identifier_exists",
  INVALID_EMAIL: "form_param_format_invalid",
  WEAK_PASSWORD: "form_password_pwned",
} as const;

const SignUp = () => {
  const { signUp } = useSignUp();
  const { isLoaded: authLoaded } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const { handleGoogleAuth, loading: googleLoading } = useSocialAuth();

  const [fullName, setFullName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))
      return "Please enter a valid email address.";
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    if (password !== confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const resolveClerkError = (err: any): string => {
    const code = err?.errors?.[0]?.code ?? "";
    switch (code) {
      case CLERK_ERRORS.EMAIL_EXISTS:
        return "An account with this email already exists.";
      case CLERK_ERRORS.INVALID_EMAIL:
        return "Please enter a valid email address.";
      case CLERK_ERRORS.WEAK_PASSWORD:
        return "This password is too common. Please choose a stronger one.";
      default:
        return (
          err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          "Something went wrong. Please try again."
        );
    }
  };

  // ─── Step 1: Create account + send OTP ───────────────────────────────────
  const handleSubmit = async () => {
    if (!signUp || isSubmitting) return;

    setApiError("");

    const validationError = validate();
    if (validationError) {
      setApiError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const names = fullName.trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.length > 1 ? names.slice(1).join(" ") : "";

      // 1️⃣ Create account
      await (signUp as any).create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // 2️⃣ Send OTP
      await (signUp as any).verifications.sendEmailCode();
      setPendingVerification(true);

    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code ?? "";
      const message = resolveClerkError(err);
      setApiError(message);

      if (errorCode === CLERK_ERRORS.EMAIL_EXISTS) {
        Alert.alert(
          "Account Already Exists",
          "This email is already registered. Would you like to log in instead?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Log In", onPress: () => router.push("/(auth)/sign-in") },
          ]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp || isSubmitting) return;

    if (!code.trim()) {
      setApiError("Please enter the verification code.");
      return;
    }

    setApiError("");
    setIsSubmitting(true);

    try {
      // 3️⃣ Verify OTP
      const { error } = await (signUp as any).verifications.verifyEmailCode({ code });

      if (error) {
        setApiError(
          (error as any)?.errors?.[0]?.longMessage ||
          (error as any)?.errors?.[0]?.message ||
          "Invalid verification code."
        );
        return;
      }

      if ((signUp as any).status === "complete") {
        await setActive({ session: (signUp as any).createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        setApiError(
          "Sign-up incomplete. Missing: " +
          ((signUp as any).missingFields?.join(", ") || "unknown fields")
        );
      }
    } catch (err: any) {
      setApiError(resolveClerkError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authLoaded) return <LoadingScreen />;

  if ((signUp as any)?.status === "complete") {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  // ─── OTP Screen ───────────────────────────────────────────────────────────
  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-8 pt-16">
          <View className="mb-8">
            <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px] bg-[#0286FF]/10">
              <Ionicons name="mail-unread-outline" size={28} color="#0286FF" />
            </View>
            <Text className="font-syne text-[32px] font-black text-[#0F172A] leading-tight">
              Check Your
            </Text>
            <Text className="font-syne text-[32px] font-black text-[#0286FF] leading-tight mb-3">
              Email.
            </Text>
            <Text className="text-[15px] font-medium text-[#64748B]">
              We sent a 6-digit code to{" "}
              <Text className="font-bold text-[#0F172A]">{emailAddress}</Text>
            </Text>
          </View>

          <InputField
            label="Verification Code"
            placeholder="Enter 6-digit code"
            icon="key-outline"
            keyboardType="numeric"
            value={code}
            onChangeText={(val) => {
              setCode(val);
              setApiError("");
            }}
          />

          {apiError ? (
            <Text className="text-red-500 font-medium mt-2 mb-2 text-center">
              {apiError}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={isSubmitting || !code}
            className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 mt-6 active:opacity-80"
            style={isSubmitting || !code ? { opacity: 0.6 } : {}}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-syne font-bold text-[18px]">
                Verify Email
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPendingVerification(false)}
            className="mt-4 items-center"
          >
            <Text className="text-[14px] font-medium text-[#64748B]">
              ← Go back and change email
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit =
    !!fullName && !!emailAddress && !!password && !!confirmPassword && !isSubmitting;

  // ─── Sign Up Screen ───────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="flex-1 px-8 pt-8">
            {/* HEADER */}
            <AnimatedView
              entering={FadeInDown.duration(800).delay(100).springify().damping(18)}
            >
              <View className="mb-8">
                <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px] bg-[#0286FF]/10">
                  <Ionicons name="sparkles" size={28} color="#0286FF" />
                </View>
                <Text className="font-syne text-[42px] font-black text-[#0F172A] leading-tight">
                  Create
                </Text>
                <Text className="font-syne text-[42px] font-black text-[#0286FF] leading-tight mb-4">
                  Account.
                </Text>
                <Text className="text-[16px] font-medium text-[#64748B] leading-relaxed">
                  Join SinoTicket today and unlock access to the best events in town.
                </Text>
              </View>
            </AnimatedView>

            {/* FORM */}
            <View className="w-full mt-2">
              <AnimatedView
                entering={FadeInDown.duration(800).delay(200).springify().damping(18)}
              >
                <InputField
                  label="Full Name"
                  placeholder="Enter your name"
                  icon="person-outline"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={(val) => { setFullName(val); setApiError(""); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(300).springify().damping(18)}
              >
                <InputField
                  label="Email Address"
                  placeholder="Enter your email"
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailAddress}
                  onChangeText={(val) => { setEmailAddress(val); setApiError(""); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(400).springify().damping(18)}
              >
                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={(val) => { setPassword(val); setApiError(""); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(450).springify().damping(18)}
              >
                <InputField
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={(val) => { setConfirmPassword(val); setApiError(""); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(500).springify().damping(18)}
                style={{ marginTop: 24 }}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                  style={!canSubmit ? { opacity: 0.6 } : {}}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-syne font-bold text-[18px]">
                      Sign Up
                    </Text>
                  )}
                </TouchableOpacity>

                {apiError ? (
                  <View className="mt-4 px-4 py-3 bg-red-50 rounded-2xl border border-red-100">
                    <Text className="text-red-500 font-medium text-[13px] text-center">
                      {apiError}
                    </Text>
                    {apiError.includes("already exists") && (
                      <TouchableOpacity
                        onPress={() => router.push("/(auth)/sign-in")}
                        className="mt-2 items-center"
                      >
                        <Text className="text-[#0286FF] font-bold text-[13px]">
                          Log in instead →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
              </AnimatedView>

              {/* DIVIDER */}
              <AnimatedView
                entering={FadeInDown.duration(800).delay(600).springify().damping(18)}
                style={{
                  marginTop: 40,
                  marginBottom: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
                <Text className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">
                  Or continue with
                </Text>
                <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
              </AnimatedView>

              {/* SOCIAL LOGIN */}
              <AnimatedView
                entering={FadeInDown.duration(800).delay(700).springify().damping(18)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <TouchableOpacity
                  onPress={handleGoogleAuth}
                  disabled={googleLoading}
                  className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]"
                  style={googleLoading ? { opacity: 0.6 } : {}}
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
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/sign-up-phone")}
                  className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]"
                >
                  <Image
                    source={require("@/assets/icons/phone-icon.png")}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </AnimatedView>

              {/* FOOTER */}
              <AnimatedView
                entering={FadeInUp.duration(800).delay(800).springify().damping(18)}
                style={{
                  marginTop: 40,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text className="text-[15px] font-medium text-[#64748B]">
                  Already have an account?{" "}
                </Text>
                <Link href="/(auth)/sign-in">
                  <Text className="text-[15px] font-bold text-[#0286FF]">
                    Log In
                  </Text>
                </Link>
              </AnimatedView>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;