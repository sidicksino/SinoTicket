import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

interface AppHeaderProps {
  /** Optional subtitle shown above the user's name. Defaults to "Welcome back," */
  subtitle?: string;
  /** Override the display name shown in the greeting */
  displayName?: string;
}

export default function AppHeader({ subtitle = "Welcome back,", displayName }: AppHeaderProps) {
  const { colors } = useTheme();
  const { user } = useUser();
  const router = useRouter();

  const name = displayName ?? (user?.firstName ? user.firstName.split(" ")[0] : "Guest");

  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* ── LEFT SIDE: Avatar & Greeting ── */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => router.push("/(root)/(tabs)/profile")}
          style={{
            height: 48,
            width: 48,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: user?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500", marginBottom: 2 }}>
            {subtitle}
          </Text>
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 20 }}>
            {name}
          </Text>
        </View>
      </View>

      {/* ── RIGHT SIDE: Notifications ── */}
      <TouchableOpacity
        style={{
          height: 46,
          width: 46,
          borderRadius: 23,
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
        {/* Unread Indicator Dot */}
        <View 
          style={{ 
            position: "absolute", 
            top: 12, 
            right: 14, 
            width: 8, 
            height: 8, 
            borderRadius: 4, 
            backgroundColor: colors.primary,
            borderWidth: 1.5,
            borderColor: colors.card
          }} 
        />
      </TouchableOpacity>
    </View>
  );
}
