import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalInfo() {
  const { colors } = useTheme();
  const { user: clerkUser } = useUser();
  const { authFetch } = useAuthFetch();

  const [name, setName] = useState(clerkUser?.fullName || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load current backend data on mount
  React.useEffect(() => {
    (async () => {
      try {
        const result = await authFetch("/api/users/me");
        if (result?.user) {
          setName(result.user.name || clerkUser?.fullName || "");
          setPhone(result.user.phone_number || "");
        }
      } catch {
        // silent — fields will use Clerk defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await authFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() }),
      });
      Alert.alert("Success", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* ── HEADER ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + "40",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "Syne_700Bold",
              fontSize: 18,
              color: colors.text,
              marginRight: 40, // offset for the back button
            }}
          >
            Personal Information
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        >
          {!loaded ? (
            <View style={{ paddingTop: 60, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.subtext, marginTop: 12, fontSize: 14 }}>
                Loading your profile…
              </Text>
            </View>
          ) : (
            <>
              {/* ── AVATAR ── */}
              <View style={{ alignItems: "center", marginBottom: 32 }}>
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 3,
                    borderColor: colors.primary,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: clerkUser?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </View>
                <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 8 }}>
                  Photo managed by your sign-in provider
                </Text>
              </View>

              {/* ── NAME FIELD ── */}
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Syne_700Bold",
                  color: colors.text,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Full Name
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border + "80",
                  paddingHorizontal: 16,
                  height: 56,
                  marginBottom: 20,
                }}
              >
                <Ionicons name="person-outline" size={20} color={colors.subtext} style={{ marginRight: 12 }} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.subtext}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: "500",
                  }}
                />
              </View>

              {/* ── EMAIL FIELD (read-only) ── */}
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Syne_700Bold",
                  color: colors.text,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border + "40",
                  paddingHorizontal: 16,
                  height: 56,
                  marginBottom: 6,
                  opacity: 0.6,
                }}
              >
                <Ionicons name="mail-outline" size={20} color={colors.subtext} style={{ marginRight: 12 }} />
                <Text style={{ flex: 1, fontSize: 16, color: colors.subtext, fontWeight: "500" }}>
                  {clerkUser?.emailAddresses?.[0]?.emailAddress || "—"}
                </Text>
                <Ionicons name="lock-closed-outline" size={16} color={colors.subtext} />
              </View>
              <Text style={{ fontSize: 12, color: colors.subtext, marginLeft: 4, marginBottom: 20 }}>
                Email is managed by your sign-in provider
              </Text>

              {/* ── PHONE FIELD ── */}
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Syne_700Bold",
                  color: colors.text,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Phone Number
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border + "80",
                  paddingHorizontal: 16,
                  height: 56,
                  marginBottom: 36,
                }}
              >
                <Ionicons name="call-outline" size={20} color={colors.subtext} style={{ marginRight: 12 }} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+235 XX XX XX XX"
                  placeholderTextColor={colors.subtext}
                  keyboardType="phone-pad"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: "500",
                  }}
                />
              </View>

              {/* ── SAVE BUTTON ── */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 16,
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 17, fontFamily: "Syne_700Bold" }}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
