import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";

const History = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader subtitle="Track your" displayName="History" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 22, marginBottom: 8 }}>Event History</Text>
        <Text style={{ color: colors.subtext, fontSize: 15, textAlign: "center" }}>Your past and saved tickets will appear here.</Text>
      </View>
    </SafeAreaView>
  );
};

export default History;
