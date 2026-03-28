import clsx from "clsx";
import { Pressable, Text, View } from "react-native";

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
            <Pressable
              key={option.value}
              className={clsx(
                "rounded-lg px-4 py-3",
                isSelected ? "bg-primary" : "bg-white",
              )}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={clsx(
                  "font-inter-regular text-sm",
                  isSelected
                    ? "text-neutral font-inter-semibold"
                    : "text-text/75",
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
