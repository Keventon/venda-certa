import { useAlertDialog } from "@/components/AlertDialog";
import { Loading } from "@/components/Loading";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { getCategoryLabel } from "@/constants/transactionCategories";
import { getTransactionById } from "@/database";
import type {
  TransactionRecord,
  TransactionVariant,
} from "@/types/transactions";
import { formatSignedCurrencyFromCents } from "@/utils/currency";
import clsx from "clsx";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const VARIANT_COPY: Record<
  TransactionVariant,
  {
    borderClassName: string;
    currencyClassName: string;
    eyebrow: string;
  }
> = {
  expense: {
    borderClassName: "border-[#FFB49A]",
    currencyClassName: "text-tertiary",
    eyebrow: "Despesa registrada",
  },
  income: {
    borderClassName: "border-primary",
    currencyClassName: "text-primary",
    eyebrow: "Receita registrada",
  },
};

function formatDisplayDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDisplayDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

type SummaryFieldProps = {
  isMuted?: boolean;
  label: string;
  value: string;
};

function SummaryField({ isMuted = false, label, value }: SummaryFieldProps) {
  return (
    <View className="rounded-2xl bg-background px-4 py-4">
      <Text className="font-inter-semibold text-[11px] uppercase tracking-[1px] text-text/55">
        {label}
      </Text>
      <Text
        className={clsx(
          "mt-2 font-inter-regular text-[15px] leading-6 text-text",
          isMuted && "text-text/55",
        )}
      >
        {value}
      </Text>
    </View>
  );
}

export default function TransactionDetails() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const transactionId = normalizeRouteParam(params.id);

  const [transaction, setTransaction] = useState<TransactionRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error(error);

        if (isActive) {
          showAlert({
            message: "Não foi possível carregar os detalhes da movimentação.",
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

  function navigateBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/history");
  }

  function navigateToEdit() {
    if (!transactionId) {
      return;
    }

    router.push({
      params: { id: transactionId },
      pathname: "/transaction-edit/[id]",
    });
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
          <ScreenHeader onBack={navigateBack} title="Detalhes" />
        </View>

        <View className="px-6 pt-8">
          <View className="rounded-[24px] bg-white px-6 py-6">
            <Text className="font-inter-semibold text-xl text-text">
              Movimentação não encontrada
            </Text>
            <Text className="mt-3 font-inter-regular text-base leading-6 text-text/70">
              Essa transação pode ter sido removida ou ainda não estar disponível.
            </Text>

            <View className="mt-8">
              <PrimaryButton
                label="Voltar ao histórico"
                onPress={navigateBack}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  const copy = VARIANT_COPY[transaction.variant];

  return (
    <View className="flex-1 bg-background pt-10">
      <View className="px-6">
        <ScreenHeader
          onBack={navigateBack}
          rightSlot={
            <View className="rounded-full bg-white px-4 py-2">
              <Text className="font-inter-medium text-[11px] uppercase tracking-[1px] text-text/65">
                {transaction.variant === "income" ? "Receita" : "Despesa"}
              </Text>
            </View>
          }
          title="Detalhes"
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-14 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <View
          className={clsx(
            "rounded-[28px] border-t-[3px] bg-white px-6 pb-6 pt-5",
            copy.borderClassName,
          )}
        >
          <Text className="font-inter-semibold text-[11px] uppercase tracking-[1.3px] text-text/60">
            {copy.eyebrow}
          </Text>
          <Text className="mt-4 font-inter-semibold text-[27px] leading-[36px] text-text">
            {transaction.title}
          </Text>

          <Text
            className={clsx(
              "mt-5 font-inter-semibold text-[34px] leading-[40px]",
              copy.currencyClassName,
            )}
          >
            {formatSignedCurrencyFromCents(transaction.amountInCents)}
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <View className="rounded-full bg-background px-3 py-2">
              <Text className="font-inter-medium text-[11px] uppercase tracking-[0.8px] text-text/70">
                {getCategoryLabel(transaction.variant, transaction.category)}
              </Text>
            </View>

            <View className="rounded-full bg-background px-3 py-2">
              <Text className="font-inter-medium text-[11px] uppercase tracking-[0.8px] text-text/70">
                {formatDisplayDate(transaction.occurredAt)}
              </Text>
            </View>
          </View>

          <Text className="mt-5 font-inter-regular text-sm leading-6 text-text/65">
            {transaction.variant === "income"
              ? "Confira os dados da entrada antes de seguir para a edição."
              : "Confira os dados da saída antes de seguir para a edição."}
          </Text>
        </View>

        <View className="mt-6 rounded-[28px] bg-white px-6 py-6">
          <Text className="font-inter-semibold text-sm uppercase tracking-[1.3px] text-text/75">
            Resumo da movimentação
          </Text>

          <View className="mt-5 gap-3">
            <SummaryField label="Descrição" value={transaction.title} />
            <SummaryField
              label="Categoria"
              value={getCategoryLabel(transaction.variant, transaction.category)}
            />
            <SummaryField
              label="Data da transação"
              value={formatDisplayDate(transaction.occurredAt)}
            />
            <SummaryField
              label="Última atualização"
              value={formatDisplayDateTime(transaction.updatedAt)}
            />
            <SummaryField
              isMuted={!transaction.notes?.trim()}
              label="Notas / descrição"
              value={
                transaction.notes?.trim() ||
                "Nenhuma observação registrada para essa movimentação."
              }
            />
          </View>
        </View>

        <View className="mt-8">
          <PrimaryButton
            label="Editar movimentação"
            onPress={navigateToEdit}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </View>
  );
}
