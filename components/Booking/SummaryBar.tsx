import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "../CustomButton";

interface SummaryBarProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onPress: () => void;
  loading?: boolean;
}

export const SummaryBar = ({
  title,
  subtitle,
  buttonLabel,
  onPress,
  loading,
}: SummaryBarProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {subtitle}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={buttonLabel}
            onPress={onPress}
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Syne_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  buttonContainer: {
    flex: 1,
    marginLeft: 20,
  },
});
