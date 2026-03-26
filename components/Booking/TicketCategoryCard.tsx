import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TicketCategoryCardProps {
  name: string;
  price: number;
  available: number;
  selected: boolean;
  onSelect: () => void;
}

export const TicketCategoryCard = ({
  name,
  price,
  available,
  selected,
  onSelect,
}: TicketCategoryCardProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary : colors.cardBorder,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        {selected && (
          <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.selectedText}>SELECTED</Text>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={[styles.price, { color: colors.primary }]}>{price} XAF</Text>
        <Text style={[styles.available, { color: colors.subtext }]}>
          {available} seats left
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontFamily: "Syne_700Bold",
  },
  selectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 22,
    fontFamily: "Syne_700Bold",
  },
  available: {
    fontSize: 12,
  },
});
