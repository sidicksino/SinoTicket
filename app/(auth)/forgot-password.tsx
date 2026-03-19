import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React from "react";
import {
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

const ForgotPassword = () => {
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
            <AnimatedView
              entering={FadeInDown.duration(800)
                .delay(100)
                .springify()
                .damping(18)}
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
                No worries! Enter your email or phone number below and we will send you instructions to reset it.
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

              {/* CALL TO ACTION BUTTON */}
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(300)
                  .springify()
                  .damping(18)}
                className="mt-6"
              >
                <TouchableOpacity
                  className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                >
                  <Text className="text-white font-syne font-bold text-[18px]">
                    Send Reset Link
                  </Text>
                </TouchableOpacity>
              </AnimatedView>
            </View>

            {/* FOOTER */}
            <AnimatedView
              entering={FadeInUp.duration(800)
                .delay(500)
                .springify()
                .damping(18)}
              className="mt-10 flex flex-row justify-center items-center"
            >
              <Text className="text-[15px] font-medium text-[#64748B]">
                Remember your password?{" "}
              </Text>
              <Link href="/(auth)/sign-in">
                <Text className="text-[15px] font-bold text-[#0286FF]">
                  Log In
                </Text>
              </Link>
            </AnimatedView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
