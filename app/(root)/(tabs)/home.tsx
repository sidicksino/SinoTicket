import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// width was unused, removed to satisfy lints

const FeaturedCard = ({ item, index }: { item: any; index: number }) => (
  <Animated.View
    entering={FadeInRight.delay(index * 200).duration(800).springify()}
    className="mr-5 w-[280px] h-[350px] rounded-[32px] overflow-hidden bg-white shadow-xl shadow-black/10"
  >
    <Image
      source={{ uri: item.image }}
      className="w-full h-full absolute"
      resizeMode="cover"
    />
    <View className="absolute inset-0 bg-black/30" />
    <View className="absolute bottom-0 left-0 right-0 p-6">
      <View className="bg-white/20 backdrop-blur-md self-start px-3 py-1 rounded-full mb-3 border border-white/30">
        <Text className="text-white text-[12px] font-bold uppercase tracking-wider">
          {item.category}
        </Text>
      </View>
      <Text className="text-white font-syne text-[22px] font-black leading-tight mb-2">
        {item.title}
      </Text>
      <View className="flex-row items-center">
        <Ionicons name="location" size={16} color="#0286FF" />
        <Text className="text-white/80 text-[14px] ml-1 font-medium">
          {item.location}
        </Text>
      </View>
    </View>
  </Animated.View>
);

const EventListItem = ({ item, index }: { item: any; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(400 + index * 100).duration(800).springify()}
    className="flex-row items-center mb-4 bg-white p-4 rounded-3xl border border-[#F1F5F9]"
  >
    <Image
      source={{ uri: item.image }}
      className="w-20 h-20 rounded-2xl"
    />
    <View className="flex-1 ml-4 text-left">
      <Text className="text-[#0F172A] font-syne font-bold text-[17px] mb-1">
        {item.title}
      </Text>
      <Text className="text-[#64748B] text-[14px] font-medium">
        {item.date} • {item.price}
      </Text>
    </View>
    <TouchableOpacity className="h-10 w-10 bg-[#0286FF]/10 rounded-full items-center justify-center">
      <Ionicons name="chevron-forward" size={20} color="#0286FF" />
    </TouchableOpacity>
  </Animated.View>
);

const featuredEvents = [
  {
    id: "1",
    title: "N'Djamena Tech Summit 2025",
    location: "Radisson Blu, N'Djamena",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Sahara Music Festival",
    location: "Goz Beida Arena",
    category: "Music",
    image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop",
  },
];

const nearbyEvents = [
  {
    id: "3",
    title: "Digital Art Exhibition",
    date: "Oct 12",
    price: "Free",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Startup Weekend Chad",
    date: "Nov 05",
    price: "$15",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function Home() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View className="px-6 pt-4 flex-row items-center justify-between">
          <Animated.View entering={FadeInDown.duration(800).springify()}>
            <Text className="text-[#64748B] text-[16px] font-medium">
              Welcome back,
            </Text>
            <Text className="text-[#0F172A] font-syne text-[28px] font-black">
              {user?.firstName || "Guest"} 👋
            </Text>
          </Animated.View>
          <TouchableOpacity className="h-14 w-14 rounded-full border-2 border-[#F1F5F9] overflow-hidden">
            <Image
              source={{ uri: user?.imageUrl || "https://avatar.iran.liara.run/public/32" }}
              className="w-full h-full"
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800).springify()}
          className="px-6 mt-8"
        >
          <View className="flex-row items-center bg-[#F8FAFC] px-5 py-4 rounded-[24px] border border-[#F1F5F9]">
            <Ionicons name="search" size={22} color="#94A3B8" />
            <TextInput
              placeholder="Search for events..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 text-[16px] font-medium text-[#0F172A]"
            />
            <TouchableOpacity className="bg-[#0286FF] p-2 rounded-xl">
              <Ionicons name="options-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* FEATURED SECTION */}
        <View className="mt-8">
          <View className="px-6 flex-row items-center justify-between mb-5">
            <Text className="font-syne text-[22px] font-black text-[#0F172A]">
              Featured Events
            </Text>
            <TouchableOpacity>
              <Text className="text-[#0286FF] font-bold">See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 4 }}
          >
            {featuredEvents.map((item, index) => (
              <FeaturedCard key={item.id} item={item} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* NEARBY SECTION */}
        <View className="mt-10 px-6">
          <Text className="font-syne text-[22px] font-black text-[#0F172A] mb-5">
            Happening Soon
          </Text>
          {nearbyEvents.map((item, index) => (
            <EventListItem key={item.id} item={item} index={index} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

