import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Removed unused TabIcon component

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme();
  const { width } = Dimensions.get("window");
  const containerWidth = width - 48;
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
      style={{
        position: "absolute",
        bottom: 40,
        left: 24,
        right: 24,
        height: 76,
        borderRadius: 38,
        ...Platform.select({
          ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 20 },
          android: { elevation: 8 },
        }),
      }}
    >
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={{
          flex: 1,
          backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
          borderRadius: 38,
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 6,
        }}
      >
        <Animated.View
          style={[pillStyle, {
            width: tabWidth - 4,
            height: 64,
            backgroundColor: colors.tabBarPill,
            borderRadius: 32,
            position: "absolute",
            marginLeft: 4,
          }]}
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
              style={{ flex: 1, height: "100%", alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons
                name={options.tabBarIconName}
                size={24}
                color={isFocused ? colors.primary : colors.tabBarIcon}
              />
              {isFocused && (
                <Text style={{ color: colors.primary, fontFamily: "Syne_700Bold", fontSize: 12, marginTop: 4 }}>
                  {options.title}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
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

