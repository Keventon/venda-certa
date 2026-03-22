import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import { Text, View } from "react-native";

type TransactionVariant = "income" | "expense";

type TransactionCardProps = {
  amount: string;
  category: string;
  description: string;
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
  bills: "briefcase-check-outline",
  food: "silverware-fork-knife",
  utilities: "lightning-bolt-outline",
};

export function TransactionCard({
  amount,
  category,
  description,
  title,
  typeLabel,
  variant,
}: TransactionCardProps) {
  const palette = VARIANTS[variant];
  const iconName = CATEGORY_ICONS[category] ?? "briefcase-check-outline";

  return (
    <View className="rounded-lg bg-white px-4 py-4">
      <View className="flex-row items-center gap-3">
        <View
          className={clsx(
            "h-14 w-14 items-center justify-center rounded-[18px]",
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
            <Text className="flex-1 font-inter-semibold text-[16px] leading-[24px] text-text">
              {title}
            </Text>

            <Text
              className={clsx(
                "pt-0.5 font-inter-semibold text-[14px]",
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
    </View>
  );
}
