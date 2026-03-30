import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AlertDialogTone = "success" | "error" | "info";

type AlertDialogOptions = {
  buttonLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  message: string;
  onClose?: () => void;
  onConfirm?: () => void;
  title: string;
  tone?: AlertDialogTone;
};

type AlertDialogContextValue = {
  showAlert: (options: AlertDialogOptions) => void;
};

type AlertDialogState = AlertDialogOptions & {
  tone: AlertDialogTone;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

const TONES: Record<
  AlertDialogTone,
  {
    badgeClassName: string;
    buttonClassName: string;
    iconColor: string;
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    titleClassName: string;
  }
> = {
  error: {
    badgeClassName: "bg-[#F9E9E3]",
    buttonClassName: "bg-[#8F2D08]",
    iconColor: "#8F2D08",
    iconName: "alert-circle-outline",
    titleClassName: "text-[#8F2D08]",
  },
  info: {
    badgeClassName: "bg-[#ECE7DF]",
    buttonClassName: "bg-primary",
    iconColor: "#1A1C19",
    iconName: "information-outline",
    titleClassName: "text-text",
  },
  success: {
    badgeClassName: "bg-[#E9F5EE]",
    buttonClassName: "bg-primary",
    iconColor: "#1B4332",
    iconName: "check-circle-outline",
    titleClassName: "text-primary",
  },
};

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<AlertDialogState | null>(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

  const showAlert = useCallback((options: AlertDialogOptions) => {
    setDialog({
      ...options,
      tone: options.tone ?? "info",
    });
  }, []);

  useEffect(() => {
    if (!dialog) {
      return;
    }

    overlayOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardScale.setValue(0.96);
    cardTranslateY.setValue(20);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        duration: 220,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        duration: 220,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        bounciness: 6,
        speed: 16,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        bounciness: 4,
        speed: 18,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardScale, cardTranslateY, dialog, overlayOpacity]);

  const dismissDialog = useCallback(
    (callback?: () => void) => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          duration: 180,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          duration: 160,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          duration: 160,
          easing: Easing.in(Easing.quad),
          toValue: 0.98,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          duration: 160,
          easing: Easing.in(Easing.quad),
          toValue: 12,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDialog(null);
        callback?.();
      });
    },
    [cardOpacity, cardScale, cardTranslateY, overlayOpacity],
  );

  const handleClose = useCallback(() => {
    if (!dialog) {
      return;
    }

    dismissDialog(dialog.onClose);
  }, [dialog, dismissDialog]);

  const handleConfirm = useCallback(() => {
    if (!dialog) {
      return;
    }

    dismissDialog(dialog.onConfirm);
  }, [dialog, dismissDialog]);

  const palette = dialog ? TONES[dialog.tone] : null;
  const contextValue = useMemo(() => ({ showAlert }), [showAlert]);

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}

      <Modal
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
        transparent
        visible={dialog !== null}
      >
        <View className="flex-1 justify-center px-6">
          <Animated.View
            className="absolute inset-0 bg-black/35"
            style={{ opacity: overlayOpacity }}
          />
          <Pressable className="absolute inset-0" onPress={handleClose} />

          {dialog && palette ? (
            <Animated.View
              className="rounded-[28px] bg-background px-6 py-6"
              style={{
                opacity: cardOpacity,
                transform: [
                  { translateY: cardTranslateY },
                  { scale: cardScale },
                ],
              }}
            >
              <View className="items-start">
                <View
                  className={clsx(
                    "h-14 w-14 items-center justify-center rounded-2xl",
                    palette.badgeClassName,
                  )}
                >
                  <MaterialCommunityIcons
                    color={palette.iconColor}
                    name={palette.iconName}
                    size={26}
                  />
                </View>
              </View>

              <Text
                className={clsx(
                  "mt-5 font-inter-semibold text-lg",
                  palette.titleClassName,
                )}
              >
                {dialog.title}
              </Text>

              <Text className="mt-3 font-inter-regular text-base leading-6 text-text/75">
                {dialog.message}
              </Text>

              {dialog.onConfirm ? (
                <View className="mt-7 flex-row gap-3">
                  <TouchableOpacity
                    activeOpacity={0.82}
                    className="h-14 flex-1 items-center justify-center rounded-lg bg-white"
                    onPress={handleClose}
                  >
                    <Text className="font-inter-semibold text-base text-text/70">
                      {dialog.cancelLabel ?? "Cancelar"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.82}
                    className={clsx(
                      "h-14 flex-1 items-center justify-center rounded-lg",
                      palette.buttonClassName,
                    )}
                    onPress={handleConfirm}
                  >
                    <Text className="font-inter-semibold text-base text-neutral">
                      {dialog.confirmLabel ?? "Confirmar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.82}
                  className={clsx(
                    "mt-7 h-14 items-center justify-center rounded-lg",
                    palette.buttonClassName,
                  )}
                  onPress={handleClose}
                >
                  <Text className="font-inter-semibold text-base text-neutral">
                    {dialog.buttonLabel ?? "Entendi"}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : null}
        </View>
      </Modal>
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error(
      "useAlertDialog must be used within an AlertDialogProvider",
    );
  }

  return context;
}
