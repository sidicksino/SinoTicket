import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  const { height } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useTranslation();
  // Keep the illustration modest so the buttons sit comfortably on any phone.
  const imageHeight = Math.min(height * 0.38, 340);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 16 }}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Image
            source={images.welcome}
            style={{ width: "100%", height: imageHeight }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <Text
          accessibilityRole="header"
          style={{
            fontFamily: "Syne_700Bold",
            fontSize: 30,
            lineHeight: 36,
            textAlign: "center",
            color: colors.text,
          }}
        >
          {t("welcome.letsGetStarted")}
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            lineHeight: 23,
            textAlign: "center",
            color: colors.subtext,
            paddingHorizontal: 12,
          }}
        >
          {t("welcome.subtitle")}
        </Text>

        <View style={{ marginTop: 32, gap: 12 }}>
          <CustomButton
            title={t("welcome.signUp")}
            onPress={() => router.push("/(auth)/sign-up")}
          />
          <CustomButton
            title={t("welcome.signIn")}
            bgVariant="outline"
            textVariant="primary"
            onPress={() => router.push("/(auth)/sign-in")}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Welcome;
