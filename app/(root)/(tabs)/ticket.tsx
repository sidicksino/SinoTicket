import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@clerk/expo";
import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

// Compact true QR-code display
const QRDisplay = React.memo(function QRDisplay({ code, colors }: { code: string, colors: any }) {
  if (!code) return null;

  const qrUrl = `${process.env.EXPO_PUBLIC_API_URL || 'https://sinoticket.com'}/api/tickets/verify/${code}`;

  return (
    <View style={{ alignItems: "center", paddingVertical: 24, backgroundColor: '#fff', borderRadius: 24, marginTop: 16 }}>
      <View style={{ padding: 16, backgroundColor: "#fff" }}>
        <QRCode 
          value={qrUrl} 
          size={160} 
          color={colors.primary} 
          backgroundColor="#FFFFFF" 
        />
      </View>
      <Text style={{ color: "#64748B", fontSize: 11, marginTop: 12, fontWeight: '700', letterSpacing: 2 }}>
        {code.length > 16 ? code.substring(0, 16).toUpperCase() + '...' : code.toUpperCase()}
      </Text>
    </View>
  );
});

const TicketItem = React.memo(({ item, isExpanded, onToggle }: { item: any; isExpanded: boolean; onToggle: () => void }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const event = typeof item.event_id === "object" ? item.event_id : null;
  const seat = typeof item.seat_id === "object" ? item.seat_id : null;
  const section = seat && typeof seat.section_id === "object" ? seat.section_id : null;

  const eventTitle = event?.title || t("ticket.eventTba");
  const eventImage = event?.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800";
  const eventDate = event?.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : t("ticket.tba");
  const eventTime = event?.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t("ticket.tba");

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
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{item.status?.toUpperCase() || t("ticket.active")}</Text>
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
              <Text style={{ color: colors.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>{t("ticket.section")}</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 }}>{section?.name || t("ticket.standard")}</Text>
            </View>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>{t("ticket.seat")}</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 }}>{t("ticket.row")} {seat?.row || "0"} • #{seat?.number || "0"}</Text>
            </View>
            <TouchableOpacity onPress={onToggle} style={{ backgroundColor: colors.primaryLight, padding: 8, borderRadius: 12 }}>
              <Ionicons name={isExpanded ? "chevron-up" : "qr-code-outline"} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {isExpanded && <QRDisplay code={item.qr_code || "SINOTICKET-PREMIUM"} colors={colors} />}
        </View>
      </TouchableOpacity>
    </View>
  );
});

TicketItem.displayName = "TicketItem";

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
        title={t("ticket.noTicketsTitle")}
        message={t("ticket.noTicketsMessage")}
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
      <AppHeader subtitle={t("ticket.yourTickets")} displayName={t("ticket.wallet")} />
      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Text style={{ color: colors.subtext, fontSize: 14, marginTop: 4 }}>
          {t("ticket.showingAvailable", { count: tickets.length })}
        </Text>
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
