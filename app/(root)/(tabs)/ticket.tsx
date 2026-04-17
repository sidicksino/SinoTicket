import AppHeader from "@/components/AppHeader";
import { DownloadableTicket, TicketData } from "@/components/DownloadableTicket";
import EmptyState from "@/components/EmptyState";
import { useTheme } from "@/context/ThemeContext";
import { useFetch } from "@/lib/fetch";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

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
  const qrUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tickets/verify/${code}`;

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
  onDownload,
  isDownloading,
}: {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
  onDownload: () => void;
  isDownloading: boolean;
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
      (1000 * 60 * 60 * 24),
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
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}
                >
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "500" }}
                  >
                    {event?.location || (event?.venue_id && typeof event.venue_id === 'object' ? (event.venue_id as any).name : "Sino Ticket Venue")}
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
              onPress={onDownload}
              disabled={isDownloading}
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.primary + (isDownloading ? "50" : ""),
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={14} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    Download
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Expanded QR section */}
        {isExpanded && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: colors.card,
            }}
          >
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
  const { isLoaded } = useAuth();

  const {
    data,
    loading: fetchLoading,
    isOffline,
    refetch
  } = useFetch<any>("/api/tickets/me", {
    authenticated: true,
    cacheKey: "active_tickets"
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const ticketRef = useRef<any>(null);
  const [printingTicket, setPrintingTicket] = useState<TicketData | null>(null);

  const handleDownload = async (item: any) => {
    try {
      setDownloadingId(item._id);

      const event = typeof item.event_id === "object" ? item.event_id : {};
      const seat = typeof item.seat_id === "object" ? item.seat_id : {};
      const section = seat && typeof seat.section_id === "object" ? seat.section_id : {};

      // Map to DownloadableTicket data structure
      const ticketData: TicketData = {
        category: event.category || "General",
        eventName: event.title || "Sino Ticket Event",
        date: event.date
          ? (() => {
            const d = new Date(event.date);
            const datePart = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
            const timePart = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
            return `${datePart} ${timePart}`;
          })()
          : "TBA",
        price: (() => {
          const catId = item.category_id;
          const categories = event.ticket_categories || [];
          const matched = categories.find((cat: any) =>
            cat._id === catId || cat.category_id === catId || cat.id === catId
          );
          return matched ? `${matched.price} XAF` : (event.price ? `$${event.price}` : "PAID");
        })(),
        venue: event.location || (event.venue_id && typeof event.venue_id === 'object' ? (event.venue_id as any).name : "Sino Ticket Venue"),
        section: section.name || "N/A",
        seat: seat.number || "0",
        ticketId: item.qr_code || "SINOTICKET",
        eventImage: event.imageUrl || "https://images.unsplash.com/photo-1540039155733-5bb30b4f53e6?w=800",
      };

      setPrintingTicket(ticketData);

      // Small delay to ensure state update and rendering of the hidden component
      setTimeout(async () => {
        try {
          const uri = await captureRef(ticketRef, {
            format: "png",
            quality: 1,
          });

          const { status } = await MediaLibrary.requestPermissionsAsync();

          if (status === "granted") {
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert(t("ticket.saved"), t("ticket.savedGallery"));
          } else {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(uri, {
                mimeType: "image/png",
                dialogTitle: "Save Ticket",
              });
            } else {
              Alert.alert(t("ticket.permissionError"), t("ticket.permissionMessage"));
            }
          }
        } catch (err) {
          console.error("Capture error:", err);
          Alert.alert("Error", "Failed to capture ticket image.");
        } finally {
          setDownloadingId(null);
          setPrintingTicket(null);
        }
      }, 500);
    } catch (err) {
      console.error("Download error:", err);
      setDownloadingId(null);
      setPrintingTicket(null);
      Alert.alert("Error", "Could not process ticket download.");
    }
  };

  // Derive active tickets from fetch data
  const tickets = React.useMemo(() => {
    if (!data?.success || !Array.isArray(data.tickets)) return [];

    return data.tickets.filter((ticket: any) => {
      // Must be Active status
      if (ticket.status !== "Active") return false;

      // Must be a future event (if event date exists)
      const event = typeof ticket.event_id === "object" ? ticket.event_id : null;
      if (event?.date) {
        const eventDate = new Date(event.date);
        const now = new Date();
        // Allow same day event
        now.setHours(0, 0, 0, 0);
        eventDate.setHours(23, 59, 59, 999);
        if (eventDate < now) return false;
      }
      return true;
    });
  }, [data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderEmpty = () => (
    <EmptyState
      icon="ticket-outline"
      title={t("ticket.noTicketsTitle")}
      message={t("ticket.noTicketsMessage")}
    />
  );

  if (!isLoaded || (fetchLoading && !data)) {
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

      {/* Offline Banner */}
      {isOffline && (
        <View
          style={{
            backgroundColor: "#F59E0B",
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
            Viewing Offline Tickets
          </Text>
        </View>
      )}

      {/* Premium header stats */}
      <View
        style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 }}
      >
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
            onDownload={() => handleDownload(item)}
            isDownloading={downloadingId === item._id}
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

      {/* Hidden renderer for ticket capture */}
      {printingTicket && (
        <DownloadableTicket
          ticket={printingTicket}
          ticketRef={ticketRef}
        />
      )}
    </SafeAreaView>
  );
}
