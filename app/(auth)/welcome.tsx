import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { router } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center items-center">
                <Image
                    source={images.welcome}
                    className="w-[300px] h-[300px] mb-10"
                    resizeMode="contain"
                />

                <View className="w-full items-center mb-10">
                    <Text className="text-3xl font-syne font-extrabold text-[#0F172A] mb-4 text-center">
                        Let&apos;s get started
                    </Text>
                    <Text className="text-base text-center font-medium text-[#64748B] px-4">
                        Sign up now and get your tickets in seconds fast and easy
                    </Text>
                </View>

                <View className="w-full pt-4">
                    <CustomButton
                        title="Sign Up"
                        onPress={() => router.push("/(auth)/sign-up" as any)}
                        className="mb-4"
                    />
                    <CustomButton
                        title="Sign In"
                        onPress={() => router.push("/(auth)/sign-in" as any)}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Welcome;