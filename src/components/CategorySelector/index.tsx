import { usePressScale } from "@/hooks/usePressScale";
import clsx from "clsx";
import { Animated, Pressable, Text, View } from "react-native";

type CategoryOption = {
  label: string;
  value: string;
};

type CategorySelectorProps = {
  label: string;
  onChange: (value: string) => void;
  options: CategoryOption[];
  value: string;
};

type CategoryChipProps = {
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

function CategoryChip({ isSelected, label, onPress }: CategoryChipProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    pressedScale: 0.97,
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className={clsx(
          "rounded-lg px-4 py-3",
          isSelected ? "bg-primary" : "bg-white",
        )}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text
          className={clsx(
            "font-inter-regular text-sm",
            isSelected
              ? "text-neutral font-inter-semibold"
              : "text-text/75",
          )}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function CategorySelector({
  label,
  onChange,
  options,
  value,
}: CategorySelectorProps) {
  return (
    <View className="gap-2">
      <Text className="font-inter-regular text-sm text-text/75">{label}</Text>

      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <CategoryChip
              key={option.value}
              isSelected={isSelected}
              label={option.label}
              onPress={() => onChange(option.value)}
            />
          );
        })}
      </View>
    </View>
  );
}
