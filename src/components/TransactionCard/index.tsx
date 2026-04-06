import { AnimatedEntrance } from "@/components/AnimatedEntrance";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePressScale } from "@/hooks/usePressScale";
import type {
  TransactionCategory,
  TransactionVariant,
} from "@/types/transactions";
import clsx from "clsx";
import { Animated, Pressable, Text, View } from "react-native";

type TransactionCardProps = {
  amount: string;
  category: TransactionCategory;
  delay?: number;
  description: string;
  onPress?: () => void;
  title: string;
  typeLabel: string;
  variant: TransactionVariant;
};

const VARIANTS: Record<
  TransactionVariant,
  {
    amountClassName: string;
    badgeClassName: string;
    iconBadgeClassName: string;
    iconColor: string;
  }
> = {
  income: {
    amountClassName: "text-primary",
    badgeClassName: "bg-[#ECE7DF]",
    iconBadgeClassName: "bg-[#EAE7E1]",
    iconColor: "#1B4332",
  },
  expense: {
    amountClassName: "text-[#8F2D08]",
    badgeClassName: "bg-[#ECE7DF]",
    iconBadgeClassName: "bg-[#EAE7E1]",
    iconColor: "#7A3E28",
  },
};

const CATEGORY_ICONS: Record<
  string,
  React.ComponentProps<typeof MaterialCommunityIcons>["name"]
> = {
  accessories: "paw",
  bills: "briefcase-check-outline",
  cleaning: "spray-bottle",
  "counter-sale": "storefront-outline",
  delivery: "bike-fast",
  event: "calendar-star",
  food: "silverware-fork-knife",
  ingredients: "food-apple-outline",
  logistics: "truck-delivery-outline",
  medicine: "pill",
  other: "dots-grid",
  packaging: "package-variant-closed",
  "pet-food": "food-variant",
  sales: "cash-register",
  stock: "package-variant-closed",
  subscription: "calendar-star",
  utilities: "lightning-bolt-outline",
};

export function TransactionCard({
  amount,
  category,
  delay = 0,
  description,
  onPress,
  title,
  typeLabel,
  variant,
}: TransactionCardProps) {
  const palette = VARIANTS[variant];
  const iconName = CATEGORY_ICONS[category] ?? "briefcase-check-outline";
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    disabled: !onPress,
    pressedScale: 0.985,
  });

  return (
    <AnimatedEntrance delay={delay}>
      <Animated.View style={animatedStyle}>
        <Pressable
          className="rounded-lg bg-white px-4 py-4"
          disabled={!onPress}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={({ pressed }) => ({
            opacity: pressed && onPress ? 0.94 : 1,
          })}
        >
          <View className="flex-row items-center gap-3">
            <View
              className={clsx(
                "h-14 w-14 items-center justify-center rounded-2xl",
                palette.iconBadgeClassName,
              )}
            >
              <MaterialCommunityIcons
                color={palette.iconColor}
                name={iconName}
                size={22}
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-start justify-between gap-3">
                <Text className="flex-1 font-inter-semibold text-sm leading-[24px] text-text">
                  {title}
                </Text>

                <Text
                  className={clsx(
                    "pt-0.5 font-inter-semibold text-sm",
                    palette.amountClassName,
                  )}
                >
                  {amount}
                </Text>
              </View>

              <View className="mt-1 flex-row items-center justify-between gap-3">
                <Text className="flex-1 font-inter-regular text-[11px] leading-[16px] text-text/70">
                  {description}
                </Text>

                <View
                  className={clsx("rounded-md px-2 py-1", palette.badgeClassName)}
                >
                  <Text className="font-inter-medium text-[10px] uppercase tracking-[0.6px] text-text/75">
                    {typeLabel}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </AnimatedEntrance>
  );
}
