import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";

const Home = () => {
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const isLastSlide = activeIndex === onboarding.length - 1;

    return (
        <SafeAreaView className="flex h-full items-center justify-between bg-white px-6">
            <TouchableOpacity
                onPress={() => {
                    router.replace("/(auth)/sign-up");
                }}
                className="w-full flex justify-end items-end py-5"
            >
                <Text className="text-black text-md font-semibold opacity-60">Skip</Text>
            </TouchableOpacity>

            <Swiper
                ref={swiperRef}
                loop={false}
                dot={
                    <View className="w-[8px] h-[8px] mx-1 bg-[#E2E8F0] rounded-full" />
                }
                activeDot={
                    <View className="w-[32px] h-[8px] mx-1 bg-[#0286FF] rounded-full" />
                }
                onIndexChanged={(index) => setActiveIndex(index)}
            >
                {onboarding.map((item, index) => (
                    <View key={item.id} className="flex items-center justify-center p-5">
                        <Animated.View 
                            entering={FadeInUp.duration(1000).delay(100)}
                            className="w-full h-[300px] items-center justify-center"
                        >
                            <Image
                                source={item.image}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </Animated.View>
                        
                        <Animated.View 
                            entering={FadeInDown.duration(1000).delay(200)}
                            className="flex flex-row items-center justify-center w-full mt-10"
                        >
                            <Text className="text-black text-3xl font-extrabold text-center leading-tight">
                                {item.title}
                            </Text>
                        </Animated.View>

                        <Animated.View 
                            entering={FadeInDown.duration(1000).delay(400)}
                        >
                            <Text className="text-md font-medium text-center text-[#858585] mt-5 px-4 mb-10">
                                {item.description}
                            </Text>
                        </Animated.View>
                    </View>
                ))}
            </Swiper>

            <View className="w-full pb-10">
                <CustomButton
                    title={isLastSlide ? "Get Started" : "Next"}
                    onPress={() =>
                        isLastSlide
                            ? router.replace("/(auth)/sign-up")
                            : swiperRef.current?.scrollBy(1)
                    }
                    className="mt-10"
                />
            </View>
        </SafeAreaView>
    );
};

export default Home;