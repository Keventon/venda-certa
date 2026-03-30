import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Modal, Pressable, Text, View } from "react-native";

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

  const showAlert = useCallback((options: AlertDialogOptions) => {
    setDialog({
      ...options,
      tone: options.tone ?? "info",
    });
  }, []);

  const handleClose = useCallback(() => {
    if (!dialog) {
      return;
    }

    const callback = dialog.onClose;
    setDialog(null);
    callback?.();
  }, [dialog]);

  const handleConfirm = useCallback(() => {
    if (!dialog) {
      return;
    }

    const callback = dialog.onConfirm;
    setDialog(null);
    callback?.();
  }, [dialog]);

  const palette = dialog ? TONES[dialog.tone] : null;
  const contextValue = useMemo(() => ({ showAlert }), [showAlert]);

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}

      <Modal
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
        transparent
        visible={dialog !== null}
      >
        <View className="flex-1 justify-center bg-black/35 px-6">
          <Pressable className="absolute inset-0" onPress={handleClose} />

          {dialog && palette ? (
            <View className="rounded-[28px] bg-background px-6 py-6">
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
                  "mt-5 font-inter-semibold text-[22px] leading-[28px]",
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
                  <Pressable
                    className="h-14 flex-1 items-center justify-center rounded-[18px] bg-white"
                    onPress={handleClose}
                  >
                    <Text className="font-inter-semibold text-base text-text/70">
                      {dialog.cancelLabel ?? "Cancelar"}
                    </Text>
                  </Pressable>

                  <Pressable
                    className={clsx(
                      "h-14 flex-1 items-center justify-center rounded-[18px]",
                      palette.buttonClassName,
                    )}
                    onPress={handleConfirm}
                  >
                    <Text className="font-inter-semibold text-base text-neutral">
                      {dialog.confirmLabel ?? "Confirmar"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  className={clsx(
                    "mt-7 h-14 items-center justify-center rounded-[18px]",
                    palette.buttonClassName,
                  )}
                  onPress={handleClose}
                >
                  <Text className="font-inter-semibold text-base text-neutral">
                    {dialog.buttonLabel ?? "Entendi"}
                  </Text>
                </Pressable>
              )}
            </View>
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
