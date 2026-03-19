import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

const SignUp = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="flex-1 px-8 pt-8">
          {/* HEADER SECTION */}
          <AnimatedView entering={FadeInDown.duration(800).delay(100).springify().damping(18)}>
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

          {/* FORM SECTION */}
          <View className="w-full mt-2">
            <AnimatedView entering={FadeInDown.duration(800).delay(200).springify().damping(18)}>
              <InputField
                label="Full Name"
                placeholder="John Doe"
                icon="person-outline"
                autoCapitalize="words"
              />
            </AnimatedView>
            <AnimatedView entering={FadeInDown.duration(800).delay(300).springify().damping(18)}>
              <InputField
                label="Email Address"
                placeholder="name@example.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </AnimatedView>
            <AnimatedView entering={FadeInDown.duration(800).delay(400).springify().damping(18)}>
              <InputField
                label="Password"
                placeholder="Min. 8 characters"
                icon="lock-closed-outline"
                secureTextEntry={true}
              />
            </AnimatedView>

            {/* CALL TO ACTION BUTTON */}
            <AnimatedView entering={FadeInDown.duration(800).delay(500).springify().damping(18)} className="mt-6">
              <TouchableOpacity
                className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
              >
                <Text className="text-white font-syne font-bold text-[18px]">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </AnimatedView>

            {/* DIVIDER */}
            <AnimatedView
              entering={FadeInDown.duration(800).delay(600).springify().damping(18)}
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
              entering={FadeInDown.duration(800).delay(700).springify().damping(18)}
              className="flex flex-row items-center justify-between gap-x-4"
            >
              <TouchableOpacity className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]">
                <Image
                  source={require("@/assets/icons/google-icon.png")}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]">
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
              className="mt-10 flex flex-row justify-center items-center"
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
    </SafeAreaView>
  );
};

export default SignUp;