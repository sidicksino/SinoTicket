import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenProps = {
  title: string;
  subtitle?: React.ReactNode;
  /** Shows a back arrow in the top-left corner. */
  onBack?: () => void;
  /** Pinned to the bottom of the screen (e.g. "Already have an account? Log in"). */
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shared layout for every sign-in / sign-up screen: one keyboard handler,
 * a compact header, the form, and a footer that sits at the bottom of the
 * screen. The whole screen fades in once, quickly, instead of animating
 * each field separately.
 */
export default function AuthScreen({
  title,
  subtitle,
  onBack,
  footer,
  children,
}: AuthScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: onBack ? 8 : 32,
            paddingBottom: 16,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel={t("authUi.back")}
                hitSlop={8}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  marginLeft: -8,
                }}
              >
                <Ionicons name="chevron-back" size={26} color={colors.text} />
              </TouchableOpacity>
            ) : null}

            <View style={{ marginBottom: 28 }}>
              <Text
                accessibilityRole="header"
                style={{
                  fontFamily: "Syne_700Bold",
                  fontSize: 28,
                  lineHeight: 34,
                  color: colors.text,
                }}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 15,
                    lineHeight: 22,
                    color: colors.subtext,
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {children}

            {footer ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  paddingTop: 24,
                }}
              >
                {footer}
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** "Don't have an account? Sign up" style footer line. */
export function AuthFooterLink({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Text style={{ fontSize: 15, color: colors.subtext }}>{prompt} </Text>
      <TouchableOpacity onPress={onPress} hitSlop={8} accessibilityRole="link">
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.primary }}>
          {action}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/** Thin line with a centered "or". */
export function AuthDivider() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginVertical: 20,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text style={{ fontSize: 13, color: colors.subtext }}>
        {t("authUi.or")}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}

/** Inline error message under a form. */
export function AuthError({ message }: { message?: string }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <Text
      accessibilityLiveRegion="polite"
      style={{
        color: colors.error,
        fontSize: 14,
        marginBottom: 12,
        textAlign: "center",
      }}
    >
      {message}
    </Text>
  );
}
