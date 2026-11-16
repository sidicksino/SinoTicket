import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
} from "react-native";

type SocialButtonProps = {
  title: string;
  onPress: () => void;
  /** A bundled image (e.g. the Google logo) or an Ionicons name. */
  image?: ImageSourcePropType;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
};

/** Full-width outlined button with a logo and a label ("Continue with Google"). */
export default function SocialButton({
  title,
  onPress,
  image,
  icon,
  loading,
  disabled,
}: SocialButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.7}
      style={{
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 12,
        opacity: isDisabled ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          {image ? (
            <Image source={image} style={{ width: 20, height: 20 }} resizeMode="contain" />
          ) : icon ? (
            <Ionicons name={icon} size={20} color={colors.text} />
          ) : null}
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
