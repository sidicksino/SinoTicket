import InputField from "@/components/InputField";
import LoadingScreen from "@/components/LoadingScreen";
import useSocialAuth from "@/hooks/useSocialAuth";
import { useAuth, useClerk, useSignIn, useSignUp } from "@clerk/expo";
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

const SignUp = () => {
  // @ts-ignore — @clerk/expo v3 types useSignUp as SignalValue; signUp exists at runtime
  const { signUp } = useSignUp();
  // @ts-ignore
  const { signIn } = useSignIn();
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

  const handleSubmit = async () => {
    if (!signUp || isSubmitting) return;
    setApiError("");
    setIsSubmitting(true);

    if (!fullName.trim()) {
      setApiError("Full name is required.");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setApiError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setApiError("Password must be at least 8 characters.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setApiError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      // STEP 1: Probe for existing account by attempting sign-in.
      // If it succeeds → user already exists → block and redirect.
      if (signIn) {
        try {
          await (signIn as any).create({
            identifier: emailAddress,
            password,
          });

          // signIn.create() succeeded → account already exists
          const inlineMsg = "Account already exists. Please log in.";
          setApiError(inlineMsg);
          Alert.alert(
            "Account Already Exists",
            "This email is already registered. Please log in instead.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Log In",
                onPress: () => router.push("/(auth)/sign-in"),
              },
            ],
          );
          setIsSubmitting(false);
          return;
        } catch {
          // Expected: user does NOT exist → continue with sign-up
        }
      }

      // STEP 2: Proceed with real sign-up
      const names = fullName.trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.length > 1 ? names.slice(1).join(" ") : "";

      await signUp.create({
        emailAddress,
        // @ts-ignore
        password,
        firstName,
        lastName,
      });

      // STEP 3: Send OTP only for genuinely new accounts
      await signUp.verifications.sendEmailCode();
      setPendingVerification(true);
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "An error occurred.";

      setApiError(msg);
      Alert.alert("Sign-up Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleVerify = async () => {
    if (!signUp || isSubmitting) return;
    setApiError("");
    setIsSubmitting(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        const msg = (error as any).errors?.[0]?.longMessage ||
          (error as any).errors?.[0]?.message ||
          "Verification failed.";
        setApiError(msg);
        return;
      }

      if (signUp.status === "complete") {
        if (signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId });
        }
        router.replace("/(root)/(tabs)/home");
      } else {
        const msg =
          "Sign-up incomplete. Missing: " +
          ((signUp as any).missingFields?.join(", ") || "Unknown fields");
        setApiError(msg);
        Alert.alert("Incomplete", msg);
        console.error("Missing fields:", (signUp as any).missingFields);
      }
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "An error occurred during verification.";
      setApiError(msg);
      Alert.alert("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authLoaded) {
    return <LoadingScreen />;
  }

  if (signUp?.status === "complete") {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-8 pt-16">
          <Text className="font-syne text-[32px] font-black text-[#0F172A] mb-4">
            Verify Email
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
            <Text className="text-red-500 font-medium mb-4 text-center">
              {apiError}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={isSubmitting || !code}
            className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 mt-4 active:opacity-80"
            style={isSubmitting || !code ? { opacity: 0.6 } : {}}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-syne font-bold text-[18px]">
                Verify
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit =
    !!fullName && !!emailAddress && !!password && !!confirmPassword && !isSubmitting;

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
                  onChangeText={setFullName}
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
                  onChangeText={setEmailAddress}
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
                  onChangeText={setPassword}
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
                  onChangeText={setConfirmPassword}
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
                  <Text className="text-red-500 font-medium text-[14px] mt-4 text-center">
                    {apiError}
                  </Text>
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