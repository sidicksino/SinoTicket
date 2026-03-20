import InputField from "@/components/InputField";
import { useSignIn } from "@clerk/expo";
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
  // @ts-ignore
  const { signIn } = useSignIn();
  const [email, setEmail] = React.useState("");
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
      // @ts-ignore
      await (signIn as any).create({
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
                Forgot
              </Text>
              <Text className="font-syne text-[42px] font-black text-[#0286FF] leading-tight mb-4">
                Password?
              </Text>
              <Text className="mb-8 text-[16px] font-medium text-[#64748B] leading-relaxed">
                No worries! Enter your email below and we&apos;ll send you a reset link.
              </Text>
            </Animated.View>

            {/* FORM SECTION */}
            <View className="w-full mt-2">
              <Animated.View
                entering={FadeInDown.duration(800).delay(200).springify().damping(18)}
              >
                <InputField
                  label="Email Address"
                  placeholder="Enter your email"
                  icon="mail-outline"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </Animated.View>

              {error ? (
                <Text className="text-red-500 font-medium text-[14px] mb-4 text-center">
                  {error}
                </Text>
              ) : null}

              {isSuccess ? (
                <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                  <Text className="text-green-700 font-semibold text-center">
                    ✅ Reset link sent! Check your email inbox.
                  </Text>
                </View>
              ) : null}

              {/* CALL TO ACTION BUTTON */}
              <Animated.View
                entering={FadeInDown.duration(800).delay(300).springify().damping(18)}
                style={styles.button}
              >
                <TouchableOpacity
                  onPress={handleReset}
                  disabled={isSubmitting || !email.trim() || isSuccess}
                  className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                  style={isSubmitting || !email.trim() || isSuccess ? { opacity: 0.6 } : {}}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-syne font-bold text-[18px]">
                      Send Reset Link
                    </Text>
                  )}
                </TouchableOpacity>
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
