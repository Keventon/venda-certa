import { colors } from "@/styles/colors";
import { usePressScale } from "@/hooks/usePressScale";
import clsx from "clsx";
import type { TouchableOpacityProps } from "react-native";
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
} from "react-native";

type PrimaryButtonVariant =
  | "primary"
  | "danger"
  | "secondary"
  | "dangerSecondary";

type PrimaryButtonProps = TouchableOpacityProps & {
  isLoading?: boolean;
  label: string;
  variant?: PrimaryButtonVariant;
};

const VARIANTS: Record<
  PrimaryButtonVariant,
  {
    backgroundClassName: string;
    spinnerColor: string;
    textClassName: string;
  }
> = {
  danger: {
    backgroundClassName: "bg-[#8F2D08]",
    spinnerColor: colors.neutral,
    textClassName: "text-neutral",
  },
  dangerSecondary: {
    backgroundClassName: "bg-white",
    spinnerColor: "#8F2D08",
    textClassName: "text-[#8F2D08]",
  },
  primary: {
    backgroundClassName: "bg-primary",
    spinnerColor: colors.neutral,
    textClassName: "text-neutral",
  },
  secondary: {
    backgroundClassName: "bg-white",
    spinnerColor: colors.primary,
    textClassName: "text-primary",
  },
};

export function PrimaryButton({
  disabled,
  isLoading,
  label,
  variant = "primary",
  ...props
}: PrimaryButtonProps) {
  const palette = VARIANTS[variant];
  const isDisabled = disabled || isLoading;
  const { animatedStyle, onPressIn, onPressOut } = usePressScale({
    disabled: isDisabled,
    pressedScale: 0.985,
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        {...props}
        className={clsx(
          "h-16 flex-row items-center justify-center gap-3 rounded-xl",
          palette.backgroundClassName,
          isDisabled && "opacity-50",
        )}
        disabled={isDisabled}
        activeOpacity={0.82}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {isLoading ? <ActivityIndicator color={palette.spinnerColor} /> : null}
        <Text
          className={clsx(
            "font-inter-semibold text-base",
            palette.textClassName,
          )}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
