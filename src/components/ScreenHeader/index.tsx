import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ScreenHeaderProps = {
  onBack: () => void;
  rightSlot?: ReactNode;
  title: string;
};

export function ScreenHeader({
  onBack,
  rightSlot,
  title,
}: ScreenHeaderProps) {
  return (
    <View className="relative h-12 flex-row items-center justify-between">
      <TouchableOpacity
        className="h-12 w-12 flex-row items-center justify-center rounded-2xl bg-white"
        onPress={onBack}
      >
        <MaterialCommunityIcons color={colors.text} name="arrow-left" size={24} />
      </TouchableOpacity>

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
