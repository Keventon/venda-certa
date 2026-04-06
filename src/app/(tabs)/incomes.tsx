import { useAlertDialog } from "@/components/AlertDialog";
import { AnimatedEntrance } from "@/components/AnimatedEntrance";
import { CategorySelector } from "@/components/CategorySelector";
import { DatePickerField } from "@/components/DatePickerField";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  getCategoryOptionsByVariant,
  getDefaultCategory,
} from "@/constants/transactionCategories";
import { createTransaction } from "@/database";
import { useBusiness } from "@/providers/BusinessProvider";
import { colors } from "@/styles/colors";
import type { TransactionCategory } from "@/types/transactions";
import {
  formatCurrencyInput,
  hasPositiveCurrencyInput,
  parseCurrencyInputToCents,
} from "@/utils/currency";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

export default function Incomes() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const { activeBusiness } = useBusiness();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [category, setCategory] = useState<TransactionCategory>(
    getDefaultCategory(activeBusiness.id, "income"),
  );
  const [isSaving, setIsSaving] = useState(false);
  const incomeCategories = getCategoryOptionsByVariant(activeBusiness.id, "income");

  const isAmountValid = hasPositiveCurrencyInput(amount);
  const isFormValid = isAmountValid && source.trim().length > 0;

  function resetForm() {
    setAmount("");
    setSource("");
    setTransactionDate(new Date());
    setCategory(getDefaultCategory(activeBusiness.id, "income"));
  }

  useEffect(() => {
    resetForm();
  }, [activeBusiness.id]);

  async function handleSaveIncome() {
    if (isSaving) {
      return;
    }

    if (!isAmountValid) {
      showAlert({
        message: "Informe um valor maior que zero para salvar a receita.",
        title: "Valor inválido",
        tone: "info",
      });
      return;
    }

    if (!source.trim()) {
      return;
    }

    const selectedCategory = incomeCategories.find(
      (option) => option.value === category,
    );

    setIsSaving(true);

    try {
      await createTransaction(db, {
        amountInCents: parseCurrencyInputToCents(amount),
        businessId: activeBusiness.id,
        category,
        counterparty: null,
        notes: null,
        occurredAt: transactionDate.toISOString(),
        title: source.trim(),
        typeLabel: selectedCategory?.label ?? "Receita",
        variant: "income",
      });

      resetForm();
      showAlert({
        message: `A movimentação foi registrada em ${activeBusiness.name}.`,
        onClose: () => router.push("/history"),
        title: "Entrada salva",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Não foi possível salvar a entrada agora.",
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
        <View className="mt-8 rounded-xl border-t-[3px] border-primary bg-white px-6 pb-6 pt-5">
          <Text className="font-inter-semibold text-sm uppercase tracking-[1.3px] text-text/75">
            Valor total
          </Text>

          <View className="mt-6 flex-row items-center gap-2">
            <Text className="font-inter-semibold text-2xl text-primary">R$</Text>
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
      </AnimatedEntrance>

      <AnimatedEntrance delay={120}>
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
            onChange={(value) => setCategory(value as TransactionCategory)}
            options={incomeCategories}
            value={category}
          />
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={200}>
        <View className="mt-10">
          <PrimaryButton
            disabled={!isFormValid}
            isLoading={isSaving}
            label="Salvar Entrada"
            onPress={() => void handleSaveIncome()}
          />
        </View>
      </AnimatedEntrance>
    </ScrollView>
  );
}
