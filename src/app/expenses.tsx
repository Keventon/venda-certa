import { CategorySelector } from "@/components/CategorySelector";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/styles/colors";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const EXPENSE_CATEGORIES = [
  { label: "Ingredientes", value: "ingredients" },
  { label: "Embalagens", value: "packaging" },
  { label: "Logistica", value: "logistics" },
  { label: "Energia", value: "energy" },
  { label: "Equipe", value: "team" },
  { label: "Outros", value: "other" },
];

export default function Expenses() {
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
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
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            placeholder="0,00"
            selectionColor={colors.tertiary}
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

        <InputField
          label="Data da transação"
          onChangeText={setTransactionDate}
          placeholder="mm/dd/yyyy"
          rightIconName="calendar-blank-outline"
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
