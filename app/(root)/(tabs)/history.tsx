import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import { useTranslation } from "react-i18next";

const History = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader subtitle={t("history.subtitle")} displayName={t("history.displayName")} />
      <EmptyState 
        icon="time-outline"
        title={t("history.title")}
        message={t("history.message")}
      />
    </SafeAreaView>
  );
};

export default History;
