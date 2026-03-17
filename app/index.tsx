// // import { useAuth } from "@clerk/clerk-expo";
// import { Redirect } from "expo-router";

// const Page = () => {
//   // const { isSignedIn } = useAuth();

//   // if (isSignedIn) return <Redirect href="/(root)/(tabs)/home" />;

//   return <Redirect href="/(auth)/welcome" />;
// };

// export default Page;

import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
    </View>
  );
}