import CustomButton from "@/components/CustomButton";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

const SignUp = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="flex-1 px-8 pt-12 pb-8">
            <AnimatedView entering={FadeInDown.delay(100)}>
              <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-[#0286FF]/10">
                <Ionicons name="person-add" size={24} color="#0286FF" />
              </View>

              <Text className="mb-2 font-syne text-[32px] font-extrabold text-[#0F172A]">
                Create Account
              </Text>

              <Text className="mb-10 text-[16px] text-[#64748B]">
                Join SinoTicket today. Let&apos;s explore together.
              </Text>
            </AnimatedView>

            <View>
              <AnimatedView entering={FadeInDown.delay(200)}>
                <InputField
                  label="Full Name"
                  placeholder="John Doe"
                  icon="person-outline"
                />
              </AnimatedView>

              <AnimatedView entering={FadeInDown.delay(300)}>
                <InputField
                  label="Email Address"
                  placeholder="name@example.com"
                  icon="mail-outline"
                  keyboardType="email-address"
                />
              </AnimatedView>

              <AnimatedView entering={FadeInDown.delay(400)}>
                <InputField
                  label="Password"
                  placeholder="Min. 8 characters"
                  icon="lock-closed-outline"
                  secureTextEntry
                />
              </AnimatedView>

              <AnimatedView entering={FadeInDown.delay(500)}>
                <CustomButton
                  title="Create Account"
                  onPress={() => { }}
                  className="mt-4"
                />
              </AnimatedView>
            </View>

            <AnimatedView
              entering={FadeInDown.delay(600)}
              className="mt-8 flex-row items-center"
            >
              <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
              <Text className="mx-3 text-[#94A3B8]">
                or continue with
              </Text>
              <View className="flex-1 h-[1px] bg-[#E2E8F0]" />
            </AnimatedView>

            <AnimatedView
              entering={FadeInDown.delay(700)}
              className="mt-6 flex-row justify-center gap-5"
            >
              <TouchableOpacity className="h-[50px] w-[85px] items-center justify-center rounded-xl border border-[#E2E8F0]">
                <Image
                  source={require("@/assets/icons/google-icon.png")}
                  style={{ width: 22, height: 22 }}
                />
              </TouchableOpacity>

              <TouchableOpacity className="h-[50px] w-[85px] items-center justify-center rounded-xl border border-[#E2E8F0]">
                <Image
                  source={require("@/assets/icons/phone-icon.png")}
                  style={{ width: 22, height: 22 }}
                />
              </TouchableOpacity>
            </AnimatedView>

            <AnimatedView
              entering={FadeInDown.delay(800)}
              className="mt-auto pt-8"
            >
              <View className="flex-row justify-center">
                <Text className="text-[#64748B]">
                  Already have an account?{" "}
                </Text>
                <Link href="/(auth)/sign-in">
                  <Text className="font-bold text-[#0286FF]">
                    Log in
                  </Text>
                </Link>
              </View>
            </AnimatedView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;