import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Show, useUser, useClerk } from '@clerk/expo';
import { Link } from 'expo-router';

export default function Home() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
      <Text className="font-syne text-[36px] font-black text-[#0F172A] mb-8">Home</Text>

      <Show when="signed-out">
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity className="w-[200px] h-[50px] bg-[#0286FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#0286FF]/40">
            <Text className="text-white font-bold text-[16px]">Sign In</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity className="w-[200px] h-[50px] bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center mt-4">
            <Text className="text-[#0F172A] font-bold text-[16px]">Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </Show>

      <Show when="signed-in">
        <View className="items-center bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <Text className="text-[16px] font-medium text-[#64748B] mb-2">Logged in as:</Text>
          <Text className="text-[18px] font-bold text-[#0F172A] mb-8">
            {user?.emailAddresses?.[0]?.emailAddress}
          </Text>
          <TouchableOpacity 
            onPress={() => signOut()}
            className="w-[200px] h-[50px] bg-red-50 rounded-xl border border-red-200 flex items-center justify-center"
          >
            <Text className="text-red-500 font-bold text-[16px]">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Show>
    </View>
  );
}
