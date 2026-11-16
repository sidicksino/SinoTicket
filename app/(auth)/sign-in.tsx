import AuthScreen, {
  AuthDivider,
  AuthError,
  AuthFooterLink,
} from "@/components/auth/AuthScreen";
import SocialButton from "@/components/auth/SocialButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { useTheme } from "@/context/ThemeContext";
import useSocialAuth from "@/hooks/useSocialAuth";
import { useClerk, useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

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
          setApiError(msg);
        }
      } else {
        setApiError(t("auth.loginFailedRetry"));
      }
    } catch (err: any) {
      console.error("Sign in error:", JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        t("auth.unexpectedError");
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
        setApiError(t("auth.verificationNotComplete"));
      }
    } catch (err: any) {
      console.error("Verify error:", JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        t("auth.unexpectedError");
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = router.canGoBack() ? () => router.back() : undefined;

  if (isMfaPending) {
    return (
      <AuthScreen
        title={t("authUi.mfaTitle")}
        subtitle={t("authUi.mfaSubtitle")}
        onBack={() => setIsMfaPending(false)}
      >
        <InputField
          placeholder={t("auth.enterVerificationCode")}
          icon="key-outline"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoFocus
          value={code}
          onChangeText={setCode}
        />
        <AuthError message={apiError} />
        <CustomButton
          title={t("auth.verify")}
          onPress={handleVerify}
          loading={isSubmitting}
          disabled={!code}
          className="mt-2"
        />
      </AuthScreen>
    );
  }

  const isLoading = fetchStatus === "fetching" || isSubmitting;

  return (
    <AuthScreen
      title={t("authUi.signInTitle")}
      subtitle={t("authUi.signInSubtitle")}
      onBack={goBack}
      footer={
        <AuthFooterLink
          prompt={t("auth.dontHaveAccount")}
          action={t("auth.signUp")}
          onPress={() => router.replace("/(auth)/sign-up")}
        />
      }
    >
      <InputField
        placeholder={t("authUi.emailOrPhone")}
        icon="mail-outline"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="email"
        returnKeyType="next"
        value={emailAddress}
        onChangeText={(val) => {
          setEmailAddress(val);
          setApiError("");
        }}
      />
      <InputField
        placeholder={t("auth.password")}
        icon="lock-closed-outline"
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        value={password}
        onChangeText={(val) => {
          setPassword(val);
          setApiError("");
        }}
      />

      <View style={{ alignItems: "flex-end", marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
          hitSlop={8}
          accessibilityRole="link"
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
            {t("auth.forgotPassword")}
          </Text>
        </TouchableOpacity>
      </View>

      <AuthError message={apiError} />
      <CustomButton
        title={t("auth.logIn")}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={!emailAddress || !password}
      />

      <AuthDivider />

      <SocialButton
        title={t("authUi.continueWithGoogle")}
        image={require("@/assets/icons/google-icon.png")}
        onPress={handleGoogleAuth}
        loading={googleLoading}
      />
    </AuthScreen>
  );
};

export default SignIn;
