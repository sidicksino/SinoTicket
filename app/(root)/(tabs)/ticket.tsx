import { useAuthFetch } from "@/lib/fetch";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Compact QR-code-style display using a hash string
function QRDisplay({ code }: { code: string }) {
  const { colors } = useTheme();
  const rows = 6;
  const cols = 12;
  // Deterministically derive a grid from the hash so it looks like a QR grid
  const cells = Array.from({ length: rows * cols }, (_, i) =>
    parseInt(code[i % code.length], 16) % 2 === 0
  );
  return (
    <View style={{ alignItems: "center", marginVertical: 12 }}>
      <View
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: colors.border,
        }}
      >
        {Array.from({ length: rows }).map((_, r) => (
          <View key={r} style={{ flexDirection: "row" }}>
            {Array.from({ length: cols }).map((_, c) => (
              <View
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  margin: 1,
                  borderRadius: 2,
                  backgroundColor: cells[r * cols + c] ? "#111" : "#fff",
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={{ color: colors.subtext, fontSize: 10, marginTop: 8, letterSpacing: 1 }}>
        {code.slice(0, 16).toUpperCase()}
      </Text>
    </View>
  );
}

export default function TicketWallet() {
  const { colors } = useTheme();
  const { authFetch } = useAuthFetch();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      const result = await authFetch("/api/tickets/me");
      setTickets(result.tickets ?? []);
    } catch (e) {
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const onRefresh = () => { setRefreshing(true); loadTickets(); };

  const statusColor = (s: string) =>
    s === "Active" ? "#22C55E" : s === "Used" ? "#6B7280" : "#EF4444";

  const renderTicket = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item._id;
    const eventDate = item.event_id?.date
      ? new Date(item.event_id.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "TBA";

    return (
      <TouchableOpacity
        onPress={() => setExpandedId(isExpanded ? null : item._id)}
        activeOpacity={0.9}
        style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          overflow: "hidden",
        }}
      >
        {/* Ticket top ribbon */}
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontFamily: "Syne_700Bold", fontSize: 16, flex: 1 }} numberOfLines={1}>
              {item.event_id?.title ?? "Event"}
            </Text>
            <View style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{item.status}</Text>
            </View>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>📅 {eventDate}</Text>
        </View>

        {/* Dashed divider */}
        <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
          {Array.from({ length: 26 }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 1, backgroundColor: i % 2 === 0 ? colors.border : "transparent" }} />
          ))}
        </View>

        {/* Ticket body */}
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>SECTION</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 4 }}>
                {item.seat_id?.section_id?.name ?? "—"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>SEAT</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 4 }}>
                #{item.seat_id?.number ?? "—"}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Ionicons
                name={isExpanded ? "chevron-up" : "qr-code-outline"}
                size={24}
                color={colors.primary}
              />
            </View>
          </View>

          {isExpanded && item.qr_code && (
            <QRDisplay code={item.qr_code} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 28 }}>My Tickets</Text>
        <Text style={{ color: colors.subtext, fontSize: 14, marginTop: 4 }}>Tap a ticket to reveal QR code</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : tickets.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
          <Ionicons name="ticket-outline" size={64} color={colors.border} />
          <Text style={{ color: colors.subtext, fontSize: 16, textAlign: "center", marginTop: 16 }}>
            No tickets yet.{"\n"}Book an event to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(t) => t._id}
          renderItem={renderTicket}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}
