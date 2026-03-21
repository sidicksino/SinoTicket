import InputField from "@/components/InputField";
import { useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
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

const ForgotPassword = () => {
  const { client, setActive } = useClerk();
  const signIn = client.signIn;
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleReset = async () => {
    if (!signIn || isSubmitting || !email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setIsSuccess(true);
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Failed to send reset link. Please try again.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signIn || isSubmitting || !code.trim() || !newPassword.trim()) return;

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert("Success", "Password reset successfully!");
        router.replace("/(auth)/sign-in");
      } else {
        setError("Password reset incomplete. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Invalid reset code or password.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          {/* TOP BACK BUTTON */}
          <View className="px-5 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] border border-[#E2E8F0]"
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-8 pt-6">
            {/* HEADER SECTION */}
            <Animated.View
              entering={FadeInDown.duration(800).delay(100).springify().damping(18)}
            >
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px] bg-[#0286FF]/10">
                <Ionicons name="lock-closed" size={32} color="#0286FF" />
              </View>
              <Text className="font-syne text-[42px] font-black text-[#0F172A] leading-tight">
                {isSuccess ? "Reset" : "Forgot"}
              </Text>
              <Text className="font-syne text-[42px] font-black text-[#0286FF] leading-tight mb-4">
                Password?
              </Text>
              <Text className="mb-8 text-[16px] font-medium text-[#64748B] leading-relaxed">
                {isSuccess 
                  ? `We sent a 6-digit code to ${email}. Enter it below with your new password.`
                  : "No worries! Enter your email below and we'll send you a reset code."}
              </Text>
            </Animated.View>

            {/* FORM SECTION */}
            <View className="w-full mt-2">
              {!isSuccess ? (
                <Animated.View entering={FadeInDown.duration(800).delay(200).springify().damping(18)}>
                  <InputField
                    label="Email Address"
                    placeholder="Enter your email"
                    icon="mail-outline"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(val) => { setEmail(val); setError(""); }}
                  />
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown.duration(800).delay(200).springify().damping(18)}>
                  <InputField
                    label="Reset Code"
                    placeholder="Enter 6-digit code"
                    icon="key-outline"
                    keyboardType="numeric"
                    value={code}
                    onChangeText={(val) => { setCode(val); setError(""); }}
                  />
                  <InputField
                    label="New Password"
                    placeholder="Enter new password"
                    icon="lock-closed-outline"
                    secureTextEntry={true}
                    value={newPassword}
                    onChangeText={(val) => { setNewPassword(val); setError(""); }}
                  />
                </Animated.View>
              )}

              {error ? (
                <Text className="text-red-500 font-medium text-[14px] mt-4 text-center">
                  {error}
                </Text>
              ) : null}

              {/* CALL TO ACTION BUTTON */}
              <Animated.View
                entering={FadeInDown.duration(800).delay(300).springify().damping(18)}
                style={styles.button}
              >
                {!isSuccess ? (
                  <TouchableOpacity
                    onPress={handleReset}
                    disabled={isSubmitting || !email.trim()}
                    className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                    style={isSubmitting || !email.trim() ? { opacity: 0.6 } : {}}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-syne font-bold text-[18px]">
                        Send Reset Code
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleVerify}
                    disabled={isSubmitting || !code.trim() || !newPassword.trim()}
                    className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                    style={isSubmitting || !code.trim() || !newPassword.trim() ? { opacity: 0.6 } : {}}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-syne font-bold text-[18px]">
                        Reset Password
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </Animated.View>
            </View>

            {/* FOOTER */}
            <Animated.View
              entering={FadeInUp.duration(800).delay(500).springify().damping(18)}
              style={styles.footer}
            >
              <Text className="text-[15px] font-medium text-[#64748B]">
                Remember your password?{" "}
              </Text>
              <Link href="/(auth)/sign-in">
                <Text className="text-[15px] font-bold text-[#0286FF]">
                  Log In
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
  button: {
    marginTop: 24,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ForgotPassword;
