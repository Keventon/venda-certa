import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import type { ComponentProps } from "react";
import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";

type InputFieldProps = TextInputProps & {
  label: string;
  rightIconName?: ComponentProps<typeof MaterialCommunityIcons>["name"];
};

export function InputField({
  label,
  multiline,
  rightIconName,
  style,
  ...props
}: InputFieldProps) {
  return (
    <View className="gap-2">
      <Text className="font-inter-regular text-sm text-text/75">{label}</Text>

      <View
        className={clsx(
          "bg-white px-4",
          multiline
            ? "min-h-[112px] rounded-lg py-3"
            : "h-14 flex-row items-center rounded-lg",
        )}
      >
        <TextInput
          {...props}
          className={clsx(
            "flex-1 font-inter-medium text-sm text-text",
            multiline && "min-h-[88px] leading-6",
          )}
          multiline={multiline}
          placeholderTextColor="#7A8391"
          style={
            multiline
              ? [
                  {
                    minHeight: 88,
                    paddingVertical: 0,
                    textAlignVertical: "top",
                  },
                  style,
                ]
              : style
          }
        />

        {rightIconName ? (
          <MaterialCommunityIcons
            color="#5C655F"
            name={rightIconName}
            size={22}
          />
        ) : null}
      </View>
    </View>
  );
}
