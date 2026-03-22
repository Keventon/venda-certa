import { Tabs } from "expo-router";

import { Loading } from "@/components/Loading";
import { TabBar } from "@/components/TabBar";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { View } from "react-native";

import "@/global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loading />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="incomes" />
      <Tabs.Screen name="expenses" />
      <Tabs.Screen name="history" />
    </Tabs>
  );
}
