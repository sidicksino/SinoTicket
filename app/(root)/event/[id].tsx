import { QuantitySelector } from "@/components/Booking/QuantitySelector";
import { SummaryBar } from "@/components/Booking/SummaryBar";
import { TicketCategoryCard } from "@/components/Booking/TicketCategoryCard";
import { useTheme } from "@/context/ThemeContext";
import { useFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Event } from "@/types/type";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Selection State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const { data, loading, error, refetch } = useFetch<{ success: boolean; event: Event }>(`/api/events/${id}`, false);
  const event = data?.success ? data.event : null;

  const eventDate = new Date(event?.date || Date.now());

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
        <Text style={{ color: "red", fontSize: 16, marginBottom: 16 }}>Could not load event.</Text>
        <TouchableOpacity onPress={refetch} style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginBottom: 12 }}>
          <Text style={{ color: colors.white, fontWeight: "700" }}>Retry Connection</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 12 }}>
          <Text style={{ color: colors.subtext, fontWeight: "700" }}>Go Back</Text>
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Fixed Top Actions (Back & Share) */}
      <View style={{ 
        position: 'absolute', 
        top: Math.max(insets.top, 20), 
        left: 20, 
        right: 20, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        zIndex: 100 
      }}>
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={{ borderRadius: 24, overflow: 'hidden' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 12 }}>
            <Ionicons name="chevron-back" size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </BlurView>

        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={{ borderRadius: 24, overflow: 'hidden' }}>
          <TouchableOpacity style={{ padding: 12 }}>
            <Ionicons name="share-social-outline" size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </BlurView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Hero Image Section */}
        <View style={{ height: SCREEN_HEIGHT * 0.55, width: "100%" }}>
          <Image
            source={{ uri: event.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800" }}
            style={{ width: "100%", height: "100%", position: "absolute" }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', colors.background]}
            locations={[0.4, 0.8, 1]}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />

        {/* The Top Actions were moved outside ScrollView */}

          {/* Overlaid Title Area */}
          <View style={{ position: 'absolute', bottom: 20, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "700", marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                Show
              </Text>
              <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 28, marginBottom: 4, lineHeight: 32 }}>{event.title}</Text>
              <Text style={{ color: colors.subtext, fontSize: 16, fontWeight: "500" }}>{event.venue_id?.name || "Venue TBA"}</Text>
            </View>
            <BlurView intensity={isDark ? 60 : 80} tint={isDark ? "dark" : "light"} style={{ borderRadius: 16, overflow: 'hidden', paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
                {eventDate.toLocaleString('default', { month: 'short' })}
              </Text>
              <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 22, marginTop: 2 }}>
                {eventDate.getDate()}
              </Text>
            </BlurView>
          </View>
        </View>

        {/* Content Body */}
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          {/* Info row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
            <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={{ flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginRight: 8, overflow: 'hidden', backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>Start</Text>
              <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 16 }}>
                {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </BlurView>
          </View>

          {/* Description */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18, marginBottom: 16 }}>Description</Text>
            <Text style={{ color: colors.subtext, fontSize: 15, lineHeight: 24, fontWeight: '400' }}>
              {event.description || "Steve-O's Bucket List Tour is a multimedia comedy experience that blends stand-up routines with video footage of extreme stunts many of which were deemed too outrageous or explicit for his previous work on Jackass."}
            </Text>
          </View>

          {/* Location Placeholder */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 18, marginBottom: 16 }}>Location</Text>
            <View style={{ width: '100%', height: 160, borderRadius: 24, overflow: 'hidden', backgroundColor: colors.overlayLight }}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800" }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="location" size={32} color={colors.primary || "#4CAF50"} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: Math.max(insets.bottom, 24), paddingTop: 40, paddingHorizontal: 24, alignItems: 'center' }}>
        <LinearGradient
          colors={['transparent', colors.background, colors.background]}
          locations={[0, 0.9, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <TouchableOpacity
          onPress={handleBookNow}
          style={{ width: '100%', height: 60, backgroundColor: "#4CAF50", borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: "#4CAF50", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFF', fontFamily: "Syne_700Bold", fontSize: 18 }}>Book Now</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
}
