import { useTheme } from "@/context/ThemeContext";
import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Custom re-usable row component for Settings
interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isDestructive?: boolean;
  colors: any;
  isFirst?: boolean;
  isLast?: boolean;
}

const SettingsRow = ({ icon, title, subtitle, rightElement, onPress, isDestructive, colors, isFirst, isLast }: SettingsRowProps) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderTopLeftRadius: isFirst ? 24 : 0,
        borderTopRightRadius: isFirst ? 24 : 0,
        borderBottomLeftRadius: isLast ? 24 : 0,
        borderBottomRightRadius: isLast ? 24 : 0,
        borderBottomWidth: isLast ? (isDestructive ? 1 : 0) : 1,
        borderBottomColor: isDestructive ? colors.error : colors.border + "80", 
        borderWidth: isDestructive ? 1 : 0,
        borderColor: isDestructive ? colors.error : "transparent",
        justifyContent: isDestructive ? "center" : "flex-start",
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDestructive ? colors.error + "20" : colors.primaryLight, alignItems: "center", justifyContent: "center", marginRight: isDestructive ? 12 : 16 }}>
        <Ionicons name={icon} size={18} color={isDestructive ? colors.error : colors.primary} />
      </View>
      <View style={{ flex: isDestructive ? 0 : 1 }}>
        <Text style={{ fontSize: 16, fontFamily: "Syne_700Bold", color: isDestructive ? colors.error : colors.text, marginBottom: subtitle ? 2 : 0 }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: colors.subtext }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (onPress && !isDestructive && <Ionicons name="chevron-forward" size={20} color={colors.subtext} style={{ opacity: 0.5 }} />)}
    </TouchableOpacity>
  );
};

export default function Profile() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* ── HEADER TITLE ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ fontFamily: "Syne_700Bold", fontSize: 28, color: colors.text }}>Profile</Text>
        </View>

        {/* ── PREMIUM USER CARD ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <TouchableOpacity 
            activeOpacity={0.8}
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
              elevation: 4
            }}
          >
            <View style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: colors.primary, overflow: "hidden", marginRight: 16 }}>
              <Image
                source={{ uri: user?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 20, marginBottom: 4 }}>
                {user?.fullName || "Guest User"}
              </Text>
              <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500" }}>
                {user?.emailAddresses?.[0]?.emailAddress || "Set up your account"}
              </Text>
            </View>
            <View style={{ padding: 8, backgroundColor: colors.background, borderRadius: 12 }}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── SETTINGS GROUPS ── */}
        <View style={{ paddingHorizontal: 20 }}>
          
          {/* Account Group */}
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginLeft: 16, marginBottom: 8 }}>
            Account
          </Text>
          <View style={{ shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 28 }}>
            <SettingsRow colors={colors} icon="person-outline" title="Personal Information" isFirst onPress={() => {}} />
            <SettingsRow colors={colors} icon="card-outline" title="Payment Methods" subtitle="Visa ending in 4242" onPress={() => {}} />
            <SettingsRow colors={colors} icon="notifications-outline" title="Notifications" isLast onPress={() => {}} />
          </View>

          {/* Preferences Group */}
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginLeft: 16, marginBottom: 8 }}>
            Preferences
          </Text>
          <View style={{ shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 28 }}>
            <SettingsRow 
              colors={colors} 
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
            <SettingsRow colors={colors} icon="globe-outline" title="Language" subtitle="English (US)" isLast onPress={() => {}} />
          </View>

          {/* About Group */}
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginLeft: 16, marginBottom: 8 }}>
            About
          </Text>
          <View style={{ shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 36 }}>
            <SettingsRow colors={colors} icon="help-buoy-outline" title="Help Center" isFirst onPress={() => {}} />
            <SettingsRow colors={colors} icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => {}} />
            <SettingsRow colors={colors} icon="document-text-outline" title="Terms of Service" isLast onPress={() => {}} />
          </View>

          {/* ── SIGN OUT BUTTON ── */}
          <View style={{ shadowColor: colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }}>
            <SettingsRow 
              colors={colors} 
              icon="log-out-outline" 
              title="Log Out" 
              isDestructive 
              isFirst 
              isLast 
              onPress={() => signOut()} 
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
