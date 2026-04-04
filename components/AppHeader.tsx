import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
      <View>
        <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500" }}>
          {subtitle}
        </Text>
        <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 24 }}>
          {name}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(root)/(tabs)/profile")}
        style={{
          height: 46,
          width: 46,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: user?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
          style={{ width: "100%", height: "100%" }}
        />
      </TouchableOpacity>
    </View>
  );
}
