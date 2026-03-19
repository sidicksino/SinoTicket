import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

const SignUp = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 pt-10 pb-8">
          <AnimatedView entering={FadeInDown.duration(600).delay(100)}>
            <Text className="mb-10 mt-10 text-center font-syne text-[28px] font-extrabold text-[#0F172A]">
              Register with Gmail
            </Text>
          </AnimatedView>

          <View className="w-full">
            <AnimatedView entering={FadeInDown.duration(600).delay(200)}>
              <InputField
                label="Name"
                placeholder="Enter name"
                icon="person-outline"
                autoCapitalize="words"
              />
            </AnimatedView>

            <AnimatedView entering={FadeInDown.duration(600).delay(300)}>
              <InputField
                label="Email"
                placeholder="Enter your email or phone number"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </AnimatedView>

            <AnimatedView entering={FadeInDown.duration(600).delay(400)}>
              <InputField
                label="Password"
                placeholder="Enter password"
                icon="lock-closed-outline"
                secureTextEntry={true}
              />
            </AnimatedView>

            <AnimatedView entering={FadeInDown.duration(600).delay(500)}>
              <CustomButton
                title="Sign Up"
                onPress={() => {}}
                className="mt-4"
              />
            </AnimatedView>
          </View>

          <AnimatedView
            entering={FadeInDown.duration(600).delay(600)}
            className="mt-8 flex flex-row items-center justify-center gap-x-3"
          >
            <View className="h-[1px] flex-1 bg-neutral-200" />
            <Text className="text-[14px] font-medium text-neutral-500">Or</Text>
            <View className="h-[1px] flex-1 bg-neutral-200" />
          </AnimatedView>

          <AnimatedView
            entering={FadeInDown.duration(600).delay(700)}
            className="mt-6 flex flex-row items-center justify-center gap-x-6"
          >
            <TouchableOpacity className="flex h-[52px] w-[80px] flex-row items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm shadow-neutral-100">
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                }}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity className="flex h-[52px] w-[80px] flex-row items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm shadow-neutral-100">
              <Ionicons name="call-outline" size={24} color="#0286FF" />
            </TouchableOpacity>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.duration(600).delay(800)}>
            <View className="mt-10 flex flex-row justify-center">
              <Text className="text-[15px] font-medium text-neutral-500">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-in">
                <Text className="text-[15px] font-bold text-[#0286FF]">
                  Log in
                </Text>
              </Link>
            </View>
          </AnimatedView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;