import { usePressScale } from "@/hooks/usePressScale";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";

type ScreenHeaderProps = {
  onBack: () => void;
  rightSlot?: ReactNode;
  title: string;
};

export function ScreenHeader({ onBack, rightSlot, title }: ScreenHeaderProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    pressedScale: 0.96,
  });

  return (
    <View
      className={clsx(
        Platform.OS === "ios"
          ? "relative h-12 mt-6 flex-row items-center justify-between"
          : "relative h-12 flex-row items-center justify-between",
      )}
    >
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          activeOpacity={0.82}
          className="h-12 w-12 flex-row items-center justify-center rounded-2xl bg-white"
          onPress={onBack}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <MaterialCommunityIcons
            color={colors.text}
            name="arrow-left"
            size={24}
          />
        </TouchableOpacity>
      </Animated.View>

      <View
        className="absolute inset-x-0 h-12 items-center justify-center"
        pointerEvents="none"
      >
        <Text className="font-inter-medium text-lg text-text">{title}</Text>
      </View>

      {rightSlot ?? <View className="h-12 w-12" />}
    </View>
  );
}
