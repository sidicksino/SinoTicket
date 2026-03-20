import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoadingScreen = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#0286FF" />
    </View>
  </SafeAreaView>
);

export default LoadingScreen;
