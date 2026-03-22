import clsx from "clsx";
import type { TouchableOpacityProps } from "react-native";
import { Text, TouchableOpacity } from "react-native";

type PrimaryButtonProps = TouchableOpacityProps & {
  label: string;
};

export function PrimaryButton({
  disabled,
  label,
  ...props
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      className={clsx(
        "h-16 flex-row items-center justify-center gap-3 rounded-xl bg-primary",
        disabled && "opacity-50",
      )}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text className="font-inter-semibold text-base text-neutral">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
