import { SummaryBar } from "@/components/Booking/SummaryBar";
import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch, useFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SeatSelection() {
  const params = useLocalSearchParams<{
    event_id: string;
    section_id: string;
    event_title: string;
    quantity: string;
    price: string;
    category_name: string;
  }>();
  
  const router = useRouter();
  const { colors } = useTheme();
  const { authFetch } = useAuthFetch();

  const SEAT_COLORS = {
    available: colors.seatAvailable,
    selected:  colors.seatSelected,
    reserved:  colors.seatReserved,
    booked:    colors.seatBooked,
  };

  const requiredQuantity = parseInt(params.quantity || "1");
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [reserving, setReserving] = useState(false);

  const { data, loading, refetch } = useFetch<any>(
    `/api/seats?section_id=${params.section_id}&limit=200`,
    false
  );

  const { data: reservationsData } = useFetch<any>(
    `/api/reservations/me`,
    false
  );

  const seats = data?.success && Array.isArray(data?.seats) ? data.seats : [];

  // Pre-populate selections if user already has active reservations for this event
  useEffect(() => {
    if (reservationsData?.success && Array.isArray(reservationsData?.reservations)) {
      const myReservations = reservationsData.reservations
        .filter((r: any) => {
          const resEventId = typeof r.event_id === 'object' ? r.event_id?._id : r.event_id;
          return resEventId === params.event_id;
        })
        .map((r: any) => r.seat_id);
      
      if (myReservations.length > 0) {
        setSelectedSeats(myReservations);
      }
    }
  }, [reservationsData, params.event_id]);

  const handleSeatPress = (seat: any) => {
    const isSelected = selectedSeats.find(s => s._id === seat._id);
    
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s._id !== seat._id));
    } else {
      if (selectedSeats.length < requiredQuantity) {
        setSelectedSeats(prev => [...prev, seat]);
      } else {
        if (requiredQuantity === 1) {
          setSelectedSeats([seat]);
        } else {
          Alert.alert("Limit Reached", `You can only select ${requiredQuantity} seats.`);
        }
      }
    }
  };

  const handleContinue = async () => {
    if (selectedSeats.length !== requiredQuantity) {
      Alert.alert("Incomplete Selection", `Please select ${requiredQuantity} seats.`);
      return;
    }

    setReserving(true);
    try {
      const reservations = await Promise.all(
        selectedSeats.map(seat => 
          authFetch("/api/reservations/reserve", {
            method: "POST",
            body: JSON.stringify({ event_id: params.event_id, seat_id: seat._id }),
          })
        )
      );

      const reservationIds = reservations.map(r => r.reservation._id);
      
      router.push({
        pathname: "/checkout",
        params: { 
          reservation_ids: JSON.stringify(reservationIds), 
          seat_numbers: selectedSeats.map(s => s.number).join(", "),
          event_title: params.event_title,
          total_price: (parseInt(params.price) * requiredQuantity).toString(),
          category_name: params.category_name,
          quantity: params.quantity
        },
      } as any);
    } catch (err: any) {
      Alert.alert("Reservation Failed", err.message || "Failed to reserve seats.");
      refetch();
    } finally {
      setReserving(false);
    }
  };

  const renderSeat = ({ item }: { item: any }) => {
    const isSelected = selectedSeats.find(s => s._id === item._id);
    const isOccupied = item.status !== 'available';
    
    let color = SEAT_COLORS.available;
    if (isOccupied) color = (SEAT_COLORS as any)[item.status] || SEAT_COLORS.booked;
    if (isSelected) color = SEAT_COLORS.selected;

    return (
      <TouchableOpacity
        onPress={() => handleSeatPress(item)}
        disabled={isOccupied && !isSelected}
        style={{
          width: 44,
          height: 44,
          margin: 6,
          borderRadius: 12,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.primary : colors.border,
          opacity: isOccupied && !isSelected ? 0.6 : 1,
        }}
      >
        <Text style={{ 
          color: isSelected || item.status === 'booked' || item.status === 'reserved' ? colors.white : colors.text, 
          fontSize: 12, 
          fontWeight: "700" 
        }}>
          {item.number}
        </Text>
      </TouchableOpacity>
    );
  };

  const currentTotal = parseInt(params.price) * selectedSeats.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18 }} numberOfLines={1}>
            {params.event_title}
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 13 }}>{params.category_name} Section</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 15, marginVertical: 20 }}>
          {[
            { label: "Available", color: SEAT_COLORS.available },
            { label: "Selected", color: SEAT_COLORS.selected },
            { label: "Occupied",  color: SEAT_COLORS.booked },
          ].map((l) => (
            <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: l.color }} />
              <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: '600' }}>{l.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginHorizontal: 40, height: 40, backgroundColor: colors.border, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          <Text style={{ color: colors.subtext, fontSize: 10, fontWeight: '800', letterSpacing: 5 }}>STAGE</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>
            <FlatList
              data={seats}
              keyExtractor={(s) => s._id}
              renderItem={renderSeat}
              numColumns={6}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 200 }}
            />
          </View>
        )}
      </ScrollView>

      <SummaryBar
        title={`${currentTotal} XAF`}
        subtitle={`${selectedSeats.length}/${requiredQuantity} Seats Selected`}
        buttonLabel="Continue"
        onPress={handleContinue}
        loading={reserving}
      />
    </SafeAreaView>
  );
}
