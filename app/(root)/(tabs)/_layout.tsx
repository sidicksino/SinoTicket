import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue 
} from "react-native-reanimated";
import React, { useEffect } from "react";

// Removed unused TabIcon component

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { width } = Dimensions.get("window");
  const containerWidth = width - 48; // 24px horizontal margin
  const tabWidth = containerWidth / state.routes.length;
  
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 150,
    });
  }, [state.index, tabWidth, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View 
      className="absolute bottom-10 left-6 right-6 h-[76px] bg-[#F1F5F9] rounded-[38px] flex-row items-center px-1.5 shadow-2xl shadow-black/10"
      style={{
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
          android: { elevation: 8 }
        })
      }}
    >
      {/* Background Animated Pill */}
      <Animated.View 
        style={[pillStyle, { width: tabWidth - 4 }]} 
        className="absolute h-[64px] bg-white rounded-[32px] shadow-sm ml-1"
      />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-1 h-full items-center justify-center"
          >
            <Ionicons 
              name={options.tabBarIconName} 
              size={24} 
              color={isFocused ? "#0286FF" : "#64748B"} 
            />
            {isFocused && (
              <Text className="font-syne font-bold text-[#0286FF] text-[12px] mt-1">
                {options.title}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIconName: "home-outline",
        } as any}
      />
      <Tabs.Screen
        name="ticket"
        options={{
          title: "Tickets",
          tabBarIconName: "ticket-outline",
        } as any}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIconName: "time-outline",
        } as any}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIconName: "person-outline",
        } as any}
      />
    </Tabs>
  );
}

