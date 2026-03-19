import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

const SignUp = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-8 pt-12 pb-8">
            <AnimatedView entering={FadeInDown.duration(800).delay(100).springify().damping(14)}>
              <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-[#0286FF]/10">
                <Ionicons name="person-add" size={24} color="#0286FF" />
              </View>
              <Text className="mb-2 font-syne text-[32px] font-extrabold text-[#0F172A]">
                Create Account
              </Text>
              <Text className="mb-10 text-[16px] font-medium text-[#64748B]">
                Join SinoTicket today. Let&apos;s explore together.
              </Text>
            </AnimatedView>

            <View className="w-full">
              <AnimatedView entering={FadeInDown.duration(800).delay(200).springify().damping(14)}>
                <InputField
                  label="Full Name"
                  placeholder="John Doe"
                  autoCapitalize="words"
                />
              </AnimatedView>

              <AnimatedView entering={FadeInDown.duration(800).delay(300).springify().damping(14)}>
                <InputField
                  label="Email Address"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </AnimatedView>

              <AnimatedView entering={FadeInDown.duration(800).delay(400).springify().damping(14)}>
                <InputField
                  label="Password"
                  placeholder="Min. 8 characters"
                  secureTextEntry={true}
                />
              </AnimatedView>

              <AnimatedView entering={FadeInDown.duration(800).delay(500).springify().damping(14)}>
                <CustomButton
                  title="Create Account"
                  onPress={() => { }}
                  className="mt-4 shadow-lg shadow-[#0286FF]/30"
                />
              </AnimatedView>
            </View>

            <AnimatedView
              entering={FadeInDown.duration(800).delay(600).springify().damping(14)}
              className="mt-8 flex flex-row items-center justify-center gap-x-4"
            >
              <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
              <Text className="text-[14px] font-medium text-[#94A3B8]">or continue with</Text>
              <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
            </AnimatedView>

            <AnimatedView
              entering={FadeInDown.duration(800).delay(700).springify().damping(14)}
              className="mt-6 flex flex-row items-center justify-center gap-x-5"
            >
              <TouchableOpacity className="flex h-[50px] w-[85px] flex-row items-center justify-center rounded-xl border border-[#E2E8F0] bg-white">
                <Image
                  source={require('@/assets/icons/google-icon.png')}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity className="flex h-[50px] w-[85px] flex-row items-center justify-center rounded-xl border border-[#E2E8F0] bg-white">
                <Image
                  source={require('@/assets/icons/phone-icon.png')}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </AnimatedView>

            <AnimatedView entering={FadeInDown.duration(800).delay(800).springify().damping(14)} className="mt-auto pt-8">
              <View className="flex flex-row justify-center">
                <Text className="text-[15px] font-medium text-[#64748B]">
                  Already have an account?{" "}
                </Text>
                <Link href="/(auth)/sign-in">
                  <Text className="text-[15px] font-bold text-[#0286FF]">
                    Log in
                  </Text>
                </Link>
              </View>
            </AnimatedView>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;