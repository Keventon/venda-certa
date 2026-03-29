import { listTransactions } from "@/database";
import { CategorySelector } from "@/components/CategorySelector";
import { Loading } from "@/components/Loading";
import { TransactionCard } from "@/components/TransactionCard";
import type {
  HistoryItem,
  HistoryPeriod,
  HistorySection,
  HistoryType,
  TransactionVariant,
} from "@/types/transactions";
import {
  formatCurrencyFromCents,
  formatSignedCurrencyFromCents,
} from "@/utils/currency";
import { useIsFocused } from "@react-navigation/native";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Alert, SectionList, Text, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const PERIOD_OPTIONS: Array<{ label: string; value: HistoryPeriod }> = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7days" },
  { label: "Mês", value: "month" },
];

const TYPE_OPTIONS: Array<{ label: string; value: HistoryType }> = [
  { label: "Tudo", value: "all" },
  { label: "Entradas", value: "income" },
  { label: "Despesas", value: "expense" },
];

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(first: Date, second: Date) {
  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

function formatCountLabel(count: number) {
  return count === 1 ? "1 movimentacao" : `${count} movimentacoes`;
}

function formatSectionTitle(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Hoje";
  }

  if (isSameDay(date, yesterday)) {
    return "Ontem";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatTransactionDescription(transaction: HistoryItem) {
  const parts = [transaction.counterparty, transaction.notes].filter(Boolean);

  if (parts.length === 0) {
    return "Sem detalhes";
  }

  return parts.join(" • ");
}

function SummaryStat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: TransactionVariant;
  value: string;
}) {
  return (
    <View
      className={clsx(
        "flex-1 rounded-2xl px-4 py-3",
        tone === "income" ? "bg-[#E9F5EE]" : "bg-[#F9E9E3]",
      )}
    >
      <Text className="font-inter-regular text-[11px] uppercase tracking-[1px] text-text/60">
        {label}
      </Text>
      <Text
        className={clsx(
          "mt-2 font-inter-semibold text-sm",
          tone === "income" ? "text-primary" : "text-[#8F2D08]",
        )}
      >
        {value}
      </Text>
    </View>
  );
}

export default function History() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [period, setPeriod] = useState<HistoryPeriod>("7days");
  const [type, setType] = useState<HistoryType>("all");
  const [transactions, setTransactions] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isActive = true;

    async function loadTransactions() {
      setIsLoading(true);

      try {
        const result = await listTransactions(db, { period, type });

        if (!isActive) {
          return;
        }

        setTransactions(result);
      } catch (error) {
        console.error(error);

        if (isActive) {
          Alert.alert(
            "Erro ao carregar",
            "Não foi possível carregar o histórico agora.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      isActive = false;
    };
  }, [db, isFocused, period, type]);

  const incomeTotal = transactions
    .filter((transaction) => transaction.variant === "income")
    .reduce((total, transaction) => total + transaction.amountInCents, 0);

  const expenseTotal = transactions
    .filter((transaction) => transaction.variant === "expense")
    .reduce(
      (total, transaction) => total + Math.abs(transaction.amountInCents),
      0,
    );

  const netTotal = transactions.reduce(
    (total, transaction) => total + transaction.amountInCents,
    0,
  );

  const groupedTransactions = transactions.reduce<Record<string, HistoryItem[]>>(
    (groups, transaction) => {
      const key = startOfDay(new Date(transaction.occurredAt)).toISOString();

      groups[key] ??= [];
      groups[key].push(transaction);

      return groups;
    },
    {},
  );

  const sections: HistorySection[] = Object.entries(groupedTransactions).map(
    ([key, data]) => ({
      countLabel: formatCountLabel(data.length),
      data,
      dateKey: key,
      key,
      title: formatSectionTitle(new Date(key)),
    }),
  );

  return (
    <SectionList<HistoryItem, HistorySection>
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingBottom: 56,
        paddingHorizontal: 24,
        paddingTop: 40,
      }}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        isLoading ? (
          <View className="items-center py-12">
            <Loading />
          </View>
        ) : (
          <View className="rounded-[24px] bg-white px-5 py-6">
            <Text className="font-inter-semibold text-base text-text">
              Nenhuma movimentacao encontrada
            </Text>
            <Text className="mt-2 font-inter-regular text-sm leading-5 text-text/65">
              Ajuste os filtros para ver outras entradas e despesas.
            </Text>
          </View>
        )
      }
      ListHeaderComponent={
        <View className="pb-8">
          <View className="mt-6 gap-4">
            <CategorySelector
              label="Período"
              onChange={(value) => setPeriod(value as HistoryPeriod)}
              options={PERIOD_OPTIONS}
              value={period}
            />

            <CategorySelector
              label="Mostrar"
              onChange={(value) => setType(value as HistoryType)}
              options={TYPE_OPTIONS}
              value={type}
            />
          </View>

          <View className="mt-7 rounded-lg bg-white px-5 py-5">
            <Text className="font-inter-semibold text-[10px] uppercase tracking-[1.3px] text-text/75">
              Resumo do período
            </Text>

            <View className="mt-4 flex-row items-end justify-between gap-3">
              <View className="flex-1">
                <Text className="font-inter-regular text-sm text-text/60">
                  Saldo filtrado
                </Text>

                <Text
                  className={clsx(
                    "mt-1 font-inter-bold text-2xl",
                    netTotal >= 0 ? "text-primary" : "text-[#8F2D08]",
                  )}
                >
                  {formatSignedCurrencyFromCents(netTotal)}
                </Text>
              </View>

              <View className="rounded-full bg-background px-3 py-2">
                <Text className="font-inter-medium text-[10px] uppercase tracking-[0.9px] text-text/70">
                  {transactions.length} itens
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row gap-3">
              <SummaryStat
                label="Entradas"
                tone="income"
                value={formatCurrencyFromCents(incomeTotal)}
              />
              <SummaryStat
                label="Despesas"
                tone="expense"
                value={formatCurrencyFromCents(expenseTotal)}
              />
            </View>
          </View>
        </View>
      }
      renderItem={({ item, index, section }) => (
        <View className={index === section.data.length - 1 ? "" : "mb-3"}>
          <TransactionCard
            amount={formatSignedCurrencyFromCents(item.amountInCents)}
            category={item.category}
            description={formatTransactionDescription(item)}
            title={item.title}
            typeLabel={item.typeLabel}
            variant={item.variant}
          />
        </View>
      )}
      renderSectionHeader={({ section }) => (
        <View className="mb-3 flex-row items-end justify-between">
          <Text className="font-inter-semibold text-sm text-text">
            {section.title}
          </Text>

          <Text className="font-inter-regular text-[11px] uppercase tracking-[0.8px] text-text/55">
            {section.countLabel}
          </Text>
        </View>
      )}
      sections={sections}
      SectionSeparatorComponent={() => <View className="h-6" />}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}
