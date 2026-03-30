import { AnimatedEntrance } from "@/components/AnimatedEntrance";
import { usePressScale } from "@/hooks/usePressScale";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type TabBarItemProps = {
  accessibilityLabel?: string;
  isFocused: boolean;
  labelClassName: string;
  onLongPress: () => void;
  onPress: () => void;
  routeKey: string;
  tab: TabConfig;
};

function TabBarItem({
  accessibilityLabel,
  isFocused,
  labelClassName,
  onLongPress,
  onPress,
  routeKey,
  tab,
}: TabBarItemProps) {
  const focusProgress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    pressedScale: 0.95,
  });

  useEffect(() => {
    Animated.spring(focusProgress, {
      bounciness: 8,
      speed: 18,
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [focusProgress, isFocused]);

  const iconScale = focusProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const labelOpacity = focusProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });
  const labelTranslateY = focusProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 0],
  });

  return (
    <Pressable
      key={routeKey}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      className="flex-1 items-center"
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => ({
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Animated.View style={animatedStyle}>
        <View
          className="items-center overflow-hidden rounded-xl px-3 py-2"
          style={{ minWidth: 82, position: "relative" }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: colors.primary,
                borderRadius: 14,
                opacity: focusProgress,
              },
            ]}
          />

          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <MaterialCommunityIcons
              color={isFocused ? colors.neutral : "#4F5A54"}
              name={tab.icon}
              size={24}
            />
          </Animated.View>

          <Animated.Text
            className={labelClassName}
            style={{
              opacity: labelOpacity,
              transform: [{ translateY: labelTranslateY }],
            }}
          >
            {tab.label}
          </Animated.Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name as TabRouteName;

  if (!TABS[activeRouteName]) {
    return null;
  }

  return (
    <AnimatedEntrance delay={40} distance={12} duration={360}>
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
            const labelClassName = `mt-1 text-[10px] tracking-[0.8px] ${
              isFocused
                ? "font-inter-medium text-neutral"
                : "font-inter-regular text-text/75"
            }`;

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
              <TabBarItem
                accessibilityLabel={options.tabBarAccessibilityLabel}
                isFocused={isFocused}
                key={route.key}
                labelClassName={labelClassName}
                onLongPress={onLongPress}
                onPress={onPress}
                routeKey={route.key}
                tab={tab}
              />
            );
          })}
        </View>
      </View>
    </AnimatedEntrance>
  );
}
