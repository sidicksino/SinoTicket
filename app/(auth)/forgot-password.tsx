import AuthScreen, { AuthError, AuthFooterLink } from "@/components/auth/AuthScreen";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { useClerk } from "@clerk/expo";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

const ForgotPassword = () => {
  const { client, setActive } = useClerk();
  const signIn = client.signIn;
  const { t } = useTranslation();
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleReset = async () => {
    if (!signIn || isSubmitting || !email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(t("forgotPassword.validEmail"));
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setIsSuccess(true);
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        t("forgotPassword.sendResetFailed");
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signIn || isSubmitting || !code.trim() || !newPassword.trim()) return;

    if (newPassword.length < 8) {
      setError(t("forgotPassword.passwordMinLength"));
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert(t("common.success"), t("forgotPassword.resetSuccess"));
        router.replace("/(auth)/sign-in");
      } else {
        setError(t("forgotPassword.resetIncomplete"));
      }
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        t("forgotPassword.invalidReset");
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreen
      title={isSuccess ? t("authUi.resetTitle") : t("authUi.forgotTitle")}
      subtitle={
        isSuccess
          ? t("forgotPassword.codeSent", { email })
          : t("forgotPassword.intro")
      }
      onBack={() => (isSuccess ? setIsSuccess(false) : router.back())}
      footer={
        <AuthFooterLink
          prompt={t("forgotPassword.rememberPassword")}
          action={t("auth.logIn")}
          onPress={() => router.replace("/(auth)/sign-in")}
        />
      }
    >
      {!isSuccess ? (
        <InputField
          placeholder={t("forgotPassword.emailAddress")}
          icon="mail-outline"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="send"
          onSubmitEditing={handleReset}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            setError("");
          }}
        />
      ) : (
        <>
          <InputField
            placeholder={t("forgotPassword.enterCode")}
            icon="key-outline"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChangeText={(val) => {
              setCode(val);
              setError("");
            }}
          />
          <InputField
            placeholder={t("forgotPassword.newPassword")}
            icon="lock-closed-outline"
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            hint={t("authUi.passwordHint")}
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              setError("");
            }}
          />
        </>
      )}

      <AuthError message={error} />

      {!isSuccess ? (
        <CustomButton
          title={t("forgotPassword.sendResetCode")}
          onPress={handleReset}
          loading={isSubmitting}
          disabled={!email.trim()}
          className="mt-2"
        />
      ) : (
        <CustomButton
          title={t("forgotPassword.resetPassword")}
          onPress={handleVerify}
          loading={isSubmitting}
          disabled={!code.trim() || !newPassword.trim()}
          className="mt-2"
        />
      )}
    </AuthScreen>
  );
};

export default ForgotPassword;
