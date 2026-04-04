import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import PromoCarousel from "@/components/PromoCarousel";
import { useTheme } from "@/context/ThemeContext";
import { useFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = ["All", "Music", "Sports", "Cultural", "Business", "Fashion"];

export default function Home() {
  const { colors } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const apiUrl = `/api/events?limit=20&page=1${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
    }${selectedCategory !== "All" ? `&category=${selectedCategory}` : ""}`;

  const { data, loading, error } = useFetch<any>(apiUrl, false);

  const events = useMemo(() => {
    return data?.success && Array.isArray(data?.events) ? data.events : [];
  }, [data]);

  const isDefaultView = !debouncedSearch && selectedCategory === "All";
  const featuredEvents = events.slice(0, 3);
  const listEvents = useMemo(
    () => (isDefaultView ? events.slice(3) : events),
    [events, isDefaultView]
  );

  const navigateToEvent = useCallback(
    (id: string) => (router as any).push({ pathname: "/event/[id]", params: { id } }),
    [router]
  );

  // ── Event row renderer (for FlatList) ──
  const renderEventRow = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        onPress={() => navigateToEvent(item._id)}
        activeOpacity={0.85}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
          marginHorizontal: 24,
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }}
      >
        <Image
          source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400" }}
          style={{ width: 72, height: 72, borderRadius: 14 }}
        />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 15, marginBottom: 4 }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginRight: 6 }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "700" }}>{item.category}</Text>
            </View>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>
              {item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA"}
            </Text>
          </View>
          <Text style={{ color: colors.subtext, fontSize: 12 }}>
            {item.venue_id?.name || "Venue TBA"}
          </Text>
        </View>
        <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>
      </TouchableOpacity>
    ),
    [colors, navigateToEvent]
  );

  // ── Everything above the events list ──
  const ListHeader = useMemo(
    () => (
      <View>
        {/* ── HEADER ── */}
        <AppHeader />

        {/* ── SEARCH BAR ── */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.inputBg,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="search" size={20} color={colors.subtext} />
          <TextInput
            placeholder="Search events, artists..."
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: colors.text }}
          />
          {searchQuery !== "" ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ marginRight: 10 }}>
              <Ionicons name="close-circle" size={18} color={colors.subtext} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: colors.primary, padding: 6, borderRadius: 10 }}
          >
            <Ionicons name="options-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* ── CATEGORIES ── */}
        {!showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, marginTop: 16, gap: 10 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderWidth: 1,
                    borderColor: isActive ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? colors.white : colors.text,
                      fontSize: 13,
                      fontWeight: isActive ? "700" : "500",
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── PROMO CAROUSEL ── */}
        {isDefaultView && <PromoCarousel />}

        {/* ── SECTION TITLE ── */}
        <View
          style={{
            paddingHorizontal: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontFamily: "Syne_700Bold", fontSize: 20, color: colors.text }}>
            {isDefaultView ? "Upcoming Events" : "Results"}
          </Text>
        </View>

        {/* ── LOADING / ERROR / EMPTY ── */}
        {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />}
        {!loading && error && (
          <View style={{ marginHorizontal: 24, padding: 20, backgroundColor: colors.card, borderRadius: 16 }}>
            <Text style={{ color: colors.subtext, textAlign: "center" }}>Could not connect to server.</Text>
          </View>
        )}
        {!loading && !error && events.length === 0 && (
          <EmptyState 
            title="No events found"
            message="No events found matching your criteria. Try adjusting your search or filters."
            marginTop={40}
          />
        )}

        {/* ── FEATURED HORIZONTAL CARDS ── */}
        {!loading && !error && events.length > 0 && isDefaultView && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
              decelerationRate="fast"
              snapToInterval={276}
            >
              {featuredEvents.map((item: any) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => navigateToEvent(item._id)}
                  activeOpacity={0.9}
                  style={{
                    marginRight: 16,
                    width: 260,
                    height: 320,
                    borderRadius: 28,
                    overflow: "hidden",
                    backgroundColor: colors.black,
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800" }}
                    style={{ width: "100%", height: "100%", position: "absolute" }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: colors.overlayMedium,
                    }}
                  />
                  <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: colors.primary,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 999,
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: colors.white, fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
                        {item.category}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.white,
                        fontFamily: "Syne_700Bold",
                        fontSize: 18,
                        lineHeight: 24,
                        marginBottom: 6,
                      }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="calendar-outline" size={13} color={colors.white} style={{ opacity: 0.7 }} />
                      <Text style={{ color: colors.white, opacity: 0.75, fontSize: 12, marginLeft: 5 }}>
                        {item.date
                          ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "TBA"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* "More Events" sub-header */}
            <Text
              style={{
                fontFamily: "Syne_700Bold",
                fontSize: 20,
                color: colors.text,
                marginTop: 32,
                marginBottom: 16,
                paddingHorizontal: 24,
              }}
            >
              More Events
            </Text>
          </>
        )}
      </View>
    ),
    [colors, searchQuery, showFilters, selectedCategory, isDefaultView, loading, error, events, featuredEvents, navigateToEvent]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={!loading && !error ? listEvents : []}
        keyExtractor={(item) => item._id}
        renderItem={renderEventRow}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      />
    </SafeAreaView>
  );
}
