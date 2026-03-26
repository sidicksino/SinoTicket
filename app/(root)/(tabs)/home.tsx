import PromoCarousel from "@/components/PromoCarousel";
import { useTheme } from "@/context/ThemeContext";
import { useFetch } from "@/lib/fetch";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Featured Event Card ──────────────────────────────────────────────────────
const FeaturedCard = ({ item, index, onPress }: { item: any; index: number; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
    <Animated.View
      entering={FadeInRight.delay(index * 200).duration(800).springify()}
      style={{ marginRight: 20, width: 280, height: 350, borderRadius: 32, overflow: "hidden", backgroundColor: "#111" }}
    >
      <Image
        source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800" }}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        resizeMode="cover"
      />
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
        <View style={{ backgroundColor: "rgba(255,255,255,0.20)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}>
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>{item.status || "Upcoming"}</Text>
        </View>
        <Text style={{ color: "#fff", fontFamily: "Syne_700Bold", fontSize: 22, lineHeight: 28, marginBottom: 8 }}>{item.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="calendar" size={14} color="#0286FF" />
          <Text style={{ color: "rgba(255,255,255,0.80)", fontSize: 13, marginLeft: 6 }}>
            {item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
          </Text>
        </View>
      </View>
    </Animated.View>
  </TouchableOpacity>
);

// ─── List Event Row ───────────────────────────────────────────────────────────
const EventListItem = ({ item, index, colors, onPress }: { item: any; index: number; colors: any; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <Animated.View
      entering={FadeInDown.delay(400 + index * 100).duration(800).springify()}
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, backgroundColor: colors.card, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: colors.cardBorder }}
    >
      <Image
        source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400" }}
        style={{ width: 80, height: 80, borderRadius: 16 }}
      />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 17, marginBottom: 4 }}>{item.title}</Text>
        <Text style={{ color: colors.subtext, fontSize: 14 }}>
          {item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA"}
          {item.ticket_categories?.[0] ? ` • From $${item.ticket_categories[0].price}` : " • Free"}
        </Text>
      </View>
      <View style={{ height: 40, width: 40, backgroundColor: colors.primaryLight, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </View>
    </Animated.View>
  </TouchableOpacity>
);

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useUser();
  const { colors } = useTheme();
  const router = useRouter();

  // Fetch real events from backend (public route - no auth needed for listing)
  const { data: eventsData, loading, error } = useFetch<{ events: any[]; total: number }>('/api/events?limit=10&page=1');

  const events: any[] = eventsData?.events ?? [];
  // Split: first 2 are "Featured" (horizontal big cards), rest are "Happening Soon" (list rows)
  const featuredEvents = events.slice(0, 3);
  const happeningSoon = events.slice(3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HEADER */}
        <View style={{ paddingHorizontal: 24, paddingTop: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Animated.View entering={FadeInDown.duration(800).springify()}>
            <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500" }}>Welcome back,</Text>
            <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 24 }}>{user?.firstName ? user.firstName.split(' ')[0] : "Guest"}</Text>
          </Animated.View>
          <TouchableOpacity style={{ height: 46, width: 46, borderRadius: 999, borderWidth: 2, borderColor: colors.border, overflow: "hidden" }}>
            <Image
              source={{ uri: user?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
              style={{ width: "100%", height: "100%" }}
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBg, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="search" size={20} color={colors.subtext} />
            <TextInput placeholder="Search for events..." placeholderTextColor={colors.subtext} style={{ flex: 1, marginLeft: 10, fontSize: 15, color: colors.text }} />
            <TouchableOpacity style={{ backgroundColor: colors.primary, padding: 6, borderRadius: 10 }}>
              <Ionicons name="options-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* PROMO CAROUSEL */}
        <Animated.View entering={FadeInDown.delay(300).duration(800).springify()}>
          <PromoCarousel />
        </Animated.View>

        {/* FEATURED EVENTS */}
        <View style={{ marginTop: 32 }}>
          <View style={{ paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 22, color: colors.text }}>Featured Events</Text>
            <TouchableOpacity><Text style={{ color: colors.primary, fontWeight: "700" }}>See All</Text></TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ color: "red", textAlign: "center", marginHorizontal: 24 }}>
              Could not load events. Check your connection.
            </Text>
          ) : featuredEvents.length === 0 ? (
            <Text style={{ color: colors.subtext, textAlign: "center", marginHorizontal: 24 }}>
              No events scheduled yet.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 4 }}>
              {featuredEvents.map((item, index) => (
                <FeaturedCard
                  key={item._id}
                  item={item}
                  index={index}
                  onPress={() => (router as any).push({ pathname: '/event/[id]', params: { id: item._id } })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* HAPPENING SOON */}
        {happeningSoon.length > 0 && (
          <View style={{ marginTop: 40, paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 22, color: colors.text, marginBottom: 20 }}>Happening Soon</Text>
            {happeningSoon.map((item, index) => (
              <EventListItem
                key={item._id}
                item={item}
                index={index}
                colors={colors}
                onPress={() => (router as any).push({ pathname: '/event/[id]', params: { id: item._id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
