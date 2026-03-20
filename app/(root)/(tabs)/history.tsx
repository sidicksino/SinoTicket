import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const History = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 22, marginBottom: 8 }}>Event History</Text>
      <Text style={{ color: colors.subtext, fontSize: 15 }}>Your past and saved tickets will appear here.</Text>
    </SafeAreaView>
  );
};

export default History;
