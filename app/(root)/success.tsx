import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "react-i18next";

export default function BookingSuccess() {
  const params = useLocalSearchParams<{
    event_title: string;
    seat_numbers: string;
    total_price: string;
    quantity: string;
    category_name: string;
  }>();
  
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          {/* Success Icon */}
          <View style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 50, 
            backgroundColor: colors.primaryLight, 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 24,
            borderWidth: 2,
            borderColor: colors.primary
          }}>
            <Ionicons name="checkmark-circle" size={60} color={colors.primary} />
          </View>
          
          <Text style={{ 
            color: colors.text, 
            fontFamily: "Syne_700Bold", 
            fontSize: 28, 
            textAlign: 'center',
            marginBottom: 12 
          }}>
            {t("bookingSuccess.title")}
          </Text>
          <Text style={{ 
            color: colors.subtext, 
            fontSize: 16, 
            textAlign: 'center',
            paddingHorizontal: 20 
          }}>
            {t("bookingSuccess.subtitle", { eventTitle: params.event_title })}
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={{ 
          backgroundColor: colors.card, 
          borderRadius: 24, 
          padding: 24, 
          borderWidth: 1, 
          borderColor: colors.cardBorder,
          marginBottom: 40 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>{t("bookingSuccess.tickets")}</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{params.quantity}x {params.category_name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>{t("bookingSuccess.totalPaid")}</Text>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>{params.total_price} XAF</Text>
            </View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 }}>
            <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>{t("bookingSuccess.seatAssignments")}</Text>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{params.seat_numbers}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 16 }}>
          <CustomButton
            title={t("bookingSuccess.viewMyTickets")}
            onPress={() => router.replace("/(root)/(tabs)/ticket")}
          />
          <TouchableOpacity 
            onPress={() => router.replace("/(root)/(tabs)/home")}
            style={{ 
              paddingVertical: 18, 
              alignItems: 'center' 
            }}
          >
            <Text style={{ color: colors.subtext, fontSize: 16, fontWeight: '700' }}>{t("bookingSuccess.backToHome")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
