import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

// Premium QR modal
const QRModal = React.memo(function QRModal({
  code,
  colors,
  eventTitle,
  onClose,
}: {
  code: string;
  colors: any;
  eventTitle: string;
  onClose: () => void;
}) {
  const qrUrl = `${process.env.EXPO_PUBLIC_API_URL || "https://sinoticket.com"}/api/tickets/verify/${code}`;

  return (
    <View
      style={{
        marginTop: 16,
        padding: 20,
        backgroundColor: colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.primary + "30",
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: "700",
          marginBottom: 16,
        }}
      >
        Ticket Code
      </Text>

      <View
        style={{
          padding: 20,
          backgroundColor: "#fff",
          borderRadius: 20,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <QRCode
          value={qrUrl}
          size={150}
          color={colors.primary}
          backgroundColor="#fff"
        />
      </View>

      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: colors.primary + "15",
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1,
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          {code.substring(0, 12)}...
        </Text>
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={{
          paddingVertical: 12,
          backgroundColor: colors.primary,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
          Close
        </Text>
      </TouchableOpacity>
    </View>
  );
});

// Modern premium ticket card
function TicketCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const event = typeof item.event_id === "object" ? item.event_id : null;
  const seat = typeof item.seat_id === "object" ? item.seat_id : null;
  const section =
    seat && typeof seat.section_id === "object" ? seat.section_id : null;

  const eventTitle = event?.title || t("ticket.eventTba");
  const eventImage =
    event?.imageUrl ||
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800";
  const eventDate = event?.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";
  const eventTime = event?.date
    ? new Date(event.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const daysUntil = event?.date
    ? Math.ceil(
        (new Date(event.date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      style={{ marginBottom: 20 }}
    >
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: colors.primary,
          overflow: "hidden",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Premium header section with image background */}
        <ImageBackground
          source={{ uri: eventImage }}
          style={{
            padding: 20,
            paddingBottom: 24,
          }}
          imageStyle={{
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          }}
        >
          {/* Dark overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
            }}
          />
          {/* Content */}
          <View style={{ zIndex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: "800",
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {eventTitle}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="ticket-outline" size={14} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                    {section?.name || t("ticket.standard")} • Seat #{seat?.number || "0"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onToggle}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={isExpanded ? "close-outline" : "qr-code-outline"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Date and time info */}
            <View
              style={{
                flexDirection: "row",
                gap: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  DATE
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  {eventDate}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  TIME
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  {eventTime}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Body with details */}
        <View style={{ padding: 20, backgroundColor: colors.card }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.cardBorder,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: colors.subtext,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                SECTION
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {section?.name || "Standard"}
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: colors.subtext,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                SEAT
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                #{seat?.number || "0"}
              </Text>
            </View>

            <View style={{ width: 1, backgroundColor: colors.cardBorder }} />

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: colors.subtext,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                DAYS LEFT
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {daysUntil}
              </Text>
            </View>
          </View>

          {/* Status badge and button */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: "#10B98120",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#10B98140",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text
                style={{
                  color: "#10B981",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                Valid
              </Text>
            </View>

            <TouchableOpacity
              onPress={onToggle}
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.primary,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <Ionicons name="qr-code" size={14} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                Show Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Expanded QR section */}
        {isExpanded && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.card }}>
            <QRModal
              code={item.qr_code || "SINOTICKET"}
              colors={colors}
              eventTitle={eventTitle}
              onClose={onToggle}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function TicketWallet() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { authFetch } = useAuthFetch();
  const { isSignedIn, isLoaded } = useAuth();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const result = await authFetch("/api/tickets/me");
      if (result?.success) {
        // Filter to show only Active tickets and exclude past/used tickets
        const activeTickets = result.tickets.filter((ticket: any) => {
          // Must be Active status
          if (ticket.status !== "Active") return false;

          // Must be a future event (if event date exists)
          const event =
            typeof ticket.event_id === "object" ? ticket.event_id : null;
          if (event?.date) {
            const eventDate = new Date(event.date);
            const now = new Date();
            if (eventDate < now) return false; // Exclude past events
          }

          return true;
        });
        setTickets(activeTickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch, isSignedIn]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const renderEmpty = () => (
    <EmptyState
      icon="ticket-outline"
      title={t("ticket.noTicketsTitle")}
      message={t("ticket.noTicketsMessage")}
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
        subtitle={t("ticket.yourTickets")}
        displayName={t("ticket.wallet")}
      />

      {/* Premium header stats */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 }}>
        <View
          style={{
            backgroundColor: colors.primary + "10",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primary + "30",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                color: colors.subtext,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Active Tickets
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {tickets.length}
            </Text>
          </View>

          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="ticket" size={28} color="#fff" />
          </View>
        </View>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <TicketCard
            item={item}
            isExpanded={expandedId === item._id}
            onToggle={() =>
              setExpandedId(expandedId === item._id ? null : item._id)
            }
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadTickets();
            }}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}
