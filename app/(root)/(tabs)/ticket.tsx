import { useAuthFetch } from "@/lib/fetch";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Compact QR-code-style display using a hash string, Optimized with useMemo
const QRDisplay = React.memo(function QRDisplay({ code }: { code: string }) {
  const { colors } = useTheme();
  const rows = 6;
  const cols = 12;

  // Use memo because recalculating arrays constantly per render drops frames
  const cells = useMemo(() => {
    if (!code) return Array(rows * cols).fill(false);
    return Array.from({ length: rows * cols }, (_, i) =>
      parseInt(code[i % code.length], 16) % 2 === 0
    );
  }, [code]);

  if (!code) return null;

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
});

// Memoized Ticket Item ensures expanding one ticket doesn't completely re-render all others
const TicketItem = React.memo(({ item, isExpanded, onToggle }: { item: any, isExpanded: boolean, onToggle: () => void }) => {
  const { colors } = useTheme();

  // Safeguard against unpopulated backend referenced data
  const isEventPopulated = typeof item.event_id === "object" && item.event_id !== null;
  const eventTitle = isEventPopulated && item.event_id.title ? item.event_id.title : "Event TBA";
  
  const eventDateRaw = isEventPopulated ? item.event_id.date : null;
  const eventDate = eventDateRaw
    ? new Date(eventDateRaw).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Date TBA";

  const isSeatPopulated = typeof item.seat_id === "object" && item.seat_id !== null;
  const isSectionPopulated = isSeatPopulated && typeof item.seat_id.section_id === "object" && item.seat_id.section_id !== null;
  
  const sectionName = isSectionPopulated && item.seat_id.section_id.name ? item.seat_id.section_id.name : "—";
  const seatNumber = isSeatPopulated && item.seat_id.number ? item.seat_id.number : "—";
  
  // Ensures default visibility
  const status = item.status || "Valid";

  return (
    <TouchableOpacity
      onPress={onToggle}
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
          <Text style={{ color: "#ffffff", fontFamily: "Syne_700Bold", fontSize: 16, flex: 1 }} numberOfLines={1}>
            {eventTitle}
          </Text>
          <View style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
              {status}
            </Text>
          </View>
        </View>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>
          📅 {eventDate}
        </Text>
      </View>

      {/* Dashed divider */}
      <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
        {Array.from({ length: 26 }).map((_, i) => (
          <View key={i} style={{ flex: 1, height: 1.5, backgroundColor: i % 2 === 0 ? colors.border : "transparent" }} />
        ))}
      </View>

      {/* Ticket body */}
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>SECTION</Text>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 4 }}>
              {sectionName}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>SEAT</Text>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 4 }}>
              #{seatNumber}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "center" }}>
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
});
TicketItem.displayName = "TicketItem";

export default function TicketWallet() {
  const { colors } = useTheme();
  const { authFetch } = useAuthFetch();
  const { isSignedIn, isLoaded } = useAuth();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setTickets([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    setError(null);
    try {
      const result = await authFetch("/api/tickets/me");
      const safeTickets = result?.success && Array.isArray(result?.tickets) ? result.tickets : [];
      setTickets(safeTickets);
    } catch (err: any) {
      setError(err.message || "Failed to load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch, isLoaded, isSignedIn]);

  useEffect(() => { 
    loadTickets(); 
  }, [loadTickets]);

  const onRefresh = () => { 
    setRefreshing(true); 
    loadTickets(); 
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <TicketItem 
        item={item} 
        isExpanded={expandedId === item._id} 
        onToggle={() => setExpandedId(prev => prev === item._id ? null : item._id)} 
      />
    );
  }, [expandedId]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingTop: 100 }}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 18, fontFamily: "Syne_700Bold", marginTop: 16 }}>
            Oops!
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 15, textAlign: "center", marginTop: 8 }}>
            {error}
          </Text>
          <TouchableOpacity 
            onPress={loadTickets} 
            activeOpacity={0.8}
            style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primaryLight, borderRadius: 12 }}
          >
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingTop: 100 }}>
        <Ionicons name="ticket-outline" size={64} color={colors.border} />
        <Text style={{ color: colors.subtext, fontSize: 16, textAlign: "center", marginTop: 16 }}>
          No tickets yet.{"\n"}Book an event to get started!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 28 }}>My Tickets</Text>
        <Text style={{ color: colors.subtext, fontSize: 14, marginTop: 4 }}>Tap a ticket to reveal QR code</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(t) => t._id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.primary} 
            colors={[colors.primary]} 
          />
        }
      />
    </SafeAreaView>
  );
}
