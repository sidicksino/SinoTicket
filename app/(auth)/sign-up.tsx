import InputField from "@/components/InputField";
import LoadingScreen from "@/components/LoadingScreen";
import { useTheme } from "@/context/ThemeContext";
import useSocialAuth from "@/hooks/useSocialAuth";
import { fetchAPI } from "@/lib/fetch";
import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.View;

const CLERK_ERRORS = {
  EMAIL_EXISTS: "form_identifier_exists",
  INVALID_EMAIL: "form_param_format_invalid",
  WEAK_PASSWORD: "form_password_pwned",
} as const;

const SignUp = () => {
  const { t } = useTranslation();
  const { signUp } = useSignUp();
  const { isLoaded: authLoaded } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const { handleGoogleAuth, loading: googleLoading } = useSocialAuth();
  const { colors } = useTheme();

  const [fullName, setFullName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [showLoginInstead, setShowLoginInstead] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return t("signUp.validation.fullNameRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))
      return t("signUp.validation.invalidEmail");
    if (password.length < 8)
      return t("signUp.validation.passwordMinLength");
    if (password !== confirmPassword)
      return t("signUp.validation.passwordsDoNotMatch");
    return null;
  };

  const resolveClerkError = (err: any): string => {
    const code = err?.errors?.[0]?.code ?? "";
    switch (code) {
      case CLERK_ERRORS.EMAIL_EXISTS:
        return t("signUp.validation.emailAlreadyRegistered");
      case CLERK_ERRORS.INVALID_EMAIL:
        return t("signUp.validation.invalidEmail");
      case CLERK_ERRORS.WEAK_PASSWORD:
        return t("signUp.validation.weakPassword");
      default:
        return (
          err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          t("signUp.validation.genericError")
        );
    }
  };

  // ─── Step 1: Create account + send OTP ───────────────────────────────────
  const handleSubmit = async () => {
    if (!signUp || isSubmitting) return;

    setApiError("");
    setShowLoginInstead(false);

    const validationError = validate();
    if (validationError) {
      setApiError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      //  0️⃣ Check if user exists in Neon DB first
      const dbCheck = await fetchAPI("/api/users/check", {
        method: "POST",
        body: JSON.stringify({ email: emailAddress }),
      });

      if (dbCheck?.exists) {
        throw new Error("EMAIL_EXISTS_IN_DB");
      }

      const names = fullName.trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.length > 1 ? names.slice(1).join(" ") : "";

      // 1️⃣ Create account
      await (signUp as any).create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // 2️⃣ Send OTP
      await (signUp as any).verifications.sendEmailCode();
      setPendingVerification(true);

    } catch (err: any) {
      if (err.message === "EMAIL_EXISTS_IN_DB") {
        setApiError(t("signUp.validation.emailAlreadyRegistered"));
        setShowLoginInstead(true);
        Alert.alert(
          t("signUp.accountAlreadyExistsTitle"),
          t("signUp.accountAlreadyExistsMessage"),
          [
            { text: t("common.cancel"), style: "cancel" },
            { text: t("auth.logIn"), onPress: () => router.replace("/(auth)/sign-in") },
          ]
        );
      } else if (err?.errors?.[0]?.code === CLERK_ERRORS.EMAIL_EXISTS) {
        // Fallback for race conditions if the email was created in Clerk but not our DB yet
        setApiError(t("signUp.validation.emailAlreadyRegisteredClerk"));
        setShowLoginInstead(true);
      } else {
        setApiError(resolveClerkError(err));
        setShowLoginInstead(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp || isSubmitting) return;

    if (!code.trim()) {
      setApiError(t("signUp.validation.verificationCodeRequired"));
      setShowLoginInstead(false);
      return;
    }

    setApiError("");
    setShowLoginInstead(false);
    setIsSubmitting(true);

    try {
      // 3️⃣ Verify OTP
      const { error } = await (signUp as any).verifications.verifyEmailCode({ code });

      if (error) {
        setApiError(
          (error as any)?.errors?.[0]?.longMessage ||
          (error as any)?.errors?.[0]?.message ||
          t("signUp.validation.invalidVerificationCode")
        );
        setShowLoginInstead(false);
        return;
      }

      if ((signUp as any).status === "complete") {
        try {
          // Save user to our backend
          await fetchAPI("/api/users", {
            method: "POST",
            body: JSON.stringify({
              name: fullName,
              email: emailAddress,
              clerkId: (signUp as any).createdUserId,
            }),
          });
        } catch (backendErr) {
          console.error("Failed to sync user with Neon DB", backendErr);
          // Optional: handle syncing failure, though account is already created in Clerk
        }

        await setActive({ session: (signUp as any).createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        setApiError(
          `${t("auth.verificationNotComplete")} ` +
          ((signUp as any).missingFields?.join(", ") || "unknown fields")
        );
        setShowLoginInstead(false);
      }
    } catch (err: any) {
      setApiError(resolveClerkError(err));
      setShowLoginInstead(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authLoaded) return <LoadingScreen />;

  if ((signUp as any)?.status === "complete") {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  // ─── OTP Screen ───────────────────────────────────────────────────────────
  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 px-8 pt-16">
          <View className="mb-8">
            <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px]" style={{ backgroundColor: colors.primaryLight }}>
              <Ionicons name="mail-unread-outline" size={28} color={colors.primary} />
            </View>
            <Text className="font-syne text-[32px] font-black leading-tight" style={{ color: colors.text }}>
              {t("signUp.checkYour")}
            </Text>
            <Text className="font-syne text-[32px] font-black leading-tight mb-3" style={{ color: colors.primary }}>
              {t("signUp.email")}
            </Text>
            <Text className="text-[15px] font-medium" style={{ color: colors.subtext }}>
              {t("signUp.codeSent")} {" "}
              <Text className="font-bold" style={{ color: colors.text }}>{emailAddress}</Text>
            </Text>
          </View>

          <InputField
            label={t("auth.verificationCode")}
            placeholder={t("signUp.enterCode")}
            icon="key-outline"
            keyboardType="numeric"
            value={code}
            onChangeText={(val) => {
              setCode(val);
              setApiError("");
              setShowLoginInstead(false);
            }}
          />

          {apiError ? (
            <Text className="font-medium mt-2 mb-2 text-center" style={{ color: colors.error }}>
              {apiError}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={isSubmitting || !code}
            className="w-full h-[60px] rounded-full flex items-center justify-center shadow-lg active:opacity-80 mt-6"
            style={[isSubmitting || !code ? { opacity: 0.6 } : {}, { backgroundColor: colors.primary, shadowColor: colors.primaryLight }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="font-syne font-bold text-[18px]" style={{ color: colors.white }}>
                {t("signUp.verifyEmail")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPendingVerification(false)}
            className="mt-4 items-center"
          >
            <Text className="text-[14px] font-medium" style={{ color: colors.subtext }}>
              {"<- "}{t("signUp.changeEmail")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit =
    !!fullName && !!emailAddress && !!password && !!confirmPassword && !isSubmitting;

  // ─── Sign Up Screen ───────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
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
                <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px]" style={{ backgroundColor: colors.primaryLight }}>
                  <Ionicons name="sparkles" size={28} color={colors.primary} />
                </View>
                <Text className="font-syne text-[42px] font-black leading-tight" style={{ color: colors.text }}>
                  {t("signUp.create")}
                </Text>
                <Text className="font-syne text-[42px] font-black leading-tight mb-4" style={{ color: colors.primary }}>
                  {t("signUp.account")}
                </Text>
                <Text className="text-[16px] font-medium leading-relaxed" style={{ color: colors.subtext }}>
                  {t("signUp.subtitle")}
                </Text>
              </View>
            </AnimatedView>

            {/* FORM */}
            <View className="w-full mt-2">
              <AnimatedView
                entering={FadeInDown.duration(800).delay(200).springify().damping(18)}
              >
                <InputField
                  label={t("signUp.fullName")}
                  placeholder={t("signUp.enterName")}
                  icon="person-outline"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={(val) => { setFullName(val); setApiError(""); setShowLoginInstead(false); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(300).springify().damping(18)}
              >
                <InputField
                  label={t("signUp.emailAddress")}
                  placeholder={t("signUp.enterEmail")}
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailAddress}
                  onChangeText={(val) => { setEmailAddress(val); setApiError(""); setShowLoginInstead(false); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(400).springify().damping(18)}
              >
                <InputField
                  label={t("signUp.password")}
                  placeholder={t("signUp.enterPassword")}
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={(val) => { setPassword(val); setApiError(""); setShowLoginInstead(false); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(450).springify().damping(18)}
              >
                <InputField
                  label={t("signUp.confirmPassword")}
                  placeholder={t("signUp.confirmYourPassword")}
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={(val) => { setConfirmPassword(val); setApiError(""); setShowLoginInstead(false); }}
                />
              </AnimatedView>

              <AnimatedView
                entering={FadeInDown.duration(800).delay(500).springify().damping(18)}
                style={{ marginTop: 24 }}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full h-[60px] rounded-full flex items-center justify-center shadow-lg active:opacity-80"
                  style={[!canSubmit ? { opacity: 0.6 } : {}, { backgroundColor: colors.primary, shadowColor: colors.primaryLight }]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text className="font-syne font-bold text-[18px]" style={{ color: colors.white }}>
                      {t("signUp.signUp")}
                    </Text>
                  )}
                </TouchableOpacity>

                {apiError ? (
                  <View className="mt-4 px-4 py-3 rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.error }}>
                    <Text className="font-medium text-[13px] text-center" style={{ color: colors.error }}>
                      {apiError}
                    </Text>
                    {showLoginInstead && (
                      <TouchableOpacity
                        onPress={() => router.push("/(auth)/sign-in")}
                        className="mt-2 items-center"
                      >
                        <Text className="font-bold text-[13px]" style={{ color: colors.primary }}>
                          {t("signUp.logInInstead")}{" ->"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
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
                <View className="h-[1px] flex-1" style={{ backgroundColor: colors.border }} />
                <Text className="text-[13px] font-bold uppercase tracking-widest" style={{ color: colors.subtext }}>
                  {t("auth.orContinueWith")}
                </Text>
                <View className="h-[1px] flex-1" style={{ backgroundColor: colors.border }} />
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
                <TouchableOpacity
                  onPress={handleGoogleAuth}
                  disabled={googleLoading}
                  className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border active:opacity-80"
                  style={[googleLoading ? { opacity: 0.6 } : {}, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {googleLoading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Image
                      source={require("@/assets/icons/google-icon.png")}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/sign-up-phone")}
                  className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border active:opacity-80"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
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
                <Text className="text-[15px] font-medium" style={{ color: colors.subtext }}>
                  {t("signUp.alreadyHaveAccount")} {" "}
                </Text>
                <Link href="/(auth)/sign-in">
                  <Text className="text-[15px] font-bold" style={{ color: colors.primary }}>
                    {t("auth.logIn")}
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