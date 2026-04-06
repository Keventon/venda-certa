import { useAlertDialog } from "@/components/AlertDialog";
import { AnimatedEntrance } from "@/components/AnimatedEntrance";
import { CategorySelector } from "@/components/CategorySelector";
import { DatePickerField } from "@/components/DatePickerField";
import { InputField } from "@/components/InputField";
import { Loading } from "@/components/Loading";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  getCategoryLabel,
  getCategoryOptionsByVariant,
  getDefaultCategory,
} from "@/constants/transactionCategories";
import {
  deleteTransaction,
  getTransactionById,
  updateTransaction,
} from "@/database";
import { colors } from "@/styles/colors";
import type {
  TransactionCategory,
  TransactionRecord,
  TransactionVariant,
} from "@/types/transactions";
import {
  formatCurrencyInput,
  formatCurrencyInputFromCents,
  hasPositiveCurrencyInput,
  parseCurrencyInputToCents,
} from "@/utils/currency";
import clsx from "clsx";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const VARIANT_COPY: Record<
  TransactionVariant,
  {
    accentColor: string;
    borderClassName: string;
    currencyClassName: string;
    categoryLabel: string;
    dateAccentColor: string;
    fieldLabel: string;
    fieldPlaceholder: string;
    saveLabel: string;
    screenTitle: string;
    typeLabel: string;
  }
> = {
  expense: {
    accentColor: colors.tertiary,
    borderClassName: "border-[#FFB49A]",
    categoryLabel: "Categoria de despesa",
    currencyClassName: "text-tertiary",
    dateAccentColor: colors.primary,
    fieldLabel: "Nome da despesa",
    fieldPlaceholder: "Ex: Distribuidora de Frutos do Mar",
    saveLabel: "Salvar Despesa",
    screenTitle: "Editar despesa",
    typeLabel: "Despesa",
  },
  income: {
    accentColor: colors.primary,
    borderClassName: "border-primary",
    categoryLabel: "Categorias",
    currencyClassName: "text-primary",
    dateAccentColor: colors.primary,
    fieldLabel: "Nome da entrada",
    fieldPlaceholder: "Ex: Venda do jantar executivo",
    saveLabel: "Salvar Receita",
    screenTitle: "Editar receita",
    typeLabel: "Receita",
  },
};

function normalizeRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function TransactionEditScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const transactionId = normalizeRouteParam(params.id);

  const [transaction, setTransaction] = useState<TransactionRecord | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [category, setCategory] = useState<TransactionCategory>(
    getDefaultCategory("restaurant", "expense"),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function syncFormState(record: TransactionRecord) {
    setTitle(record.title);
    setAmount(formatCurrencyInputFromCents(record.amountInCents));
    setTransactionDate(new Date(record.occurredAt));
    setCategory(record.category);
  }

  useEffect(() => {
    let isActive = true;

    async function loadTransaction() {
      if (!transactionId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const result = await getTransactionById(db, transactionId);

        if (!isActive) {
          return;
        }

        setTransaction(result);

        if (result) {
          syncFormState(result);
        }
      } catch (error) {
        console.error(error);

        if (isActive) {
          showAlert({
            message: "Não foi possível carregar os dados da movimentação.",
            title: "Erro ao carregar",
            tone: "error",
          });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadTransaction();

    return () => {
      isActive = false;
    };
  }, [db, showAlert, transactionId]);

  function navigateToDetails() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (transactionId) {
      router.replace({
        params: { id: transactionId },
        pathname: "/transactions/[id]",
      });
      return;
    }

    router.replace("/history");
  }

  function navigateToHistory() {
    router.replace("/history");
  }

  function navigateToHistoryAfterDelete() {
    router.dismissAll();
    router.replace("/history");
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loading />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View className="flex-1 bg-background pt-10">
        <View className="px-6">
          <ScreenHeader onBack={navigateToHistory} title="Editar" />
        </View>

        <View className="px-6 pt-8">
          <AnimatedEntrance delay={60}>
            <View className="rounded-[24px] bg-white px-6 py-6">
              <Text className="font-inter-semibold text-xl text-text">
                Movimentação não encontrada
              </Text>
              <Text className="mt-3 font-inter-regular text-base leading-6 text-text/70">
                Essa transação pode ter sido removida ou ainda não estar
                disponível.
              </Text>

              <View className="mt-8">
                <PrimaryButton
                  label="Voltar ao histórico"
                  onPress={navigateToHistory}
                />
              </View>
            </View>
          </AnimatedEntrance>
        </View>
      </View>
    );
  }

  const copy = VARIANT_COPY[transaction.variant];
  const categoryOptions = getCategoryOptionsByVariant(
    transaction.businessId,
    transaction.variant,
  );
  const currentTransaction = transaction;
  const isAmountValid = hasPositiveCurrencyInput(amount);
  const isFormValid = isAmountValid && title.trim().length > 0;

  async function handleSaveChanges() {
    if (!transactionId || isSaving || isDeleting) {
      return;
    }

    if (!isAmountValid) {
      showAlert({
        message: "Informe um valor maior que zero para salvar a movimentação.",
        title: "Valor inválido",
        tone: "info",
      });
      return;
    }

    if (!title.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const amountInCents =
        currentTransaction.variant === "expense"
          ? -parseCurrencyInputToCents(amount)
          : parseCurrencyInputToCents(amount);

      await updateTransaction(db, transactionId, {
        amountInCents,
        category,
        occurredAt: transactionDate.toISOString(),
        title: title.trim(),
        typeLabel: getCategoryLabel(
          currentTransaction.businessId,
          currentTransaction.variant,
          category,
        ),
      });

      showAlert({
        message: "As alterações foram salvas com sucesso.",
        onClose: navigateToDetails,
        title: "Movimentação atualizada",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Não foi possível atualizar essa movimentação agora.",
        title: "Erro ao salvar",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTransaction() {
    if (!transactionId) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteTransaction(db, transactionId);

      showAlert({
        message: "A movimentação foi removida com sucesso.",
        onClose: navigateToHistoryAfterDelete,
        title: "Movimentação excluída",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Não foi possível remover essa movimentação agora.",
        title: "Erro ao excluir",
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDeleteRequest() {
    if (isSaving || isDeleting) {
      return;
    }

    showAlert({
      cancelLabel: "Manter",
      confirmLabel: "Excluir",
      message:
        "Essa ação remove a movimentação do histórico e atualiza os totais do painel.",
      onConfirm: () => void handleDeleteTransaction(),
      title: "Excluir movimentação?",
      tone: "error",
    });
  }

  return (
    <View className="flex-1 bg-background pt-10">
      <View className="px-6">
        <ScreenHeader
          onBack={navigateToDetails}
          rightSlot={
            <View className="rounded-full bg-white px-4 py-2">
              <Text className="font-inter-medium text-[11px] uppercase tracking-[1px] text-text/65">
                {copy.typeLabel}
              </Text>
            </View>
          }
          title={copy.screenTitle}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-14 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <AnimatedEntrance delay={40}>
          <View
            className={clsx(
              "rounded-lg border-t-[3px] bg-white px-6 pb-6 pt-5",
              copy.borderClassName,
            )}
          >
            <Text className="font-inter-semibold text-sm uppercase tracking-[1.3px] text-text/75">
              Valor total
            </Text>

            <View className="mt-6 flex-row items-center gap-2">
              <Text
                className={clsx(
                  "font-inter-semibold text-2xl",
                  copy.currencyClassName,
                )}
              >
                R$
              </Text>
              <TextInput
                className="flex-1 py-0 font-inter-medium text-2xl text-text"
                cursorColor={copy.accentColor}
                keyboardType="number-pad"
                onChangeText={(value) => setAmount(formatCurrencyInput(value))}
                placeholder="0,00"
                placeholderTextColor="rgba(26, 28, 25, 0.14)"
                selectionColor={copy.accentColor}
                style={{ height: 40, paddingVertical: 0 }}
                value={amount}
              />
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={120}>
          <View className="mt-8 gap-6">
            <InputField
              cursorColor={copy.accentColor}
              label={copy.fieldLabel}
              onChangeText={setTitle}
              placeholder={copy.fieldPlaceholder}
              selectionColor={copy.accentColor}
              value={title}
            />

            <DatePickerField
              accentColor={copy.dateAccentColor}
              label="Data da transação"
              onChange={setTransactionDate}
              value={transactionDate}
            />

            <CategorySelector
              label={copy.categoryLabel}
              onChange={(value) => setCategory(value as TransactionCategory)}
              options={categoryOptions}
              value={category}
            />
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={200}>
          <View className="mt-10 gap-3">
            <PrimaryButton
              disabled={!isFormValid || isDeleting}
              isLoading={isSaving}
              label={copy.saveLabel}
              onPress={() => void handleSaveChanges()}
            />

            <PrimaryButton
              disabled={isSaving}
              isLoading={isDeleting}
              label="Excluir movimentação"
              onPress={handleDeleteRequest}
              variant="dangerSecondary"
            />
          </View>
        </AnimatedEntrance>
      </ScrollView>
    </View>
  );
}
