import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";
import { useTheme } from "@/context/ThemeContext";

type OnboardingSlide = {
  id: number;
  title: string;
  description: string;
  tech: string;
  feature: string;
  image: any;
};

const OnboardingDot = ({
  index,
  width,
  scrollX,
}: {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
}) => {
  const { colors } = useTheme();
  const dotStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [15, 28, 15],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[dotStyle, { backgroundColor: colors.primary }]}
      className="mx-1 h-2 rounded-full"
    />
  );
};

const OnboardingItem = ({
  item,
  index,
  scrollX,
  screenWidth,
}: {
  item: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
  screenWidth: number;
}) => {
  const { colors } = useTheme();
  const headerSize = Math.max(30, Math.min(38, screenWidth * 0.08));
  const bodySize = Math.max(15, Math.min(18, screenWidth * 0.043));

  const imageStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [60, 0, -60],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      scrollX.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [0.88, 1, 0.88],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateX }, { scale }],
      opacity,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 0.5) * screenWidth,
        index * screenWidth,
        (index + 0.5) * screenWidth,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollX.value,
      [
        (index - 0.5) * screenWidth,
        index * screenWidth,
        (index + 0.5) * screenWidth,
      ],
      [24, 0, 24],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const techStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 0.45) * screenWidth,
        index * screenWidth,
        (index + 0.45) * screenWidth,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      scrollX.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [-screenWidth * 0.5, 0, -screenWidth * 0.5],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const featureStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [
        (index - 0.45) * screenWidth,
        index * screenWidth,
        (index + 0.45) * screenWidth,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      scrollX.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [screenWidth * 0.5, 0, screenWidth * 0.5],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <View style={{ width: screenWidth }} className="px-6 pb-4 pt-2">
      <Animated.View
        style={imageStyle}
        className="h-[50%] w-full items-center justify-center mt-10 mb-10"
      >
        <Image
          source={item.image}
          className="h-full w-full"
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={textStyle}
        className="w-full items-center justify-center px-1"
      >
        <Text
          style={{ fontSize: headerSize, color: colors.text }}
          className="text-center font-syne font-extrabold leading-tight"
        >
          {item.title}
        </Text>

        <Text
          style={{ fontSize: bodySize, color: colors.subtext }}
          className="mb-7 mt-4 px-4 text-center font-medium leading-7"
        >
          {item.description}
        </Text>

        {/* Tech and Feature Labels */}
        <View className="absolute inset-x-0 bottom-[-20px] flex-row justify-between px-8">
          <Animated.View
            style={[
              techStyle,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
            ]}
            className="px-3 py-1 rounded-full border border-opacity-20"
          >
            <Text
              style={{ color: colors.primary }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              {item.tech}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              featureStyle,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            className="px-3 py-1 rounded-full border"
          >
            <Text
              style={{ color: colors.subtext }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              {item.feature}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const OnboardingScreen = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const { theme, colors } = useTheme();

  const translatedSlides: OnboardingSlide[] = onboarding.map((slide, index) => {
    const key = `onboarding.slide${index + 1}`;
    return {
      ...slide,
      title: t(`${key}.title`),
      description: t(`${key}.description`),
      tech: t(`${key}.tech`),
      feature: t(`${key}.feature`),
    };
  });

  const onScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const isLastSlide = activeIndex === onboarding.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      router.replace("/(auth)/welcome" as any);
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <TouchableOpacity
        onPress={() => router.replace("/(auth)/welcome" as any)}
        className="w-full items-end px-6 py-4"
      >
        <Text
          style={{ color: colors.subtext }}
          className="text-base font-semibold opacity-70"
        >
          {t("common.skip")}
        </Text>
      </TouchableOpacity>

      <View className="flex-1">
        <Animated.FlatList
          ref={flatListRef}
          data={translatedSlides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <OnboardingItem
              item={item}
              index={index}
              scrollX={scrollX}
              screenWidth={width}
            />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
        />
      </View>

      <View className="mb-6 flex-row items-center justify-center">
        {onboarding.map((_, index) => {
          return (
            <OnboardingDot
              key={index}
              index={index}
              width={width}
              scrollX={scrollX}
            />
          );
        })}
      </View>

      <View className="w-full px-6 pb-8">
        <CustomButton
          title={isLastSlide ? t("common.getStarted") : t("common.next")}
          onPress={handleNext}
          className="mt-0"
        />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
