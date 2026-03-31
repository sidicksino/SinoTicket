import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { router } from "expo-router";
import React from "react";
import { DimensionValue, Image, Text, View, useWindowDimensions } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
    const { height } = useWindowDimensions();
    const { colors } = useTheme();
    const imageHeight = height * 0.45;

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <View className="flex-1 px-8 justify-between pb-10 pt-4">
                <Animated.View
                    entering={FadeInUp.duration(800).springify().damping(14)}
                    className="w-full items-center justify-center flex-1"
                >
                    <Image
                        source={images.welcome}
                        style={{ width: '100%' as DimensionValue, height: imageHeight }}
                        resizeMode="contain"
                    />
                </Animated.View>

                <View className="w-full mt-8">
                    <Animated.View entering={FadeInDown.duration(800).delay(200).springify().damping(14)}>
                        <Text className="text-[36px] font-syne font-extrabold mb-3 text-center leading-[42px]" style={{ color: colors.text }}>
                            Let&apos;s get{"\n"}started
                        </Text>
                        <Text className="text-[16px] text-center font-medium px-4 leading-6" style={{ color: colors.subtext }}>
                            Sign up now and get your tickets in seconds fast and easy
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(800).delay(400).springify().damping(14)} className="w-full mt-10 gap-y-4">
                        <CustomButton
                            title="Sign Up"
                            onPress={() => router.push("/(auth)/sign-up" as any)}
                        />
                        <CustomButton
                            title="Sign In"
                            bgVariant="outline"
                            textVariant="primary"
                            onPress={() => router.push("/(auth)/sign-in" as any)}
                        />
                    </Animated.View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Welcome;