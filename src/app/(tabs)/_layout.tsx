import { TabBar } from "@/components/TabBar";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="incomes" />
      <Tabs.Screen name="expenses" />
      <Tabs.Screen name="history" />
    </Tabs>
  );
}
