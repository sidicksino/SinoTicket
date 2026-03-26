import { useAuthFetch, useFetch } from "@/lib/fetch";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Status → color mapping
const SEAT_COLORS: Record<string, string> = {
  available: "#22C55E",   // green
  reserved:  "#F59E0B",   // amber
  booked:    "#EF4444",   // red
};

export default function SeatSelection() {
  const { event_id, section_id, event_title } = useLocalSearchParams<{
    event_id: string;
    section_id: string;
    event_title: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { authFetch } = useAuthFetch();

  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [reserving, setReserving] = useState(false);

  // Fetch seats for the chosen section
  const { data, loading, error, refetch } = useFetch<any>(
    `/api/seats?section_id=${section_id}&limit=200`,
    false
  );

  const seats = data?.success && Array.isArray(data?.seats) ? data.seats : [];

  const handleReserve = async () => {
    if (!selectedSeat) return;
    setReserving(true);
    try {
      const result = await authFetch("/api/reservations/reserve", {
        method: "POST",
        body: JSON.stringify({ event_id, seat_id: selectedSeat._id }),
      });
      Alert.alert(
        "🎟️ Seat Reserved!",
        `Seat #${selectedSeat.number} is locked for 15 minutes. Proceed to checkout.`,
        [
          {
            text: "Checkout Now",
            onPress: () =>
              (router as any).push({
                pathname: "/checkout",
                params: { reservation_id: result.reservation._id, seat_number: selectedSeat.number, event_title },
              }),
          },
          { text: "Reserve More", style: "cancel", onPress: () => { setSelectedSeat(null); refetch(); } },
        ]
      );
    } catch (err: any) {
      Alert.alert("Unavailable", err.message || "Could not reserve this seat. Try another.");
    } finally {
      setReserving(false);
    }
  };

  const renderSeat = ({ item }: { item: any }) => {
    const isSelected = selectedSeat?._id === item._id;
    const color = item.status !== 'available' ? SEAT_COLORS[item.status] : isSelected ? colors.primary : SEAT_COLORS.available;
    const disabled = item.status !== 'available';

    return (
      <TouchableOpacity
        onPress={() => !disabled && setSelectedSeat(item)}
        disabled={disabled}
        style={{
          width: 46,
          height: 46,
          margin: 5,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
          borderWidth: isSelected ? 2 : 0,
          borderColor: "#fff",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{item.number}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18 }} numberOfLines={1}>
            {event_title || "Select Seat"}
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 13 }}>Tap an available seat</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 16 }}>
        {[
          { label: "Available", color: SEAT_COLORS.available },
          { label: "Selected", color: colors.primary },
          { label: "Reserved",  color: SEAT_COLORS.reserved },
          { label: "Booked",    color: SEAT_COLORS.booked },
        ].map((l) => (
          <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: l.color }} />
            <Text style={{ color: colors.subtext, fontSize: 12 }}>{l.label}</Text>
          </View>
        ))}
      </View>

      {/* Stage indicator */}
      <View style={{ marginHorizontal: 24, paddingVertical: 10, backgroundColor: colors.inputBg, borderRadius: 12, alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: colors.subtext, fontWeight: "700", letterSpacing: 4, fontSize: 13 }}>🎬 STAGE</Text>
      </View>

      {/* Seat Grid */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>Failed to load seats.</Text>
      ) : (
        <FlatList
          data={seats}
          keyExtractor={(s) => s._id}
          renderItem={renderSeat}
          numColumns={6}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
          columnWrapperStyle={{ justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom CTA */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }}>
        {selectedSeat ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: colors.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
              <Text style={{ color: colors.subtext, fontSize: 12 }}>Selected</Text>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>Seat #{selectedSeat.number}</Text>
            </View>
            <TouchableOpacity
              onPress={handleReserve}
              disabled={reserving}
              style={{ flex: 2, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
            >
              {reserving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontFamily: "Syne_700Bold", fontSize: 16 }}>Reserve This Seat</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: colors.subtext, fontSize: 15 }}>Select a seat above to continue</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
