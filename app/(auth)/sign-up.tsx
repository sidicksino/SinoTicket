import InputField from "@/components/InputField";
import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect, useRouter } from "expo-router";
import React from "react";
import {
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
  const { signUp, fetchStatus } = useSignUp();
  const { isLoaded: authLoaded } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const handleSubmit = async () => {
    if (!signUp) return;
    setApiError("");

    if (!fullName) {
      setApiError("Full name is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setApiError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setApiError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setApiError("Passwords do not match.");
      return;
    }

    try {
      const names = fullName.trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.length > 1 ? names.slice(1).join(" ") : "";

      await signUp.create({
        emailAddress,
        // @ts-ignore - Valid in Clerk runtime, typed differently in some versions
        password,
        firstName,
        lastName,
      });

      await signUp.verifications.sendEmailCode();
      setPendingVerification(true);
    } catch (err: any) {
      setApiError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "An error occurred."
      );
      console.error(err);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;
    setApiError("");
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (error) {
        setApiError((error as any).errors?.[0]?.longMessage || (error as any).errors?.[0]?.message || "Verification failed.");
        return;
      }

      if (signUp.status === "complete") {
        if (signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId });
        }
        router.replace("/(root)/(tabs)/home");
      } else {
        setApiError(
          "Sign-up incomplete. Missing: " + signUp.missingFields?.join(", ")
        );
        console.error("Missing fields:", signUp.missingFields);
      }
    } catch (err: any) {
      setApiError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "An error occurred."
      );
      console.error(err);
    }
  };

  if (!authLoaded) {
    return null;
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
            disabled={fetchStatus === "fetching"}
            className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 mt-4 active:opacity-80"
          >
            <Text className="text-white font-syne font-bold text-[18px]">
              Verify
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
                  Join SinoTicket today and unlock access to the best events in
                  town.
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
                  disabled={
                    !fullName ||
                    !emailAddress ||
                    !password ||
                    !confirmPassword ||
                    fetchStatus === "fetching"
                  }
                  className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                  style={
                    !fullName ||
                      !emailAddress ||
                      !password ||
                      !confirmPassword ||
                      fetchStatus === "fetching"
                      ? { opacity: 0.5 }
                      : {}
                  }
                >
                  <Text className="text-white font-syne font-bold text-[18px]">
                    Sign Up
                  </Text>
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
                <TouchableOpacity className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]">
                  <Image
                    source={require("@/assets/icons/google-icon.png")}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
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