import { colors } from "@/styles/colors";
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
  ...props
}: InputFieldProps) {
  return (
    <View className="gap-2">
      <Text className="font-inter-medium text-sm text-text/75">{label}</Text>

      <View
        className={clsx(
          "border border-text/10 bg-white px-4",
          multiline
            ? "min-h-[54px] rounded-lg py-4"
            : "h-14 flex-row items-center rounded-lg",
        )}
      >
        <TextInput
          {...props}
          selectionColor={colors.tertiary}
          className={clsx("flex-1 font-inter-regular text-base text-text")}
          multiline={multiline}
          placeholderTextColor="#7A8391"
          style={multiline ? { textAlignVertical: "top" } : undefined}
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
