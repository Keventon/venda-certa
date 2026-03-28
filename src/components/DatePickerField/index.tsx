import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

type DatePickerFieldProps = {
  accentColor: string;
  label: string;
  onChange: (date: Date) => void;
  value: Date;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export function DatePickerField({
  accentColor,
  label,
  onChange,
  value,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState(value);

  const openPicker = () => {
    setDraftDate(value);
    setShowPicker(true);
  };

  return (
    <View className="gap-2">
      <Text className="font-inter-regular text-sm text-text/75">{label}</Text>

      <Pressable
        className="h-14 flex-row items-center rounded-lg bg-white px-4"
        onPress={openPicker}
      >
        <Text className="flex-1 font-inter-regular text-base text-text">
          {formatDate(value)}
        </Text>

        <MaterialCommunityIcons
          color="#5C655F"
          name="calendar-blank-outline"
          size={22}
        />
      </Pressable>

      {showPicker && Platform.OS === "android" ? (
        <DateTimePicker
          accentColor={accentColor}
          display="default"
          locale="pt-BR"
          mode="date"
          onChange={(event, selectedDate) => {
            setShowPicker(false);

            if (event.type === "dismissed" || !selectedDate) {
              return;
            }

            onChange(selectedDate);
          }}
          value={value}
        />
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
        transparent
        visible={showPicker && Platform.OS === "ios"}
      >
        <View className="flex-1 items-center justify-center bg-black/35 px-6">
          <View className="w-full max-w-[360px] rounded-[24px] bg-white px-5 pb-4 pt-5">
            <Text className="font-inter-semibold text-base text-text">
              {label}
            </Text>

            <View className="mt-4 items-center rounded-[18px] bg-background px-2 py-2">
              <DateTimePicker
                accentColor={accentColor}
                display="spinner"
                locale="pt-BR"
                mode="date"
                onChange={(_, selectedDate) => {
                  if (!selectedDate) {
                    return;
                  }

                  setDraftDate(selectedDate);
                }}
                value={draftDate}
              />
            </View>

            <View className="mt-4 flex-row justify-end gap-3">
              <Pressable
                className="rounded-xl px-3 py-2"
                onPress={() => setShowPicker(false)}
              >
                <Text className="font-inter-medium text-sm text-text/70">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                className="rounded-xl bg-primary px-4 py-2"
                onPress={() => {
                  onChange(draftDate);
                  setShowPicker(false);
                }}
              >
                <Text className="font-inter-medium text-sm text-neutral">
                  Concluir
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
