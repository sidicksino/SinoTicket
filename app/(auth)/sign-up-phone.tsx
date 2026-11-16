import AuthScreen, {
  AuthDivider,
  AuthFooterLink,
} from "@/components/auth/AuthScreen";
import SocialButton from "@/components/auth/SocialButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import useSocialAuth from "@/hooks/useSocialAuth";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

/**
 * Phone-number sign-up. The form is in place, but phone sign-up is not
 * enabled in Clerk yet, so submitting explains that and points to email/Google.
 */
const SignUpPhone = () => {
  const { t } = useTranslation();
  const { handleGoogleAuth, loading: googleLoading } = useSocialAuth();
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = () => {
    Alert.alert(t("authUi.phoneComingSoonTitle"), t("authUi.phoneComingSoon"));
  };

  return (
    <AuthScreen
      title={t("authUi.signUpTitle")}
      subtitle={t("authUi.signUpPhoneSubtitle")}
      onBack={() => router.back()}
      footer={
        <AuthFooterLink
          prompt={t("signUpPhone.alreadyHaveAccount")}
          action={t("signUpPhone.logIn")}
          onPress={() => router.replace("/(auth)/sign-in")}
        />
      }
    >
      <InputField
        placeholder={t("signUpPhone.fullName")}
        icon="person-outline"
        autoCapitalize="words"
        textContentType="name"
        value={fullName}
        onChangeText={setFullName}
      />
      <InputField
        placeholder={t("signUpPhone.phoneNumber")}
        icon="call-outline"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        value={phone}
        onChangeText={setPhone}
      />
      <InputField
        placeholder={t("signUpPhone.password")}
        icon="lock-closed-outline"
        secureTextEntry
        textContentType="newPassword"
        hint={t("authUi.passwordHint")}
        value={password}
        onChangeText={setPassword}
      />

      <CustomButton
        title={t("signUpPhone.signUp")}
        onPress={handleSubmit}
        disabled={!fullName || !phone || !password}
        className="mt-3"
      />

      <AuthDivider />

      <SocialButton
        title={t("authUi.continueWithGoogle")}
        image={require("@/assets/icons/google-icon.png")}
        onPress={handleGoogleAuth}
        loading={googleLoading}
      />
      <SocialButton
        title={t("authUi.continueWithEmail")}
        icon="mail-outline"
        onPress={() => router.replace("/(auth)/sign-up")}
      />
    </AuthScreen>
  );
};

export default SignUpPhone;
