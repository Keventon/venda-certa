import { colors } from "@/styles/colors";
import clsx from "clsx";
import type { TouchableOpacityProps } from "react-native";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type PrimaryButtonProps = TouchableOpacityProps & {
  isLoading?: boolean;
  label: string;
};

export function PrimaryButton({
  disabled,
  isLoading,
  label,
  ...props
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      className={clsx(
        "h-16 flex-row items-center justify-center gap-3 rounded-xl bg-primary",
        (disabled || isLoading) && "opacity-50",
      )}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? <ActivityIndicator color={colors.neutral} /> : null}
      <Text className="font-inter-semibold text-base text-neutral">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
