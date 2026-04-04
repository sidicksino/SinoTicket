import SettingsRow from "@/components/SettingsRow";
import { useTheme } from "@/context/ThemeContext";
import { useFetch } from "@/lib/fetch";
import { User as UserType } from "@/types/type";
import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

export default function Profile() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user: clerkUser, user } = useUser();
  const { signOut } = useClerk();

  // Fetch backend User data
  const { data, loading, refetch } = useFetch<{ success: boolean; user: UserType }>("/api/users/me", true);
  const backendUser = data?.user;

  // Refetch when screen comes into focus (e.g. after editing personal info)
  useFocusEffect(
    useCallback(() => {
      refetch();
      user?.reload(); // Also reload Clerk user to pick up name/avatar changes
    }, [refetch, user])
  );

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of SinoTicket?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: () => signOut() },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── HEADER TITLE ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ fontFamily: "Syne_700Bold", fontSize: 28, color: colors.text }}>Profile</Text>
        </View>

        {/* ── PREMIUM USER CARD ── */}
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
                  {loading ? "..." : (clerkUser?.fullName || backendUser?.name || "Guest User")}
                </Text>
                {!loading && backendUser?.is_verified && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
              </View>
              <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500" }}>
                {loading
                  ? "Syncing profile..."
                  : (clerkUser?.emailAddresses?.[0]?.emailAddress || backendUser?.email || "Set up your account")}
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

        {/* ── SETTINGS GROUPS ── */}
        <View style={{ paddingHorizontal: 20 }}>

          {/* Account Group */}
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginLeft: 16, marginBottom: 8 }}>
            Account
          </Text>
          <View style={{ shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 28 }}>
            <SettingsRow
              icon="person-outline"
              title="Personal Information"
              subtitle={loading ? "Loading..." : backendUser?.phone_number || "Add phone number"}
              isFirst
              onPress={() => router.push("/(root)/personal-info")}
            />
            <SettingsRow icon="card-outline" title="Payment Methods" subtitle="Visa ending in 4242" onPress={() => { }} />
            <SettingsRow icon="notifications-outline" title="Notifications" isLast onPress={() => { }} />
          </View>

          {/* Preferences Group */}
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginLeft: 16, marginBottom: 8 }}>
            Preferences
          </Text>
          <View style={{ shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 28 }}>
            <SettingsRow
              icon={isDark ? "moon-outline" : "sunny-outline"}
              title="Dark Mode"
              isFirst
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingsRow
              icon="globe-outline"
              title="Language"
              subtitle={backendUser?.preferences?.language || "English (US)"}
              isLast
              onPress={() => { }}
            />
          </View>

          {/* About Group */}
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginLeft: 16, marginBottom: 8 }}>
            About
          </Text>
          <View style={{ shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 36 }}>
            <SettingsRow icon="help-buoy-outline" title="Help Center" isFirst onPress={() => { }} />
            <SettingsRow icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => { }} />
            <SettingsRow icon="document-text-outline" title="Terms of Service" isLast onPress={() => { }} />
          </View>

          {/* ── SIGN OUT BUTTON ── */}
          <View style={{ shadowColor: colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }}>
            <SettingsRow
              icon="log-out-outline"
              title="Log Out"
              isDestructive
              isFirst
              isLast
              onPress={handleSignOut}
            />
          </View>
          <Text style={{ textAlign: "center", color: colors.subtext, fontSize: 12, marginTop: 24, opacity: 0.5 }}>
            SinoTicket v1.0.0
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
