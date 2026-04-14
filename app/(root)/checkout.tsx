import { SummaryBar } from "@/components/Booking/SummaryBar";
import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Checkout() {
  const params = useLocalSearchParams<{
    reservation_ids: string;
    seat_numbers: string;
    event_title: string;
    total_price: string;
    category_name: string;
    quantity: string;
  }>();
  
  const router = useRouter();
  const { colors } = useTheme();
  const { authFetch } = useAuthFetch();
  const { t } = useTranslation();

  const paymentMethods = [
    { id: "MobileMoney", label: t("checkout.mobileMoney"), icon: "phone-portrait-outline" },
    { id: "Card", label: t("checkout.card"), icon: "card-outline" },
  ];

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reservationIds = JSON.parse(params.reservation_ids || "[]");

  const handleCheckout = async () => {
    if (!selectedMethod) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t("checkout.paymentMethod"), t("checkout.selectPaymentMethod"));
      return;
    }
    setLoading(true);
    try {
      // For now, checkout each reservation individually.
      // Optimization: Implement a bulk checkout endpoint in the backend.
      // Checkout sequentially to prevent MongoDB transactional WriteConflicts 
      // on shared documents (like Event ticket counts).
      for (const id of reservationIds) {
        await authFetch("/api/tickets/checkout", {
          method: "POST",
          body: JSON.stringify({ reservation_id: id, payment_method: selectedMethod }),
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/(root)/success",
        params: {
          event_title: params.event_title,
          seat_numbers: params.seat_numbers,
          total_price: params.total_price,
          quantity: params.quantity,
          category_name: params.category_name
        }
      } as any);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("checkout.checkoutFailed"), err.message || t("checkout.paymentFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 20 }}>{t("checkout.reviewOrder")}</Text>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {/* Order Summary Card */}
          <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t("checkout.orderSummary")}</Text>
            
            <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 22, marginBottom: 8 }}>
              {params.event_title}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="ticket-outline" size={16} color={colors.subtext} />
              <Text style={{ color: colors.subtext, fontSize: 14, marginLeft: 6 }}>
                {params.quantity}x {params.category_name} ({t("checkout.seats")}: {params.seat_numbers})
              </Text>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{t("checkout.totalAmount")}</Text>
              <Text style={{ color: colors.primary, fontFamily: "Syne_700Bold", fontSize: 24 }}>
                {params.total_price} XAF
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18, marginBottom: 16 }}>{t("checkout.securePayment")}</Text>
          {paymentMethods.map((method) => {
            const selected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: selected ? colors.primaryLight : colors.card,
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: selected ? colors.primary : colors.cardBorder,
                }}
              >
                <View style={{ backgroundColor: selected ? colors.primary : colors.cardBorder, padding: 10, borderRadius: 12 }}>
                  <Ionicons name={method.icon as any} size={24} color={selected ? colors.white : colors.subtext} />
                </View>
                <Text style={{ flex: 1, marginLeft: 16, fontSize: 16, fontWeight: "700", color: selected ? colors.text : colors.text }}>
                  {method.label}
                </Text>
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: selected ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
                </View>
              </TouchableOpacity>
            );
          })}
          
          <View style={{ marginTop: 20, padding: 16, backgroundColor: colors.card, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
            <Text style={{ marginLeft: 10, fontSize: 12, color: colors.subtext, flex: 1 }}>
              {t("checkout.paymentSecurityNote")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Pay Button */}
      <SummaryBar
        title={`${params.total_price} XAF`}
        subtitle={t("checkout.finalTotal")}
        buttonLabel={t("checkout.payNow")}
        onPress={handleCheckout}
        loading={loading}
      />
    </SafeAreaView>
  );
}
