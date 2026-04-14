import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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

import { useTranslation } from "react-i18next";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Use Animated.View directly — avoids the shared-value strict-mode warning
// that occurs when using Animated.createAnimatedComponent(View) manually.
const AnimatedView = Animated.View;

const SignUpPhone = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* KeyboardAvoidingView belongs here — once, at the screen level */}
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
            {/* HEADER SECTION */}
            <AnimatedView
              entering={FadeInDown.duration(800)
                .delay(100)
                .springify()
                .damping(18)}
            >
              <View className="mb-8">
                <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px] bg-[#0286FF]/10">
                  <Ionicons name="sparkles" size={28} color="#0286FF" />
                </View>
                <Text className="font-syne text-[42px] font-black text-[#0F172A] leading-tight">
                  {t("signUpPhone.create")}
                </Text>
                <Text className="font-syne text-[42px] font-black text-[#0286FF] leading-tight mb-4">
                  {t("signUpPhone.account")}
                </Text>
                <Text className="text-[16px] font-medium text-[#64748B] leading-relaxed">
                  {t("signUpPhone.subtitle")}
                </Text>
              </View>
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
                  label={t("signUpPhone.fullName")}
                  placeholder={t("signUpPhone.enterName")}
                  icon="person-outline"
                  autoCapitalize="words"
                />
              </AnimatedView>
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(300)
                  .springify()
                  .damping(18)}
              >
                <InputField
                  label={t("signUpPhone.phoneNumber")}
                  placeholder={t("signUpPhone.enterPhoneNumber")}
                  icon="call-outline"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </AnimatedView>
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(400)
                  .springify()
                  .damping(18)}
              >
                <InputField
                  label={t("signUpPhone.password")}
                  placeholder={t("signUpPhone.enterPassword")}
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                />
              </AnimatedView>
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(400)
                  .springify()
                  .damping(18)}
              >
                <InputField
                  label={t("signUpPhone.confirmPassword")}
                  placeholder={t("signUpPhone.confirmYourPassword")}
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                />
              </AnimatedView>

              {/* CALL TO ACTION BUTTON */}
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(500)
                  .springify()
                  .damping(18)}
                style={{ marginTop: 24 }}
              >
                <TouchableOpacity className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80">
                  <Text className="text-white font-syne font-bold text-[18px]">
                    {t("signUpPhone.signUp")}
                  </Text>
                </TouchableOpacity>
              </AnimatedView>

              {/* DIVIDER */}
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(600)
                  .springify()
                  .damping(18)}
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
                  {t("signUpPhone.orContinueWith")}
                </Text>
                <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
              </AnimatedView>

              {/* SOCIAL LOGIN */}
              <AnimatedView
                entering={FadeInDown.duration(800)
                  .delay(700)
                  .springify()
                  .damping(18)}
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
                  className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]"
                  onPress={() => router.push("/(auth)/sign-up")}
                >
                  <Image
                    source={require("@/assets/icons/gmail-icon.png")}
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
                style={{
                  marginTop: 40,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text className="text-[15px] font-medium text-[#64748B]">
                  {t("signUpPhone.alreadyHaveAccount")}{" "}
                </Text>
                <Link href="/(auth)/sign-in">
                  <Text className="text-[15px] font-bold text-[#0286FF]">
                    {t("signUpPhone.logIn")}
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

export default SignUpPhone;
