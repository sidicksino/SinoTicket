import React from "react";
import { View, Text, StyleSheet, DimensionValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  marginTop?: DimensionValue;
}

const EmptyState = ({ 
  icon = "search-outline", 
  title, 
  message,
  marginTop = 100 
}: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { marginTop }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.cardBorder }]}>
        <Ionicons name={icon} size={40} color={colors.subtext} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: colors.subtext }]}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Syne_700Bold",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});

export default EmptyState;
