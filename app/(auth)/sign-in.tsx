import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn, useAuth, useClerk } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const { isLoaded } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [apiError, setApiError] = React.useState("");

  const handleSubmit = async () => {
    if (!isLoaded || !signIn) return;
    setApiError("");

    if (!emailAddress) {
      const msg = "Email or phone number is required.";
      setApiError(msg);
      Alert.alert("Error", msg);
      return;
    }
    
    if (emailAddress.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        const msg = "Please enter a valid email address.";
        setApiError(msg);
        Alert.alert("Error", msg);
        return;
      }
    }

    try {
      const { error } = await signIn.create({
        identifier: emailAddress,
        // @ts-ignore
        password,
      });

      if (error) {
        const msg = (error as any).errors?.[0]?.longMessage || (error as any).errors?.[0]?.message || "Log in failed.";
        Alert.alert("Error", msg);
        setApiError(msg);
        return;
      }

      if ((signIn as any).status === 'complete') {
        if ((signIn as any).createdSessionId) {
          await setActive({ session: (signIn as any).createdSessionId });
        }
        router.replace('/(root)/(tabs)/home');
      } else if ((signIn as any).status === 'needs_client_trust') {
        const emailCodeFactor = (signIn as any).supportedSecondFactors?.find(
          (factor: any) => factor.strategy === 'email_code',
        );
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
        }
      } else {
        Alert.alert("Error", "Log in failed. Please try again.");
        setApiError("Log in failed.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const msg = err.errors?.[0]?.longMessage || err.message || "An error occurred.";
      Alert.alert("Error", msg);
      setApiError(msg);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signIn) return;
    setApiError("");
    try {
      // @ts-ignore
      await signIn.mfa.verifyEmailCode({ code });

      if ((signIn as any).status === 'complete') {
        if ((signIn as any).createdSessionId) {
          await setActive({ session: (signIn as any).createdSessionId });
        }
        router.replace('/(root)/(tabs)/home');
      } else {
        Alert.alert("Error", "Verification attempt not complete.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const msg = err.errors?.[0]?.longMessage || err.message || "An error occurred.";
      Alert.alert("Error", msg);
      setApiError(msg);
    }
  };

  if (signIn?.status === 'needs_client_trust') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-8 pt-16">
          <Text className="font-syne text-[32px] font-black text-[#0F172A] mb-4">Verify Account</Text>
          <InputField
            label="Verification Code"
            placeholder="Enter your verification code"
            icon="key-outline"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          {errors?.fields?.code && <Text className="text-red-500 mb-2">{errors.fields.code.message}</Text>}
          {apiError ? <Text className="text-red-500 font-medium mb-4 text-center">{apiError}</Text> : null}
          <TouchableOpacity 
            onPress={handleVerify}
            disabled={fetchStatus === 'fetching'}
            className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 mt-4 active:opacity-80"
          >
            <Text className="text-white font-syne font-bold text-[18px]">Verify</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <View className="flex-1 px-8 pt-8">
            {/* HEADER SECTION */}
            <Animated.View
              entering={FadeInDown.duration(800).delay(100).springify().damping(18)}
            >
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-[20px] bg-[#0286FF]/10">
                <Ionicons name="log-in-outline" size={32} color="#0286FF" />
              </View>
              <Text className="font-syne text-[42px] font-black text-[#0F172A] leading-tight">
                Welcome
              </Text>
              <Text className="font-syne text-[42px] font-black text-[#0286FF] leading-tight mb-4">
                Back.
              </Text>
              <Text className="mb-8 text-[16px] font-medium text-[#64748B] leading-relaxed">
                Log in to SinoTicket to manage your tickets and discover fantastic events.
              </Text>
            </Animated.View>

            {/* FORM SECTION */}
            <View className="w-full mt-2">
              <Animated.View
                entering={FadeInDown.duration(800).delay(200).springify().damping(18)}
              >
                <InputField
                  label="Email or Phone Number"
                  placeholder="Enter email or phone"
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
                  label="Password"
                  placeholder="Enter your password"
                  icon="lock-closed-outline"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </Animated.View>

              {/* FORGOT PASSWORD — style prop instead of className so the
                  view has a real height and the Link is tappable */}
              <Animated.View
                entering={FadeInDown.duration(800).delay(400).springify().damping(18)}
                style={styles.forgotPassword}
              >
                <Link href="/(auth)/forgot-password">
                  <Text className="text-[14px] font-bold text-[#0286FF]">
                    Forgot Password?
                  </Text>
                </Link>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(800).delay(500).springify().damping(18)}
              >
                <TouchableOpacity 
                  onPress={handleSubmit}
                  disabled={!emailAddress || !password || fetchStatus === 'fetching'}
                  className="w-full h-[60px] bg-[#0286FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0286FF]/40 active:opacity-80"
                  style={(!emailAddress || !password || fetchStatus === 'fetching') ? { opacity: 0.5 } : {}}
                >
                  <Text className="text-white font-syne font-bold text-[18px]">
                    Log In
                  </Text>
                </TouchableOpacity>
                {apiError ? (
                  <Text className="text-red-500 font-medium text-[14px] mt-4 text-center">
                    {apiError}
                  </Text>
                ) : null}
              </Animated.View>
            </View>

            {/* DIVIDER */}
            <Animated.View
              entering={FadeInDown.duration(800).delay(600).springify().damping(18)}
              style={styles.divider}
            >
              <View style={styles.dividerLine} />
              <Text className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">
                Or continue with
              </Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* SOCIAL LOGIN */}
            <Animated.View
              entering={FadeInDown.duration(800).delay(700).springify().damping(18)}
              style={styles.socialRow}
            >
              <TouchableOpacity className="flex-1 h-[56px] flex-row items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] active:bg-[#F1F5F9]">
                <Image
                  source={require("@/assets/icons/google-icon.png")}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* FOOTER */}
            <Animated.View
              entering={FadeInUp.duration(800).delay(800).springify().damping(18)}
              style={styles.footer}
            >
              <Text className="text-[15px] font-medium text-[#64748B]">
                Don&apos;t have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-up">
                <Text className="text-[15px] font-bold text-[#0286FF]">
                  Sign Up
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
    backgroundColor: "#E2E8F0",
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