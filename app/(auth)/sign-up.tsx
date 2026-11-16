import AuthScreen, {
  AuthDivider,
  AuthError,
  AuthFooterLink,
} from "@/components/auth/AuthScreen";
import SocialButton from "@/components/auth/SocialButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import LoadingScreen from "@/components/LoadingScreen";
import { useTheme } from "@/context/ThemeContext";
import useSocialAuth from "@/hooks/useSocialAuth";
import { api, convex } from "@/lib/convex";
import { useAuth, useClerk, useSignUp } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";

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
  const [code, setCode] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [showLoginInstead, setShowLoginInstead] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return t("signUp.validation.fullNameRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))
      return t("signUp.validation.invalidEmail");
    if (password.length < 8) return t("signUp.validation.passwordMinLength");
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
      //  0️⃣ Check if this email already has an account
      const dbCheck = await convex.query(api.users.checkExists, {
        email: emailAddress,
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
      } else if (err?.errors?.[0]?.code === CLERK_ERRORS.EMAIL_EXISTS) {
        // Fallback for race conditions if the email was created in Clerk but not our DB yet
        setApiError(t("signUp.validation.emailAlreadyRegistered"));
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
      const { error } = await (signUp as any).verifications.verifyEmailCode({
        code,
      });

      if (error) {
        setApiError(
          (error as any)?.errors?.[0]?.longMessage ||
            (error as any)?.errors?.[0]?.message ||
            t("signUp.validation.invalidVerificationCode"),
        );
        setShowLoginInstead(false);
        return;
      }

      if ((signUp as any).status === "complete") {
        // The user row is created by <UserSync /> once the session is active.
        await setActive({ session: (signUp as any).createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        setApiError(
          `${t("auth.verificationNotComplete")} ` +
            ((signUp as any).missingFields?.join(", ") || "unknown fields"),
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

  const goBack = router.canGoBack() ? () => router.back() : undefined;

  // ─── Step 2: Enter the emailed code ──────────────────────────────────────
  if (pendingVerification) {
    return (
      <AuthScreen
        title={t("authUi.verifyTitle")}
        subtitle={
          <>
            {t("signUp.codeSent")}{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {emailAddress}
            </Text>
          </>
        }
        onBack={() => {
          setPendingVerification(false);
          setCode("");
          setApiError("");
        }}
      >
        <InputField
          placeholder={t("signUp.enterCode")}
          icon="key-outline"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          value={code}
          onChangeText={(val) => {
            setCode(val);
            setApiError("");
          }}
        />
        <AuthError message={apiError} />
        <CustomButton
          title={t("signUp.verifyEmail")}
          onPress={handleVerify}
          loading={isSubmitting}
          disabled={!code}
          className="mt-2"
        />
      </AuthScreen>
    );
  }

  const canSubmit = !!fullName && !!emailAddress && !!password;

  const clearError = () => {
    setApiError("");
    setShowLoginInstead(false);
  };

  // ─── Step 1: Account details ─────────────────────────────────────────────
  return (
    <AuthScreen
      title={t("authUi.signUpTitle")}
      subtitle={t("authUi.signUpSubtitle")}
      onBack={goBack}
      footer={
        <AuthFooterLink
          prompt={t("signUp.alreadyHaveAccount")}
          action={t("auth.logIn")}
          onPress={() => router.replace("/(auth)/sign-in")}
        />
      }
    >
      <InputField
        placeholder={t("signUp.fullName")}
        icon="person-outline"
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
        returnKeyType="next"
        value={fullName}
        onChangeText={(val) => {
          setFullName(val);
          clearError();
        }}
      />
      <InputField
        placeholder={t("signUp.emailAddress")}
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
        value={emailAddress}
        onChangeText={(val) => {
          setEmailAddress(val);
          clearError();
        }}
      />
      <InputField
        placeholder={t("signUp.password")}
        icon="lock-closed-outline"
        secureTextEntry
        textContentType="newPassword"
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        hint={t("authUi.passwordHint")}
        value={password}
        onChangeText={(val) => {
          setPassword(val);
          clearError();
        }}
      />

      <AuthError message={apiError} />
      {showLoginInstead ? (
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/sign-in")}
          style={{ alignSelf: "center", marginBottom: 12 }}
          hitSlop={8}
        >
          <Text style={{ fontWeight: "700", color: colors.primary }}>
            {t("signUp.logInInstead")}
          </Text>
        </TouchableOpacity>
      ) : null}

      <CustomButton
        title={t("signUp.signUp")}
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!canSubmit}
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
        title={t("authUi.continueWithPhone")}
        icon="call-outline"
        onPress={() => router.push("/(auth)/sign-up-phone")}
      />
    </AuthScreen>
  );
};

export default SignUp;
