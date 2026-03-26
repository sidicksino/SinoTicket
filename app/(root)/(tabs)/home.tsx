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
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { user } = useUser();
  const { colors } = useTheme();
  const router = useRouter();

  const { data, loading, error } = useFetch<any>('/api/events?limit=10&page=1', false);
  
  const events = data?.success && Array.isArray(data?.events) ? data.events : [];
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
            placeholder="Search for events..."
            placeholderTextColor={colors.subtext}
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: colors.text }}
          />
          <TouchableOpacity style={{
            backgroundColor: colors.primary, padding: 6, borderRadius: 10,
          }}>
            <Ionicons name="options-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* ── PROMO CAROUSEL ── */}
        <PromoCarousel />

        {/* ── FEATURED EVENTS ── */}
        <View style={{ marginTop: 8 }}>
          <View style={{
            paddingHorizontal: 24, flexDirection: "row",
            justifyContent: "space-between", alignItems: "center", marginBottom: 16,
          }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 20, color: colors.text }}>
              Featured Events
            </Text>
            <TouchableOpacity>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : error ? (
            <View style={{ marginHorizontal: 24, padding: 20, backgroundColor: colors.card, borderRadius: 16 }}>
              <Text style={{ color: colors.subtext, textAlign: "center" }}>
                Could not connect to server.{"\n"}Check your network connection.
              </Text>
            </View>
          ) : featuredEvents.length === 0 ? (
            <View style={{ marginHorizontal: 24, padding: 32, alignItems: "center" }}>
              <Ionicons name="calendar-outline" size={48} color={colors.border} />
              <Text style={{ color: colors.subtext, marginTop: 12, textAlign: "center" }}>
                No events yet.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
              decelerationRate="fast"
              snapToInterval={276} // card width (260) + marginRight (16)
              scrollEventThrottle={16}
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
                    source={{
                      uri: item.imageUrl || "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=800",
                    }}
                    defaultSource={require("@/assets/images/icon.png")}
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
                        {item.status || "Upcoming"}
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
                        {item.date
                          ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "TBA"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── HAPPENING SOON ── */}
        {!loading && happeningSoon.length > 0 && (
          <View style={{ marginTop: 32, paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 20, color: colors.text, marginBottom: 16 }}>
              Happening Soon
            </Text>
            {happeningSoon.map((item: any) => (
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
                  source={{
                    uri: item.imageUrl || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400",
                  }}
                  defaultSource={require("@/assets/images/icon.png")}
                  style={{ width: 72, height: 72, borderRadius: 14 }}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{
                    color: colors.text, fontFamily: "Syne_700Bold",
                    fontSize: 15, marginBottom: 4,
                  }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={{ color: colors.subtext, fontSize: 13 }}>
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "TBA"}
                    {item.ticket_categories?.[0]?.price != null
                      ? ` • From ${item.ticket_categories[0].price} XAF`
                      : " • Free Entry"}
                  </Text>
                </View>
                <View style={{
                  width: 36, height: 36, borderRadius: 999,
                  backgroundColor: colors.primaryLight,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
