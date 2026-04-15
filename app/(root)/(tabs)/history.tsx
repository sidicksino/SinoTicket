import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@clerk/expo";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

// Minimal QR modal
const QRModal = React.memo(function QRModal({
  code,
  colors,
  onClose,
}: {
  code: string;
  colors: any;
  onClose: () => void;
}) {
  const qrUrl = `${process.env.EXPO_PUBLIC_API_URL || "https://sinoticket.com"}/api/tickets/verify/${code}`;

  return (
    <View
      style={{
        backgroundColor: colors.background + "f0",
        padding: 20,
        borderRadius: 20,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: colors.primary + "30",
        alignItems: "center",
      }}
    >
      <View
        style={{
          padding: 12,
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.primary + "40",
        }}
      >
        <QRCode value={qrUrl} size={140} color={colors.primary} backgroundColor="#fff" />
      </View>
      <Text
        style={{
          color: colors.subtext,
          fontSize: 11,
          marginTop: 12,
          fontWeight: "600",
          letterSpacing: 1,
          fontFamily: "monospace",
        }}
      >
        {code.substring(0, 20)}...
      </Text>
      <TouchableOpacity
        onPress={onClose}
        style={{
          marginTop: 12,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: colors.primary + "20",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 12 }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
});

// Modern minimal history item
const HistoryItem = React.memo(
  ({
    item,
    isExpanded,
    onToggle,
  }: {
    item: any;
    isExpanded: boolean;
    onToggle: () => void;
  }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const event = typeof item.event_id === "object" ? item.event_id : null;
    const seat = typeof item.seat_id === "object" ? item.seat_id : null;
    const section = seat && typeof seat.section_id === "object" ? seat.section_id : null;

    const eventTitle = event?.title || t("ticket.eventTba");
    const eventDate = event?.date
      ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "N/A";
    const eventMonth = event?.date
      ? new Date(event.date).toLocaleDateString("en-US", { year: "2-digit" })
      : "";

    const statusColor =
      item.status === "Used"
        ? "#10B981"
        : item.status === "Active"
          ? colors.primary
          : item.status === "Expired"
            ? "#F59E0B"
            : "#6B7280";

    return (
      <View style={{ marginBottom: 12 }}>
        <TouchableOpacity
          onPress={onToggle}
          activeOpacity={0.6}
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Date Badge */}
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: statusColor + "15",
              borderWidth: 1,
              borderColor: statusColor + "40",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: statusColor, fontSize: 18, fontWeight: "700" }}>
              {eventDate.split(" ")[0]}
            </Text>
            <Text style={{ color: statusColor + "80", fontSize: 9, fontWeight: "600" }}>
              {eventDate.split(" ")[1]}
            </Text>
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {eventTitle}
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: statusColor + "20",
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              {section && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="layers-outline" size={12} color={colors.subtext} />
                  <Text style={{ color: colors.subtext, fontSize: 11 }}>{section.name}</Text>
                </View>
              )}
              {seat && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="aperture-outline" size={12} color={colors.subtext} />
                  <Text style={{ color: colors.subtext, fontSize: 11 }}>#{seat.number}</Text>
                </View>
              )}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "qr-code-outline"}
                  size={12}
                  color={colors.primary}
                />
              </View>
            </View>
          </View>

          {/* Chevron */}
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Expanded QR Section */}
        {isExpanded && (
          <QRModal
            code={item.qr_code || "SINOTICKET"}
            colors={colors}
            onClose={onToggle}
          />
        )}
      </View>
    );
  }
);

HistoryItem.displayName = "HistoryItem";

const History = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { authFetch } = useAuthFetch();
  const { isSignedIn, isLoaded } = useAuth();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setError(null);
      const result = await authFetch("/api/tickets/me");
      if (result?.success) {
        const pastTickets = (result.tickets || []).sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTickets(pastTickets);
      } else {
        setError(result?.message || "Failed to load history");
      }
    } catch (err: any) {
      console.error("Error loading history:", err);
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch, isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const renderEmpty = () => (
    <EmptyState
      icon="time-outline"
      title={t("history.title")}
      message={t("history.message")}
    />
  );

  if (!isLoaded || loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        subtitle={t("history.subtitle")}
        displayName={t("history.displayName")}
      />

      {error && (
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: "#FEE2E2",
            borderRadius: 10,
            borderLeftWidth: 3,
            borderLeftColor: "#EF4444",
          }}
        >
          <Text style={{ color: "#991B1B", fontSize: 12, fontWeight: "600" }}>
            {error}
          </Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500" }}>
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.primary + "10",
              borderRadius: 8,
            }}
          >
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>
              All history
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            isExpanded={expandedId === item._id}
            onToggle={() => setExpandedId(expandedId === item._id ? null : item._id)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

export default History;
