import PromoCarousel from "@/components/PromoCarousel";
import { useTheme } from "@/context/ThemeContext";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Button,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const FeaturedCard = ({ item, index }: { item: any; index: number }) => (
  <Animated.View
    entering={FadeInRight.delay(index * 200).duration(800).springify()}
    style={{ marginRight: 20, width: 280, height: 350, borderRadius: 32, overflow: "hidden", backgroundColor: "#fff" }}
  >
    <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%", position: "absolute" }} resizeMode="cover" />
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.30)" }} />
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
      <View style={{ backgroundColor: "rgba(255,255,255,0.20)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}>
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>{item.category}</Text>
      </View>
      <Text style={{ color: "#fff", fontFamily: "Syne_700Bold", fontSize: 22, lineHeight: 28, marginBottom: 8 }}>{item.title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="location" size={16} color="#0286FF" />
        <Text style={{ color: "rgba(255,255,255,0.80)", fontSize: 14, marginLeft: 4 }}>{item.location}</Text>
      </View>
    </View>
  </Animated.View>
);

const EventListItem = ({ item, index, colors }: { item: any; index: number; colors: any }) => (
  <Animated.View
    entering={FadeInDown.delay(400 + index * 100).duration(800).springify()}
    style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, backgroundColor: colors.card, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: colors.cardBorder }}
  >
    <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 16 }} />
    <View style={{ flex: 1, marginLeft: 16 }}>
      <Text style={{ color: colors.text, fontFamily: "Syne_700Bold", fontSize: 17, marginBottom: 4 }}>{item.title}</Text>
      <Text style={{ color: colors.subtext, fontSize: 14 }}>{item.date} • {item.price}</Text>
    </View>
    <TouchableOpacity style={{ height: 40, width: 40, backgroundColor: colors.primaryLight, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </TouchableOpacity>
  </Animated.View>
);

const featuredEvents = [
  { id: "1", title: "N'Djamena Tech Summit 2025", location: "Radisson Blu, N'Djamena", category: "Technology", image: "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=2070&auto=format&fit=crop" },
  { id: "2", title: "Sahara Music Festival", location: "Goz Beida Arena", category: "Music", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop" },
];

const nearbyEvents = [
  { id: "3", title: "Digital Art Exhibition", date: "Oct 12", price: "Free", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" },
  { id: "4", title: "Startup Weekend Chad", date: "Nov 05", price: "$15", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop" },
];

export default function Home() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { colors } = useTheme();

  const printMyToken = async () => {
    const token = await getToken();
    console.log("MON SUPER TOKEN CLERK:", token);
  };

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

        {/* FEATURED */}
        <View style={{ marginTop: 32 }}>
          <View style={{ paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 22, color: colors.text }}>Featured Events</Text>
            <TouchableOpacity><Text style={{ color: colors.primary, fontWeight: "700" }}>See All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 4 }}>
            {featuredEvents.map((item, index) => <FeaturedCard key={item.id} item={item} index={index} />)}
          </ScrollView>
        </View>
        <Button title="Get Token" onPress={printMyToken} />
        {/* HAPPENING SOON */}
        <View style={{ marginTop: 40, paddingHorizontal: 24 }}>
          <Text style={{ fontFamily: "Syne_700Bold", fontSize: 22, color: colors.text, marginBottom: 20 }}>Happening Soon</Text>
          {nearbyEvents.map((item, index) => <EventListItem key={item.id} item={item} index={index} colors={colors} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
