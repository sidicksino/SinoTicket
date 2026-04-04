import { useTheme } from "@/context/ThemeContext";
import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        {/* User Info Card */}
        <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.cardBorder, alignItems: "center" }}>
          <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 20 }}>{user?.fullName || "Guest"}</Text>
          <Text style={{ color: colors.subtext, fontSize: 14, marginTop: 4 }}>{user?.emailAddresses?.[0]?.emailAddress || ""}</Text>
        </View>

        {/* Theme Toggle */}
        <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
                {isDark ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={() => signOut()}
          style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.error, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={{ color: colors.error, fontWeight: "700", fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
