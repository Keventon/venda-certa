import { createTransaction } from "@/database";
import { useAlertDialog } from "@/components/AlertDialog";
import { AnimatedEntrance } from "@/components/AnimatedEntrance";
import { CategorySelector } from "@/components/CategorySelector";
import { DatePickerField } from "@/components/DatePickerField";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  DEFAULT_EXPENSE_CATEGORY,
  EXPENSE_CATEGORIES,
} from "@/constants/transactionCategories";
import { colors } from "@/styles/colors";
import type { TransactionCategory } from "@/types/transactions";
import {
  formatCurrencyInput,
  hasPositiveCurrencyInput,
  parseCurrencyInputToCents,
} from "@/utils/currency";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

export default function Expenses() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [category, setCategory] = useState<TransactionCategory>(
    DEFAULT_EXPENSE_CATEGORY,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");

  const isAmountValid = hasPositiveCurrencyInput(amount);
  const isFormValid = isAmountValid && vendor.trim().length > 0;

  function resetForm() {
    setAmount("");
    setVendor("");
    setTransactionDate(new Date());
    setCategory(DEFAULT_EXPENSE_CATEGORY);
    setNotes("");
  }

  async function handleSaveExpense() {
    if (isSaving) {
      return;
    }

    if (!isAmountValid) {
      showAlert({
        message: "Informe um valor maior que zero para salvar a despesa.",
        title: "Valor inválido",
        tone: "info",
      });
      return;
    }

    if (!vendor.trim()) {
      return;
    }

    const selectedCategory = EXPENSE_CATEGORIES.find(
      (option) => option.value === category,
    );

    setIsSaving(true);

    try {
      await createTransaction(db, {
        amountInCents: -parseCurrencyInputToCents(amount),
        category,
        counterparty: null,
        notes: notes.trim() || null,
        occurredAt: transactionDate.toISOString(),
        title: vendor.trim(),
        typeLabel: selectedCategory?.label ?? "Despesa",
        variant: "expense",
      });

      resetForm();
      showAlert({
        message: "A movimentação foi registrada no histórico.",
        onClose: () => router.push("/history"),
        title: "Despesa salva",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Não foi possível salvar a despesa agora.",
        title: "Erro ao salvar",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-14 pt-10"
      showsVerticalScrollIndicator={false}
    >
      <AnimatedEntrance delay={40}>
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
      </AnimatedEntrance>

      <AnimatedEntrance delay={120}>
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
            onChange={(value) => setCategory(value as TransactionCategory)}
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
      </AnimatedEntrance>

      <AnimatedEntrance delay={200}>
        <View className="mt-10">
          <PrimaryButton
            disabled={!isFormValid}
            isLoading={isSaving}
            label="Salvar Despesa"
            onPress={() => void handleSaveExpense()}
          />
        </View>
      </AnimatedEntrance>
    </ScrollView>
  );
}
