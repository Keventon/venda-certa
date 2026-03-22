import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import { Text, View } from "react-native";

type MetricCardVariant = "income" | "expense";

type MetricCardProps = {
  amount: string;
  change: string;
  title: string;
  variant: MetricCardVariant;
};

const VARIANTS: Record<
  MetricCardVariant,
  {
    accentClassName: string;
    badgeClassName: string;
    changeClassName: string;
    iconColor: string;
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  }
> = {
  income: {
    accentClassName: "bg-[#1D907A]",
    badgeClassName: "bg-[#D5F5E4]",
    changeClassName: "text-primary",
    iconColor: "#1B4332",
    iconName: "arrow-top-right",
  },
  expense: {
    accentClassName: "bg-[#B34A20]",
    badgeClassName: "bg-[#FFDCCF]",
    changeClassName: "text-[#8F2D08]",
    iconColor: "#7A3E28",
    iconName: "arrow-bottom-right",
  },
};

export function MetricCard({
  amount,
  change,
  title,
  variant,
}: MetricCardProps) {
  const palette = VARIANTS[variant];

  return (
    <View className="relative overflow-hidden rounded-lg bg-white px-5 py-5 shadow-sm">
      <View
        className={clsx(
          "absolute bottom-0 left-0 top-0 w-[5px]",
          palette.accentClassName,
        )}
      />

      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="font-inter-semibold text-xs uppercase tracking-[1.3px] text-text/75">
            {title}
          </Text>

          <Text className="mt-2 font-inter-bold text-2xl text-text">
            {amount}
          </Text>
        </View>

        <View
          className={clsx(
            "items-center justify-center rounded-[16px] p-3",
            palette.badgeClassName,
          )}
        >
          <MaterialCommunityIcons
            color={palette.iconColor}
            name={palette.iconName}
            size={20}
          />
        </View>
      </View>

      <View className="mt-6">
        <Text
          className={clsx(
            "font-inter-regular text-[13px] uppercase",
            palette.changeClassName,
          )}
        >
          {change}
        </Text>
      </View>
    </View>
  );
}
