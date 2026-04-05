import { usePressScale } from "@/hooks/usePressScale";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import { Animated, Pressable, Text, View } from "react-native";

type MonthNavigatorProps = {
  onChange: (value: Date) => void;
  value: Date;
};

type MonthButtonProps = {
  direction: "left" | "right";
  disabled?: boolean;
  onPress: () => void;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function formatMonthLabel(date: Date) {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function MonthButton({
  direction,
  disabled = false,
  onPress,
}: MonthButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    disabled,
    pressedScale: 0.96,
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className={clsx(
          "h-11 w-11 items-center justify-center rounded-full bg-background",
          disabled && "opacity-40",
        )}
        disabled={disabled}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => ({
          opacity: pressed && !disabled ? 0.84 : 1,
        })}
      >
        <MaterialCommunityIcons
          color="#1A1C19"
          name={direction === "left" ? "chevron-left" : "chevron-right"}
          size={24}
        />
      </Pressable>
    </Animated.View>
  );
}

export function MonthNavigator({ onChange, value }: MonthNavigatorProps) {
  const currentMonth = startOfMonth(new Date());
  const selectedMonth = startOfMonth(value);
  const canGoForward = selectedMonth.getTime() < currentMonth.getTime();

  return (
    <View className="rounded-lg bg-white px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <MonthButton
          direction="left"
          onPress={() => onChange(addMonths(selectedMonth, -1))}
        />

        <View className="flex-1 items-center px-2">
          <Text className="font-inter-regular text-[11px] uppercase tracking-[1px] text-text/55">
            Mês selecionado
          </Text>

          <Text className="mt-1 font-inter-semibold text-base text-text">
            {formatMonthLabel(selectedMonth)}
          </Text>
        </View>

        <MonthButton
          direction="right"
          disabled={!canGoForward}
          onPress={() => onChange(addMonths(selectedMonth, 1))}
        />
      </View>
    </View>
  );
}
