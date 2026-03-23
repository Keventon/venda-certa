import { CategorySelector } from "@/components/CategorySelector";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const EXPENSE_CATEGORIES = [
  { label: "Ingredientes", value: "ingredients" },
  { label: "Embalagens", value: "packaging" },
  { label: "Logistica", value: "logistics" },
  { label: "Energia", value: "energy" },
  { label: "Equipe", value: "team" },
  { label: "Outros", value: "other" },
];

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return amount.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default function Expenses() {
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState("ingredients");
  const [notes, setNotes] = useState("");

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-14 pt-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="mt-8 rounded-xl border-t-[3px] border-[#FFB49A] bg-white px-6 pb-6 pt-5">
        <Text className="font-inter-semibold text-sm uppercase tracking-[1.3px] text-text/75">
          Valor total
        </Text>

        <View className="mt-6 flex-row items-end gap-2">
          <Text className="pb-1 font-inter-semibold text-2xl text-tertiary">
            R$
          </Text>
          <TextInput
            className="flex-1 font-inter-bold text-3xl text-text"
            keyboardType="number-pad"
            onChangeText={(value) => setAmount(formatCurrencyInput(value))}
            placeholder="0,00"
            selectionColor={colors.tertiary}
            cursorColor={colors.tertiary}
            placeholderTextColor="rgba(26, 28, 25, 0.14)"
            value={amount}
          />
        </View>
      </View>

      <View className="mt-8 gap-6">
        <InputField
          label="Nome da despesa"
          onChangeText={setVendor}
          placeholder="ex: Distribuidora de Frutos do Mar"
          value={vendor}
        />

        <View className="gap-2">
          <Text className="font-inter-medium text-sm text-text/75">
            Data da transação
          </Text>

          <Pressable
            className="h-14 flex-row items-center rounded-lg border border-text/10 bg-white px-4"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="flex-1 font-inter-regular text-base text-text">
              {formatDate(transactionDate)}
            </Text>

            <MaterialCommunityIcons
              color="#5C655F"
              name="calendar-blank-outline"
              size={22}
            />
          </Pressable>

          {showDatePicker ? (
            <View className="overflow-hidden rounded-lg border border-text/10 bg-white px-2 py-1">
              <DateTimePicker
                display={Platform.OS === "ios" ? "spinner" : "default"}
                mode="date"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }

                  if (event.type === "dismissed" || !selectedDate) {
                    return;
                  }

                  setTransactionDate(selectedDate);
                }}
                value={transactionDate}
              />

              {Platform.OS === "ios" ? (
                <Pressable
                  className="items-end px-3 pb-2"
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text className="font-inter-medium text-sm text-primary">
                    Concluir
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        <CategorySelector
          label="Categoria de despesa"
          onChange={setCategory}
          options={EXPENSE_CATEGORIES}
          value={category}
        />

        <InputField
          label="Notas / Descrição"
          multiline
          onChangeText={setNotes}
          placeholder="Forneça detalhes sobre este gasto..."
          value={notes}
        />
      </View>

      <View className="mt-10">
        <PrimaryButton label="Salvar Despesa" />
      </View>
    </ScrollView>
  );
}
