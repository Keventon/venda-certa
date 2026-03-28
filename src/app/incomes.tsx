import { CategorySelector } from "@/components/CategorySelector";
import { DatePickerField } from "@/components/DatePickerField";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/styles/colors";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const INCOME_CATEGORIES = [
  { label: "Venda balcão", value: "counter-sale" },
  { label: "Delivery", value: "delivery" },
  { label: "Evento", value: "event" },
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

export default function Incomes() {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [category, setCategory] = useState("counter-sale");
  const [notes, setNotes] = useState("");

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-14 pt-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="mt-8 rounded-xl border-t-[3px] border-primary bg-white px-6 pb-6 pt-5">
        <Text className="font-inter-semibold text-sm uppercase tracking-[1.3px] text-text/75">
          Valor total
        </Text>

        <View className="mt-6 flex-row items-center gap-2">
          <Text className="font-inter-semibold text-2xl text-primary">
            R$
          </Text>
          <TextInput
            className="flex-1 py-0 font-inter-medium text-2xl text-text"
            cursorColor={colors.primary}
            keyboardType="number-pad"
            onChangeText={(value) => setAmount(formatCurrencyInput(value))}
            placeholder="0,00"
            placeholderTextColor="rgba(26, 28, 25, 0.14)"
            selectionColor={colors.primary}
            style={{ height: 40, paddingVertical: 0 }}
            value={amount}
          />
        </View>
      </View>

      <View className="mt-8 gap-6">
        <InputField
          label="Nome da entrada"
          onChangeText={setSource}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          placeholder="Ex: Venda do jantar executivo"
          value={source}
        />

        <DatePickerField
          accentColor={colors.primary}
          label="Data da transação"
          onChange={setTransactionDate}
          value={transactionDate}
        />

        <CategorySelector
          label="Categorias"
          onChange={setCategory}
          options={INCOME_CATEGORIES}
          value={category}
        />

        <InputField
          label="Notas / Descrição"
          multiline
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          onChangeText={setNotes}
          placeholder="Forneça detalhes sobre esta entrada..."
          value={notes}
        />
      </View>

      <View className="mt-10">
        <PrimaryButton label="Salvar Entrada" />
      </View>
    </ScrollView>
  );
}
