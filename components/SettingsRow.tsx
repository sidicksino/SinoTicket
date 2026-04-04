import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isDestructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const SettingsRow = ({
  icon,
  title,
  subtitle,
  rightElement,
  onPress,
  isDestructive,
  isFirst,
  isLast,
}: SettingsRowProps) => {
  const { colors } = useTheme();

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
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isDestructive ? colors.error + "20" : colors.primaryLight,
          alignItems: "center",
          justifyContent: "center",
          marginRight: isDestructive ? 12 : 16,
        }}
      >
        <Ionicons name={icon} size={18} color={isDestructive ? colors.error : colors.primary} />
      </View>
      <View style={{ flex: isDestructive ? 0 : 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Syne_700Bold",
            color: isDestructive ? colors.error : colors.text,
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: colors.subtext }}>{subtitle}</Text>
        )}
      </View>
      {rightElement ||
        (onPress && !isDestructive && (
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} style={{ opacity: 0.5 }} />
        ))}
    </TouchableOpacity>
  );
};

export default SettingsRow;
