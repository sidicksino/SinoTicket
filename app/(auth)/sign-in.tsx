import InputField from "@/components/InputField";
import { useTheme } from "@/context/ThemeContext";
import useSocialAuth from "@/hooks/useSocialAuth";
import { useClerk, useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  // @ts-ignore — @clerk/expo v3 types are stricter than runtime; signIn IS a full resource
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const { handleGoogleAuth, loading: googleLoading } = useSocialAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [apiError, setApiError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isMfaPending, setIsMfaPending] = React.useState(false);

  const handleSubmit = async () => {
    if (!signIn || isSubmitting) return;
    setApiError("");
    setIsSubmitting(true);

    if (!emailAddress) {
      setApiError(t("auth.emailOrPhoneRequired"));
      setIsSubmitting(false);
      return;
    }

    if (emailAddress.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        setApiError(t("auth.invalidEmail"));
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const { error } = await (signIn as any).create({
        identifier: emailAddress,
        password,
      });

      if (error) {
        const msg =
          (error as any).errors?.[0]?.longMessage ||
          (error as any).errors?.[0]?.message ||
          t("auth.loginFailed");
        Alert.alert(t("common.error"), msg);
        setApiError(msg);
        return;
      }

      if ((signIn as any).status === "complete") {
        if ((signIn as any).createdSessionId) {
          await setActive({ session: (signIn as any).createdSessionId });
        }
        router.replace("/(root)/(tabs)/home");
      } else if ((signIn as any).status === "needs_second_factor") {
        try {
          await (signIn as any).prepareSecondFactor({ strategy: "email_code" });
          setIsMfaPending(true);
        } catch (mfaErr: any) {
          const msg =
            mfaErr.errors?.[0]?.longMessage || t("auth.failedToSendCode");
          Alert.alert(t("common.error"), msg);
          setApiError(msg);
        }
      } else {
        Alert.alert(t("common.error"), t("auth.loginFailedRetry"));
        setApiError(t("auth.loginFailed"));
      }
    } catch (err: any) {
      console.error("Sign in error:", JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        t("auth.unexpectedError");
      Alert.alert(t("common.error"), msg);
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signIn || isSubmitting) return;
    setApiError("");
    setIsSubmitting(true);
    try {
      await (signIn as any).mfa?.verifyEmailCode({ code });

      if ((signIn as any).status === "complete") {
        if ((signIn as any).createdSessionId) {
          await setActive({ session: (signIn as any).createdSessionId });
        }
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert(t("common.error"), t("auth.verificationNotComplete"));
      }
    } catch (err: any) {
      console.error("Verify error:", JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        t("auth.unexpectedError");
      Alert.alert(t("common.error"), msg);
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMfaPending) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 px-8 pt-16">
          <Text className="font-syne text-[32px] font-black mb-4" style={{ color: colors.text }}>
            {t("auth.verifyAccount")}
          </Text>
          <InputField
            label={t("auth.verificationCode")}
            placeholder={t("auth.enterVerificationCode")}
            icon="key-outline"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          {apiError ? (
            <Text className="font-medium mb-4 text-center" style={{ color: colors.error }}>{apiError}</Text>
          ) : null}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={isSubmitting || !code}
            className="w-full h-[60px] rounded-full flex items-center justify-center shadow-lg active:opacity-80 mt-4"
            style={[isSubmitting || !code ? { opacity: 0.6 } : {}, { backgroundColor: colors.primary, shadowColor: colors.primaryLight }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="font-syne font-bold text-[18px]" style={{ color: colors.white }}>{t("auth.verify")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = fetchStatus === "fetching" || isSubmitting;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
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
            <Animated.View
              entering={FadeInDown.duration(800).delay(100).springify().damping(18)}
            >
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px]" style={{ backgroundColor: colors.primaryLight }}>
                <Ionicons name="log-in-outline" size={32} color={colors.primary} />
              </View>
              <Text className="font-syne text-[42px] font-black leading-tight" style={{ color: colors.text }}>
                {t("auth.welcome")}
              </Text>
              <Text className="font-syne text-[42px] font-black leading-tight mb-4" style={{ color: colors.primary }}>
                {t("auth.back")}
              </Text>
              <Text className="mb-8 text-[16px] font-medium leading-relaxed" style={{ color: colors.subtext }}>
                {t("auth.signInSubtitle")}
              </Text>
            </Animated.View>

            <View className="w-full mt-2">
              <Animated.View
                entering={FadeInDown.duration(800).delay(200).springify().damping(18)}
              >
                <InputField
                  label={t("auth.emailOrPhone")}
                  placeholder={t("auth.enterEmailOrPhone")}
                  icon="person-outline"
                  autoCapitalize="none"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(800).delay(300).springify().damping(18)}
              >
                <InputField
                  label={t("auth.password")}
                  placeholder={t("auth.enterPassword")}
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(800).delay(400).springify().damping(18)}
                style={styles.forgotPassword}
              >
                <Link href="/(auth)/forgot-password">
                  <Text className="text-[14px] font-bold" style={{ color: colors.primary }}>
                    {t("auth.forgotPassword")}
                  </Text>
                </Link>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(800).delay(500).springify().damping(18)}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!emailAddress || !password || isLoading}
                  className="w-full h-[60px] rounded-full flex items-center justify-center shadow-lg active:opacity-80"
                  style={[!emailAddress || !password || isLoading ? { opacity: 0.6 } : {}, { backgroundColor: colors.primary, shadowColor: colors.primaryLight }]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text className="font-syne font-bold text-[18px]" style={{ color: colors.white }}>{t("auth.logIn")}</Text>
                  )}
                </TouchableOpacity>
                {apiError ? (
                  <Text className="font-medium text-[14px] mt-4 text-center" style={{ color: colors.error }}>
                    {apiError}
                  </Text>
                ) : null}
              </Animated.View>
            </View>

            <Animated.View
              entering={FadeInDown.duration(800).delay(600).springify().damping(18)}
              style={styles.divider}
            >
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text className="text-[13px] font-bold uppercase tracking-widest" style={{ color: colors.subtext }}>
                {t("auth.orContinueWith")}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(800).delay(700).springify().damping(18)}
              style={styles.socialRow}
            >
              <TouchableOpacity
                onPress={handleGoogleAuth}
                disabled={googleLoading}
                className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border"
                style={[googleLoading ? { opacity: 0.6 } : {}, { backgroundColor: colors.card, borderColor: colors.border }]}
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
            </Animated.View>

            <Animated.View
              entering={FadeInUp.duration(800).delay(800).springify().damping(18)}
              style={styles.footer}
            >
              <Text className="text-[15px] font-medium" style={{ color: colors.subtext }}>
                {t("auth.dontHaveAccount")}{" "}
              </Text>
              <Link href="/(auth)/sign-up">
                <Text className="text-[15px] font-bold" style={{ color: colors.primary }}>
                  {t("auth.signUp")}
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
  forgotPassword: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
    marginTop: 4,
  },
  divider: {
    marginTop: 40,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dividerLine: {
    height: 1,
    flex: 1,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignIn;
