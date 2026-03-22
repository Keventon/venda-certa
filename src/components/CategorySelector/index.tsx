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
      <Text className="font-inter-medium text-base text-text/75">{label}</Text>

      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              className={clsx(
                "rounded-lg border border-text/10 px-4 py-3",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-black/8 bg-white",
              )}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={clsx(
                  "font-inter-medium text-[14px]",
                  isSelected ? "text-neutral" : "text-text/75",
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
