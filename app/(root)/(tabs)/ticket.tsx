import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@clerk/expo";
import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Compact QR-code style display - Optimized
const QRDisplay = React.memo(function QRDisplay({ code }: { code: string }) {
  const rows = 8;
  const cols = 8;

  const cells = useMemo(() => {
    if (!code) return Array(rows * cols).fill(false);
    return Array.from({ length: rows * cols }, (_, i) =>
      parseInt(code[i % code.length], 16) % 2 === 0
    );
  }, [code]);

  if (!code) return null;

  return (
    <View style={{ alignItems: "center", paddingVertical: 24, backgroundColor: '#fff', borderRadius: 24, marginTop: 16 }}>
      <View style={{ padding: 16, backgroundColor: "#fff" }}>
        {Array.from({ length: rows }).map((_, r) => (
          <View key={r} style={{ flexDirection: "row" }}>
            {Array.from({ length: cols }).map((_, c) => (
              <View
                key={c}
                style={{
                  width: 14,
                  height: 14,
                  margin: 1.5,
                  borderRadius: 2,
                  backgroundColor: cells[r * cols + c] ? "#111" : "#fff",
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={{ color: "#64748B", fontSize: 11, marginTop: 12, fontWeight: '700', letterSpacing: 2 }}>
        {code.toUpperCase()}
      </Text>
    </View>
  );
});

const TicketItem = React.memo(({ item, isExpanded, onToggle }: { item: any; isExpanded: boolean; onToggle: () => void }) => {
  const { colors } = useTheme();

  const event = typeof item.event_id === "object" ? item.event_id : null;
  const seat = typeof item.seat_id === "object" ? item.seat_id : null;
  const section = seat && typeof seat.section_id === "object" ? seat.section_id : null;

  const eventTitle = event?.title || "Event TBA";
  const eventImage = event?.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800";
  const eventDate = event?.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA";
  const eventTime = event?.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBA";

  return (
    <View style={{ marginBottom: 20 }}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.9}
        style={{
          backgroundColor: colors.card,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          overflow: "hidden",
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        {/* Ticket Header Image */}
        <View style={{ height: 140, width: '100%' }}>
          <Image source={{ uri: eventImage }} style={{ width: '100%', height: '100%' }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          
          <View style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{item.status?.toUpperCase() || "ACTIVE"}</Text>
          </View>

          <View style={{ position: 'absolute', bottom: 16, left: 20 }}>
            <Text style={{ color: '#fff', fontFamily: "Syne_700Bold", fontSize: 20, marginBottom: 4 }}>{eventTitle}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{eventDate} • {eventTime}</Text>
            </View>
          </View>
        </View>

        {/* Ticket Info Area */}
        <View style={{ padding: 20, backgroundColor: colors.card }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>Section</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 }}>{section?.name || "Standard"}</Text>
            </View>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>Seat</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 }}>Row {seat?.row || "0"} • #{seat?.number || "0"}</Text>
            </View>
            <TouchableOpacity onPress={onToggle} style={{ backgroundColor: colors.primaryLight, padding: 8, borderRadius: 12 }}>
              <Ionicons name={isExpanded ? "chevron-up" : "qr-code-outline"} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {isExpanded && <QRDisplay code={item.qr_code || "SINOTICKET-PREMIUM"} />}
        </View>
      </TouchableOpacity>
    </View>
  );
});

TicketItem.displayName = "TicketItem";

export default function TicketWallet() {
  const { colors } = useTheme();
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
      if (result?.success) setTickets(result.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch, isSignedIn]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const renderEmpty = () => (
    <EmptyState 
      icon="ticket-outline"
      title="No tickets found"
      message="Your booked tickets will appear here for scanning at the venue."
    />
  );

  if (!isLoaded || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader subtitle="Your tickets," displayName="Wallet" />
      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Text style={{ color: colors.subtext, fontSize: 14, marginTop: 4 }}>Showing {tickets.length} available tickets</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <TicketItem 
            item={item} 
            isExpanded={expandedId === item._id} 
            onToggle={() => setExpandedId(expandedId === item._id ? null : item._id)} 
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTickets(); }} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
}
