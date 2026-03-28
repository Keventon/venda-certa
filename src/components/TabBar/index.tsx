import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/styles/colors";

type TabRouteName = "index" | "incomes" | "expenses" | "history";

type TabConfig = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
};

const TABS: Record<TabRouteName, TabConfig> = {
  index: {
    icon: "view-dashboard",
    label: "PAINEL",
  },
  incomes: {
    icon: "chart-box-plus-outline",
    label: "RECEITA",
  },
  expenses: {
    icon: "cash-multiple",
    label: "DESPESA",
  },
  history: {
    icon: "receipt-text-outline",
    label: "HISTORICO",
  },
};

export function TabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-black/5 bg-background px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row items-start justify-between">
        {state.routes.map((route, index) => {
          const tab = TABS[route.name as TabRouteName];

          if (!tab) {
            return null;
          }

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: "tabPress",
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              target: route.key,
              type: "tabLongPress",
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onLongPress={onLongPress}
              onPress={onPress}
              className="flex-1 items-center"
            >
              <View
                className={`items-center overflow-hidden rounded-xl px-3 py-2 ${
                  isFocused ? "bg-primary" : "bg-transparent"
                }`}
                style={{ borderRadius: 14, minWidth: 82 }}
              >
                <MaterialCommunityIcons
                  color={isFocused ? colors.neutral : "#4F5A54"}
                  name={tab.icon}
                  size={24}
                />
                <Text
                  className={`mt-1 text-[10px] tracking-[0.8px] ${
                    isFocused
                      ? "font-inter-medium text-neutral"
                      : "font-inter-regular text-text/75"
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
