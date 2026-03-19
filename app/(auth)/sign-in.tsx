import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
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

const AnimatedView = Animated.createAnimatedComponent(View);

const SignIn = () => {
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
          <View className="flex-1 px-8 pt-8">
            {/* HEADER SECTION */}
            <AnimatedView
              entering={FadeInDown.duration(800)
                .delay(100)
                .springify()
                .damping(18)}
            >
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px] bg-[#0286FF]/10">
                <Ionicons name="log-in-outline" size={32} color="#0286FF" />
              </View>

              <Text className="font-syne text-[42px] font-black text-[#0F172A] leading-tight">
                Welcome
              </Text>
              <Text className="font-syne text-[42px] font-black text-[#0286FF] leading-tight mb-4">
                Back.
              </Text>

              <Text className="mb-8 text-[16px] font-medium text-[#64748B] leading-relaxed">
                Log in to SinoTicket to manage your tickets and discover fantastic events.
              </Text>
            </AnimatedView>

            {/* FORM SECTION */}
            <View className="w-full mt-2">
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(200)
                  .springify()
                  .damping(18)}
              >
                <InputField
                  label="Email or Phone Number"
                  placeholder="Enter email or phone"
                  icon="person-outline"
                  autoCapitalize="none"
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(300)
                  .springify()
                  .damping(18)}
              >
                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                />
              </AnimatedView>

              {/* FORGOT PASSWORD */}
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(400)
                  .springify()
                  .damping(18)}
                className="flex flex-row justify-end mb-6 mt-1"
              >
                <Text className="text-[14px] font-bold text-[#0286FF] active:opacity-70">
                  Forgot Password?
                </Text>
              </AnimatedView>

              {/* CALL TO ACTION BUTTON */}
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(500)
                  .springify()
                  .damping(18)}
              >
                <TouchableOpacity
                  className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                >
                  <Text className="text-white font-syne font-bold text-[18px]">
                    Log In
                  </Text>
                </TouchableOpacity>
              </AnimatedView>
            </View>

            {/* DIVIDER */}
            <AnimatedView
              entering={FadeInDown.duration(800)
                .delay(600)
                .springify()
                .damping(18)}
              className="mt-10 mb-6 flex flex-row items-center justify-center gap-x-4"
            >
              <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
              <Text className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">
                Or continue with
              </Text>
              <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
            </AnimatedView>

            {/* SOCIAL LOGIN */}
            <AnimatedView
              entering={FadeInDown.duration(800)
                .delay(700)
                .springify()
                .damping(18)}
              className="flex flex-row items-center justify-between gap-x-4"
            >
              <TouchableOpacity className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]">
                <Image
                  source={require("@/assets/icons/google-icon.png")}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </AnimatedView>

            {/* FOOTER */}
            <AnimatedView
              entering={FadeInUp.duration(800)
                .delay(800)
                .springify()
                .damping(18)}
              className="mt-10 flex flex-row justify-center items-center"
            >
              <Text className="text-[15px] font-medium text-[#64748B]">
                Don&apos;t have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-up">
                <Text className="text-[15px] font-bold text-[#0286FF]">
                  Sign Up
                </Text>
              </Link>
            </AnimatedView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;