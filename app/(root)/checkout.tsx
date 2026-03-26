import { useAuthFetch } from "@/lib/fetch";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAYMENT_METHODS = [
  { id: "MobileMoney", label: "Mobile Money", icon: "phone-portrait-outline" },
  { id: "Card", label: "Credit / Debit Card", icon: "card-outline" },
];

export default function Checkout() {
  const { reservation_id, seat_number, event_title } = useLocalSearchParams<{
    reservation_id: string;
    seat_number: string;
    event_title: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { authFetch } = useAuthFetch();

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedMethod) {
      Alert.alert("Payment Method Required", "Please select a payment method.");
      return;
    }
    setLoading(true);
    try {
      const result = await authFetch("/api/tickets/checkout", {
        method: "POST",
        body: JSON.stringify({ reservation_id, payment_method: selectedMethod }),
      });
      Alert.alert(
        "🎉 Ticket Confirmed!",
        `Your ticket has been issued. QR Code: ${result.ticket.qr_code.slice(0, 12)}...`,
        [
          {
            text: "View My Tickets",
            onPress: () => (router as any).replace("/(root)/(tabs)/home"),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Checkout Failed", err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 20 }}>Checkout</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Order Summary */}
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 28 }}>
          <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 }}>ORDER SUMMARY</Text>
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18, marginBottom: 6 }} numberOfLines={2}>
            {event_title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ backgroundColor: colors.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Seat #{seat_number}</Text>
            </View>
          </View>
          <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.subtext, fontSize: 15 }}>Total Due</Text>
            <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18 }}>$0.00 (Demo)</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18, marginBottom: 14 }}>Payment Method</Text>
        {PAYMENT_METHODS.map((method) => {
          const selected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedMethod(method.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: selected ? colors.primaryLight : colors.card,
                borderRadius: 16,
                padding: 18,
                marginBottom: 12,
                borderWidth: 1.5,
                borderColor: selected ? colors.primary : colors.cardBorder,
              }}
            >
              <Ionicons name={method.icon as any} size={24} color={selected ? colors.primary : colors.subtext} />
              <Text style={{ flex: 1, marginLeft: 16, fontSize: 16, fontWeight: "600", color: selected ? colors.text : colors.subtext }}>
                {method.label}
              </Text>
              {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Confirm button */}
      <View style={{ padding: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={loading || !selectedMethod}
          style={{
            backgroundColor: selectedMethod ? colors.primary : colors.border,
            borderRadius: 20,
            paddingVertical: 18,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontFamily: "Syne_700Bold", fontSize: 18 }}>
              Confirm & Pay
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
