import PromoCarousel from "@/components/PromoCarousel";
import { useTheme } from "@/context/ThemeContext";
import { useFetch } from "@/lib/fetch";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
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
  const { user } = useUser();
  const { colors } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const apiUrl = `/api/events?limit=20&page=1${
    debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
  }${selectedCategory !== "All" ? `&category=${selectedCategory}` : ""}`;

  const { data, loading, error } = useFetch<any>(apiUrl, false);
  
  const events = data?.success && Array.isArray(data?.events) ? data.events : [];
  
  // For the "Featured" section, we take the top 3 upcoming
  // For "Happening Soon", we take the rest
  const featuredEvents = events.slice(0, 3);
  const happeningSoon = events.slice(3);

  const navigateToEvent = (id: string) =>
    (router as any).push({ pathname: '/event/[id]', params: { id } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── HEADER ── */}
        <View style={{
          paddingHorizontal: 24,
          paddingTop: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <View>
            <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: "500" }}>
              Welcome back,
            </Text>
            <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 24 }}>
              {user?.firstName ? user.firstName.split(' ')[0] : "Guest"}
            </Text>
          </View>
          <TouchableOpacity style={{
            height: 46, width: 46, borderRadius: 999,
            borderWidth: 2, borderColor: colors.border, overflow: "hidden",
          }}>
            <Image
              source={{ uri: user?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
              style={{ width: "100%", height: "100%" }}
            />
          </TouchableOpacity>
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={{
          marginHorizontal: 24, marginTop: 20,
          flexDirection: "row", alignItems: "center",
          backgroundColor: colors.inputBg,
          paddingHorizontal: 16, paddingVertical: 12,
          borderRadius: 20, borderWidth: 1, borderColor: colors.border,
        }}>
          <Ionicons name="search" size={20} color={colors.subtext} />
          <TextInput
            placeholder="Search events, artists..."
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: colors.text }}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── CATEGORIES ── */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, marginTop: 20, gap: 10 }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 99,
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <Text style={{
                  color: isActive ? "#fff" : colors.text,
                  fontSize: 14,
                  fontWeight: isActive ? "700" : "500"
                }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* ── PROMO CAROUSEL (Show only on 'All' category and no search) ── */}
        {selectedCategory === "All" && !debouncedSearch && <PromoCarousel />}

        {/* ── RESULTS ── */}
        <View style={{ marginTop: 24 }}>
          <View style={{
            paddingHorizontal: 24, flexDirection: "row",
            justifyContent: "space-between", alignItems: "center", marginBottom: 16,
          }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 20, color: colors.text }}>
              {debouncedSearch || selectedCategory !== "All" ? "Results" : "Featured Events"}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : error ? (
            <View style={{ marginHorizontal: 24, padding: 20, backgroundColor: colors.card, borderRadius: 16 }}>
              <Text style={{ color: colors.subtext, textAlign: "center" }}>
                Could not connect to server.
              </Text>
            </View>
          ) : events.length === 0 ? (
            <View style={{ marginHorizontal: 24, padding: 32, alignItems: "center" }}>
              <Ionicons name="search-outline" size={48} color={colors.border} />
              <Text style={{ color: colors.subtext, marginTop: 12, textAlign: "center" }}>
                No events found matching your criteria.
              </Text>
            </View>
          ) : (
            <>
              {/* Featured Horizontal List (if not searching) */}
              {(!debouncedSearch && selectedCategory === "All") && (
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
                        marginRight: 16, width: 260, height: 320,
                        borderRadius: 28, overflow: "hidden", backgroundColor: "#111",
                      }}
                    >
                      <Image
                        source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800" }}
                        style={{ width: "100%", height: "100%", position: "absolute" }}
                        resizeMode="cover"
                      />
                      <View style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.40)",
                      }} />
                      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
                        <View style={{
                          alignSelf: "flex-start", backgroundColor: colors.primary,
                          paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginBottom: 10,
                        }}>
                          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
                            {item.category}
                          </Text>
                        </View>
                        <Text style={{
                          color: "#fff", fontFamily: "Syne_700Bold",
                          fontSize: 18, lineHeight: 24, marginBottom: 6,
                        }} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
                          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginLeft: 5 }}>
                            {item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Grid/List of Results */}
              <View style={{ marginTop: (!debouncedSearch && selectedCategory === "All") ? 32 : 0, paddingHorizontal: 24 }}>
                {(!debouncedSearch && selectedCategory === "All") && (
                  <Text style={{ fontFamily: "Syne_700Bold", fontSize: 20, color: colors.text, marginBottom: 16 }}>
                    Happening Soon
                  </Text>
                )}
                {( (debouncedSearch || selectedCategory !== "All") ? events : happeningSoon).map((item: any) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => navigateToEvent(item._id)}
                    activeOpacity={0.85}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      marginBottom: 14, backgroundColor: colors.card,
                      padding: 14, borderRadius: 20,
                      borderWidth: 1, borderColor: colors.cardBorder,
                    }}
                  >
                    <Image
                      source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400" }}
                      style={{ width: 72, height: 72, borderRadius: 14 }}
                    />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 15, marginBottom: 4 }} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                         <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginRight: 6 }}>
                            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>{item.category}</Text>
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
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
