import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  max?: number;
}

export const QuantitySelector = ({
  quantity,
  onIncrement,
  onDecrement,
  max = 10,
}: QuantitySelectorProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBg }]}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={quantity <= 1}
        style={[styles.button, { opacity: quantity <= 1 ? 0.3 : 1 }]}
      >
        <Ionicons name="remove" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
      <TouchableOpacity
        onPress={onIncrement}
        disabled={quantity >= max}
        style={[styles.button, { opacity: quantity >= max ? 0.3 : 1 }]}
      >
        <Ionicons name="add" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 4,
  },
  button: {
    padding: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    minWidth: 45,
    textAlign: "center",
  },
});
