import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";

const History = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader subtitle="Track your" displayName="History" />
      <EmptyState 
        icon="time-outline"
        title="Event History"
        message="Your past and saved tickets will appear here."
      />
    </SafeAreaView>
  );
};

export default History;
