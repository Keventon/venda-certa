import { CategorySelector } from "@/components/CategorySelector";
import { DatePickerField } from "@/components/DatePickerField";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/styles/colors";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const EXPENSE_CATEGORIES = [
  { label: "Ingredientes", value: "ingredients" },
  { label: "Embalagens", value: "packaging" },
  { label: "Logística", value: "logistics" },
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

export default function Expenses() {
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
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

        <View className="mt-6 flex-row items-center gap-2">
          <Text className="font-inter-semibold text-2xl text-tertiary">R$</Text>
          <TextInput
            className="flex-1 py-0 font-inter-medium text-2xl text-text"
            keyboardType="number-pad"
            onChangeText={(value) => setAmount(formatCurrencyInput(value))}
            placeholder="0,00"
            selectionColor={colors.tertiary}
            cursorColor={colors.tertiary}
            placeholderTextColor="rgba(26, 28, 25, 0.14)"
            style={{ height: 40, paddingVertical: 0 }}
            value={amount}
          />
        </View>
      </View>

      <View className="mt-8 gap-6">
        <InputField
          label="Nome da despesa"
          onChangeText={setVendor}
          selectionColor={colors.tertiary}
          cursorColor={colors.tertiary}
          placeholder="Ex: Distribuidora de Frutos do Mar"
          value={vendor}
        />

        <DatePickerField
          accentColor={colors.primary}
          label="Data da transação"
          onChange={setTransactionDate}
          value={transactionDate}
        />

        <CategorySelector
          label="Categoria de despesa"
          onChange={setCategory}
          options={EXPENSE_CATEGORIES}
          value={category}
        />

        <InputField
          label="Notas / Descrição"
          multiline
          selectionColor={colors.tertiary}
          cursorColor={colors.tertiary}
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
