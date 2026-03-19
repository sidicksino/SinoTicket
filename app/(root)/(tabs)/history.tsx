import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const History = () => {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-syne text-[#0F172A]">Event History</Text>
      <Text className="text-[#64748B] mt-2">Your past and saved tickets will appear here.</Text>
    </SafeAreaView>
  );
};

export default History;
