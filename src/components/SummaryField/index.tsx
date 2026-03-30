import clsx from "clsx";
import { Text, View } from "react-native";

type SummaryFieldProps = {
  isMuted?: boolean;
  label: string;
  value: string;
};

export function SummaryField({
  isMuted = false,
  label,
  value,
}: SummaryFieldProps) {
  return (
    <View className="rounded-2xl bg-background px-4 py-4">
      <Text className="font-inter-semibold text-xs uppercase tracking-[1px] text-text/55">
        {label}
      </Text>
      <Text
        className={clsx(
          "mt-2 font-inter-regular text-sm leading-6 text-text",
          isMuted && "text-text/55",
        )}
      >
        {value}
      </Text>
    </View>
  );
}
