import { useMemo, useRef } from "react";
import { Animated } from "react-native";

type UsePressScaleOptions = {
  disabled?: boolean;
  pressedScale?: number;
};

export function usePressScale({
  disabled = false,
  pressedScale = 0.98,
}: UsePressScaleOptions = {}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      bounciness: 6,
      speed: 20,
      toValue: value,
      useNativeDriver: true,
    }).start();
  };

  const handlers = useMemo(
    () => ({
      onPressIn: () => {
        if (disabled) {
          return;
        }

        animateTo(pressedScale);
      },
      onPressOut: () => {
        if (disabled) {
          return;
        }

        animateTo(1);
      },
    }),
    [disabled, pressedScale],
  );

  return {
    animatedStyle: { transform: [{ scale }] },
    ...handlers,
  };
}
