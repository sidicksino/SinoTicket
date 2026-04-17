import SettingsRow from "@/components/SettingsRow";
import { useTheme } from "@/context/ThemeContext";
import { getCurrentLanguage, setAppLanguage } from "@/i18n";
import { AppLanguage } from "@/i18n/resources";
import { useAuthFetch, useFetch } from "@/lib/fetch";
import { User as UserType } from "@/types/type";
import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { colors, isDark, themePreference, setThemePreference } = useTheme();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { t } = useTranslation();
  const { authFetch } = useAuthFetch();

  // Fetch backend User data
  const { data, loading, refetch } = useFetch<{ success: boolean; user: UserType }>("/api/users/me", true);
  const backendUser = data?.user;

  // Refetch when screen comes into focus (e.g. after editing personal info)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleSignOut = () => {
    Alert.alert(t("profile.signOutTitle"), t("profile.signOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.signOutAction"), style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleLanguageChange = () => {
    const currentLanguage = getCurrentLanguage();

    const applyLanguage = async (language: AppLanguage) => {
      try {
        await setAppLanguage(language);
        await authFetch("/api/users/me", {
          method: "PUT",
          body: JSON.stringify({
            preferences: {
              language,
            },
          }),
        });
      } catch {
        Alert.alert(t("common.error"), t("profile.updateLanguageFailed"));
      }
    };

    Alert.alert(t("profile.language"), "", [
      {
        text: t("language.english"),
        onPress: () => applyLanguage("en"),
        style: currentLanguage === "en" ? "default" : undefined,
      },
      {
        text: t("language.french"),
        onPress: () => applyLanguage("fr"),
        style: currentLanguage === "fr" ? "default" : undefined,
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ fontFamily: "Syne_700Bold", fontSize: 28, color: colors.text }}>{t("profile.title")}</Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(root)/personal-info")}
            style={{
              backgroundColor: colors.card,
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                borderWidth: 2,
                borderColor: colors.primary,
                overflow: "hidden",
                marginRight: 16,
              }}
            >
              <Image
                source={{ uri: backendUser?.profile_photo || clerkUser?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 20, marginRight: 6 }}>
                  {backendUser?.name || clerkUser?.fullName || t("profile.guestUser")}
                </Text>
                {!loading && backendUser?.is_verified && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
              </View>
              <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500" }}>
                {clerkUser?.emailAddresses?.[0]?.emailAddress || backendUser?.email || t("profile.setUpAccount")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(root)/personal-info")}
              style={{ padding: 8, backgroundColor: colors.background, borderRadius: 12 }}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {(clerkUser?.publicMetadata?.role === "Admin" || clerkUser?.publicMetadata?.role === "admin") && (
            <>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginLeft: 16,
                  marginBottom: 8,
                }}
              >
                {t("profile.administration")}
              </Text>
              <View
                style={{
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                  marginBottom: 28,
                }}
              >
                <SettingsRow
                  icon="barcode-outline"
                  title={t("profile.ticketScanner")}
                  subtitle={t("profile.verifyIncomingAttendees")}
                  isFirst
                  isLast
                  onPress={() => router.push("/(root)/scanner")}
                />
              </View>
            </>
          )}

          <Text
            style={{
              color: colors.subtext,
              fontSize: 13,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginLeft: 16,
              marginBottom: 8,
            }}
          >
            {t("profile.account")}
          </Text>
          <View
            style={{
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
              marginBottom: 28,
            }}
          >
            <SettingsRow
              icon="person-outline"
              title={t("profile.personalInformation")}
              subtitle={backendUser?.phone_number || t("profile.addPhoneNumber")}
              isFirst
              onPress={() => router.push("/(root)/personal-info")}
            />
            <SettingsRow icon="card-outline" title={t("profile.paymentMethods")} subtitle={t("profile.visaEnding")} onPress={() => { }} />
            <SettingsRow icon="notifications-outline" title={t("profile.notifications")} isLast onPress={() => { }} />
          </View>

          <Text
            style={{
              color: colors.subtext,
              fontSize: 13,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginLeft: 16,
              marginBottom: 8,
            }}
          >
            {t("profile.preferences")}
          </Text>
          <View
            style={{
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
              marginBottom: 28,
            }}
          >
            <SettingsRow
              icon={themePreference === "system" ? "phone-portrait-outline" : isDark ? "moon-outline" : "sunny-outline"}
              title={t("profile.appearance")}
              isFirst
              rightElement={
                <View style={{ flexDirection: "row", backgroundColor: colors.inputBg, borderRadius: 8, padding: 2 }}>
                  {(["light", "system", "dark"] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setThemePreference(mode)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: themePreference === mode ? colors.card : "transparent",
                        shadowColor: themePreference === mode ? colors.shadow : "transparent",
                        shadowOpacity: themePreference === mode ? 0.05 : 0,
                        shadowRadius: 2,
                        elevation: themePreference === mode ? 2 : 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: themePreference === mode ? "700" : "500",
                          color: themePreference === mode ? colors.text : colors.subtext,
                          textTransform: "capitalize",
                        }}
                      >
                        {mode === "system" ? t("profile.auto") : mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              }
            />
            <SettingsRow
              icon="globe-outline"
              title={t("profile.language")}
              subtitle={getCurrentLanguage() === "fr" ? t("language.french") : t("language.english")}
              isLast
              onPress={handleLanguageChange}
            />
          </View>

          <Text
            style={{
              color: colors.subtext,
              fontSize: 13,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginLeft: 16,
              marginBottom: 8,
            }}
          >
            {t("profile.about")}
          </Text>
          <View
            style={{
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
              marginBottom: 36,
            }}
          >
            <SettingsRow icon="help-buoy-outline" title={t("profile.helpCenter")} isFirst onPress={() => { }} />
            <SettingsRow icon="shield-checkmark-outline" title={t("profile.privacyPolicy")} onPress={() => { }} />
            <SettingsRow icon="document-text-outline" title={t("profile.termsOfService")} isLast onPress={() => { }} />
          </View>

          <View
            style={{
              shadowColor: colors.error,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <SettingsRow
              icon="log-out-outline"
              title={t("profile.logOut")}
              isDestructive
              isFirst
              isLast
              onPress={handleSignOut}
            />
          </View>
          <Text style={{ textAlign: "center", color: colors.subtext, fontSize: 12, marginTop: 24, opacity: 0.5 }}>
            SinoTicket v1.0.0
          </Text>
          
          {/* Debug: Test Error Boundary */}
          <TouchableOpacity 
            onPress={() => {
              throw new Error("Manual Test Error: This is a test of the ErrorBoundary system!");
            }}
            style={{ marginTop: 12, padding: 8, alignSelf: 'center' }}
          >
            <Text style={{ color: colors.error, fontSize: 10, opacity: 0.3, textDecorationLine: 'underline' }}>
              Test Error Boundary
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
