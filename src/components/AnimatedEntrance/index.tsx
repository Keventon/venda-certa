import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";

type AnimatedEntranceProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  scaleFrom?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedEntrance({
  children,
  delay = 0,
  distance = 18,
  duration = 420,
  scaleFrom = 0.985,
  style,
}: AnimatedEntranceProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        delay,
        duration,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        delay,
        duration,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        delay,
        duration,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, distance, duration, opacity, scale, scaleFrom, translateY]);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
