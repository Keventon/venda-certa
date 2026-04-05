import { useAlertDialog } from "@/components/AlertDialog";
import { AnimatedEntrance } from "@/components/AnimatedEntrance";
import { CategorySelector } from "@/components/CategorySelector";
import { Loading } from "@/components/Loading";
import { MonthNavigator } from "@/components/MonthNavigator";
import { TransactionCard } from "@/components/TransactionCard";
import { listTransactions } from "@/database";
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
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { SectionList, Text, View } from "react-native";

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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(first: Date, second: Date) {
  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

function formatCountLabel(count: number) {
  return count === 1 ? "1 movimentação" : `${count} movimentações`;
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

function formatSelectedMonth(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSummaryTitle(period: HistoryPeriod, selectedMonth: Date) {
  if (period !== "month") {
    return "Resumo do período";
  }

  return `Resumo de ${formatSelectedMonth(selectedMonth)}`;
}

function formatTransactionDescription(transaction: HistoryItem) {
  const counterparty = transaction.counterparty?.trim();
  const occurredTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(transaction.occurredAt));

  if (counterparty) {
    return `${counterparty} • ${occurredTime}`;
  }

  return `Registrada às ${occurredTime}`;
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
        "flex-1 rounded-lg px-4 py-3",
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
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const [period, setPeriod] = useState<HistoryPeriod>("7days");
  const [type, setType] = useState<HistoryType>("all");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    startOfMonth(new Date()),
  );
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
        const result = await listTransactions(db, {
          monthDate:
            period === "month" ? startOfMonth(selectedMonth).toISOString() : undefined,
          period,
          type,
        });

        if (!isActive) {
          return;
        }

        setTransactions(result);
      } catch (error) {
        console.error(error);

        if (isActive) {
          showAlert({
            message: "Não foi possível carregar o histórico agora.",
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

    void loadTransactions();

    return () => {
      isActive = false;
    };
  }, [db, isFocused, period, selectedMonth, showAlert, type]);

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

  const groupedTransactions = transactions.reduce<
    Record<string, HistoryItem[]>
  >((groups, transaction) => {
    const key = startOfDay(new Date(transaction.occurredAt)).toISOString();

    groups[key] ??= [];
    groups[key].push(transaction);

    return groups;
  }, {});

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
          <AnimatedEntrance delay={120}>
            <View className="items-center py-12">
              <Loading />
            </View>
          </AnimatedEntrance>
        ) : (
          <AnimatedEntrance delay={120}>
            <View className="rounded-lg bg-white px-5 py-6">
              <Text className="font-inter-semibold text-base text-text">
                Nenhuma movimentacao encontrada
              </Text>
              <Text className="mt-2 font-inter-regular text-sm leading-5 text-text/65">
                Ajuste os filtros para ver outras entradas e despesas.
              </Text>
            </View>
          </AnimatedEntrance>
        )
      }
      ListHeaderComponent={
        <View className="pb-8">
          <AnimatedEntrance delay={40}>
            <View className="mt-6 gap-4">
              <CategorySelector
                label="Período"
                onChange={(value) => setPeriod(value as HistoryPeriod)}
                options={PERIOD_OPTIONS}
                value={period}
              />

              {period === "month" ? (
                <MonthNavigator
                  onChange={setSelectedMonth}
                  value={selectedMonth}
                />
              ) : null}

              <CategorySelector
                label="Mostrar"
                onChange={(value) => setType(value as HistoryType)}
                options={TYPE_OPTIONS}
                value={type}
              />
            </View>
          </AnimatedEntrance>

          <AnimatedEntrance delay={110}>
            <View className="mt-7 rounded-lg bg-white px-5 py-5">
              <Text className="font-inter-semibold text-[10px] uppercase tracking-[1.3px] text-text/75">
                {formatSummaryTitle(period, selectedMonth)}
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
                  <Text className="font-inter-medium text-xs uppercase tracking-[0.7px] text-text/70">
                    {transactions.length}{" "}
                    {transactions.length === 1 ? "Item" : "Itens"}
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
          </AnimatedEntrance>
        </View>
      }
      renderItem={({ item, index, section }) => (
        <View className={index === section.data.length - 1 ? "" : "mb-2"}>
          <TransactionCard
            amount={formatSignedCurrencyFromCents(item.amountInCents)}
            category={item.category}
            delay={Math.min(index, 4) * 55}
            description={formatTransactionDescription(item)}
            onPress={() => router.push(`/transactions/${item.id}`)}
            title={item.title}
            typeLabel={item.typeLabel}
            variant={item.variant}
          />
        </View>
      )}
      renderSectionHeader={({ section }) => (
        <View className="mb-2 flex-row items-end justify-between">
          <Text className="font-inter-semibold ms-2 text-sm text-text">
            {section.title}
          </Text>

          <Text className="font-inter-regular mr-2 text-sm tracking-[0.8px] text-text/55">
            {section.countLabel}
          </Text>
        </View>
      )}
      sections={sections}
      SectionSeparatorComponent={() => <View className="h-4" />}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}
