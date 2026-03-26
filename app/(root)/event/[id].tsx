import { useFetch } from "@/lib/fetch";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
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

  const { data, loading, error } = useFetch<any>(`/api/events/${id}`, false);
  const event = data?.success ? data.event : null;

  // Fetch sections for this venue so user can pick one
  const { data: sectionsData } = useFetch<any>(
    event?.venue_id ? `/api/sections?venue_id=${typeof event.venue_id === 'object' ? event.venue_id._id : event.venue_id}` : '',
    false
  );
  const sections = sectionsData?.success && Array.isArray(sectionsData?.sections) ? sectionsData.sections : [];

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

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Date TBA";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Image */}
        <View style={{ height: 320, backgroundColor: "#111" }}>
          <Image
            source={{ uri: event.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800" }}
            defaultSource={require("@/assets/images/icon.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" }} />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: "absolute", top: 20, left: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 999, padding: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Status badge */}
          <View style={{ position: "absolute", top: 20, right: 20, backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12, textTransform: "uppercase" }}>{event.status}</Text>
          </View>
        </View>

        {/* Event Info */}
        <View style={{ padding: 24 }}>
          <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 26, marginBottom: 16, lineHeight: 34 }}>{event.title}</Text>

          {/* Date */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ backgroundColor: colors.primaryLight, borderRadius: 12, padding: 10, marginRight: 14 }}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "600" }}>DATE</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{formattedDate}</Text>
            </View>
          </View>

          {/* Venue */}
          {event.venue_id && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
              <View style={{ backgroundColor: colors.primaryLight, borderRadius: 12, padding: 10, marginRight: 14 }}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "600" }}>VENUE</Text>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{event.venue_id?.name || "Venue TBA"}</Text>
                {event.venue_id?.location && (
                  <Text style={{ color: colors.subtext, fontSize: 13 }}>{event.venue_id.location}</Text>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          {event.description && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontFamily: "Syne_700Bold", fontSize: 18, color: colors.text, marginBottom: 10 }}>About this Event</Text>
              <Text style={{ color: colors.subtext, fontSize: 15, lineHeight: 24 }}>{event.description}</Text>
            </View>
          )}

          {/* Ticket Categories */}
          {event.ticket_categories?.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontFamily: "Syne_700Bold", fontSize: 18, color: colors.text, marginBottom: 12 }}>Ticket Prices</Text>
              {event.ticket_categories.map((cat: any, i: number) => (
                <View
                  key={i}
                  style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.card, padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder }}
                >
                  <View>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>{cat.name}</Text>
                    <Text style={{ color: colors.subtext, fontSize: 13, marginTop: 2 }}>
                      {cat.quantity - (cat.sold ?? 0)} seats left
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontFamily: "Syne_700Bold", fontSize: 20 }}>${cat.price}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA Button */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }}>
        {sections.length > 0 ? (
          <View>
            <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: "600", marginBottom: 10 }}>SELECT A SECTION</Text>
            {sections.slice(0, 3).map((sec: any) => (
              <TouchableOpacity
                key={sec._id}
                onPress={() =>
                  (router as any).push({
                    pathname: "/(root)/seat-selection",
                    params: { event_id: id, section_id: sec._id, event_title: event.title },
                  })
                }
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 8 }}
              >
                <Text style={{ color: "#fff", fontFamily: "Syne_700Bold", fontSize: 15 }}>{sec.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 18, alignItems: "center" }}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#fff", fontFamily: "Syne_700Bold", fontSize: 18 }}>Get Tickets</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
