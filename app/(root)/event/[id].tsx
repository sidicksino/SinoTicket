import { QuantitySelector } from "@/components/Booking/QuantitySelector";
import { SummaryBar } from "@/components/Booking/SummaryBar";
import { TicketCategoryCard } from "@/components/Booking/TicketCategoryCard";
import { useTheme } from "@/context/ThemeContext";
import { useFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  // Selection State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const { data, loading, error } = useFetch<any>(`/api/events/${id}`, false);
  const event = data?.success ? data.event : null;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", fontSize: 16 }}>Could not load event.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }


  const handleBookNow = () => {
    setIsModalVisible(true);
  };

  const handleSelectSeats = () => {
    if (!selectedCategory) return;
    setIsModalVisible(false);
    router.push({
      pathname: "/(root)/seat-selection",
      params: {
        event_id: id,
        section_id: selectedCategory.section_id,
        category_id: selectedCategory.category_id,
        quantity: quantity.toString(),
        price: selectedCategory.price.toString(),
        event_title: event.title,
        category_name: selectedCategory.name
      },
    } as any);
  };

  const totalPrice = selectedCategory ? selectedCategory.price * quantity : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Image Section */}
        <View style={{ height: 320, backgroundColor: colors.black }}>
          <Image
            source={{ uri: event.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800" }}
            defaultSource={require("@/assets/images/icon.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlayLight }} />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: "absolute", top: 20, left: 20, backgroundColor: colors.overlayDark, borderRadius: 999, padding: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Event Content */}
        <View style={{ padding: 24, marginTop: -30, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 26, marginBottom: 8 }}>{event.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="location-sharp" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.subtext, fontSize: 14 }}>{event.venue_id?.name || "Venue TBA"}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: colors.primaryLight, padding: 8, borderRadius: 12, alignItems: 'center', minWidth: 60 }}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 16 }}>{new Date(event.date).getDate()}</Text>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                {new Date(event.date).toLocaleString('default', { month: 'short' })}
              </Text>
            </View>
          </View>

          {/* Details Row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 30 }}>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>TIME</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>
                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>FROM</Text>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "800" }}>
                {event.ticket_categories?.[0]?.price || 0} XAF
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "700", marginBottom: 4 }}>STATUS</Text>
              <Text style={{ color: colors.success, fontSize: 15, fontWeight: "800" }}>ACTIVE</Text>
            </View>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 20, color: colors.text, marginBottom: 12 }}>Description</Text>
            <Text style={{ color: colors.subtext, fontSize: 15, lineHeight: 24 }}>{event.description || "No description provided."}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Primary CTA */}
      <SummaryBar
        title="Admission"
        subtitle="Starts from"
        buttonLabel="Book Now"
        onPress={handleBookNow}
      />

      {/* Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: colors.overlayDark }}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={{ marginTop: 'auto', backgroundColor: colors.background, padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 50 }}>
            <View style={{ width: 40, height: 4, backgroundColor: colors.border, alignSelf: 'center', borderRadius: 2, marginBottom: 24 }} />

            <Text style={{ fontSize: 22, fontFamily: "Syne_700Bold", color: colors.text, marginBottom: 8 }}>Select Tickets</Text>
            <Text style={{ fontSize: 14, color: colors.subtext, marginBottom: 24 }}>Pick your preferred seating category</Text>

            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {event.ticket_categories?.map((cat: any) => (
                <TicketCategoryCard
                  key={cat.category_id || cat.name}
                  name={cat.name}
                  price={cat.price}
                  available={cat.quantity - (cat.sold || 0)}
                  selected={selectedCategory?.name === cat.name}
                  onSelect={() => {
                    setSelectedCategory(cat);
                    setQuantity(1);
                  }}
                />
              ))}
            </ScrollView>

            {selectedCategory && (
              <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Quantity</Text>
                    <Text style={{ fontSize: 12, color: colors.subtext }}>Max 10 per order</Text>
                  </View>
                  <QuantitySelector
                    quantity={quantity}
                    onIncrement={() => setQuantity(prev => Math.min(prev + 1, 10))}
                    onDecrement={() => setQuantity(prev => Math.max(prev - 1, 1))}
                  />
                </View>

                <SummaryBar
                  title={`${totalPrice} XAF`}
                  subtitle={`${quantity}x ${selectedCategory.name}`}
                  buttonLabel="Select Seats"
                  onPress={handleSelectSeats}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
