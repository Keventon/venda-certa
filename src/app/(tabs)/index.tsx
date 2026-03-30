import Abstract from "@/assets/abstract.svg";
import { useAlertDialog } from "@/components/AlertDialog";
import { AnimatedEntrance } from "@/components/AnimatedEntrance";
import { Loading } from "@/components/Loading";
import { MetricCard } from "@/components/MetricCard";
import { TransactionCard } from "@/components/TransactionCard";
import { getDashboardSummary } from "@/database";
import type { DashboardSummary, TransactionRecord } from "@/types/transactions";
import {
  formatCurrencyFromCents,
  formatSignedCurrencyFromCents,
} from "@/utils/currency";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

function formatMetricChange(
  currentTotalInCents: number,
  previousTotalInCents: number,
  changePercent: number | null,
) {
  if (currentTotalInCents === 0 && previousTotalInCents === 0) {
    return "Sem movimentações neste período";
  }

  if (changePercent === null) {
    return "Sem base no mês anterior";
  }

  if (changePercent === 0) {
    return "Mesmo valor do mês anterior";
  }

  return `${Math.abs(changePercent)}% ${
    changePercent > 0 ? "acima" : "abaixo"
  } do mês anterior`;
}

function formatRelativeTime(date: string) {
  const now = new Date();
  const occurredAt = new Date(date);

  if (Number.isNaN(occurredAt.getTime())) {
    return "Data inválida";
  }

  const diffInMinutes = Math.round(
    (occurredAt.getTime() - now.getTime()) / (1000 * 60),
  );
  const absMinutes = Math.abs(diffInMinutes);

  if (absMinutes < 60) {
    if (absMinutes <= 1) {
      return "agora";
    }

    return `há ${absMinutes} min`;
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  const absHours = Math.abs(diffInHours);

  if (absHours < 24) {
    return `há ${absHours} h`;
  }

  const diffInDays = Math.round(diffInHours / 24);

  if (Math.abs(diffInDays) === 1) {
    return "ontem";
  }

  if (Math.abs(diffInDays) < 7) {
    return `há ${Math.abs(diffInDays)} dias`;
  }

  const monthLabels = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  return `${String(occurredAt.getDate()).padStart(2, "0")} ${
    monthLabels[occurredAt.getMonth()]
  }`;
}

function formatTransactionDescription(transaction: TransactionRecord) {
  const leadingText =
    transaction.counterparty ?? transaction.notes ?? "Sem detalhes";
  const timeLabel = formatRelativeTime(transaction.occurredAt);

  return `${leadingText} • ${timeLabel}`;
}

export default function Index() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const router = useRouter();
  const { showAlert } = useAlertDialog();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isActive = true;

    async function loadDashboard() {
      setIsLoading(true);

      try {
        const summary = await getDashboardSummary(db);

        if (!isActive) {
          return;
        }

        setDashboard(summary);
      } catch (error) {
        console.error(error);

        if (isActive) {
          showAlert({
            message: "Não foi possível carregar os dados da tela inicial.",
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

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [db, isFocused, showAlert]);

  if (!dashboard && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loading />
      </View>
    );
  }

  const summary = dashboard ?? {
    balanceInCents: 0,
    expense: {
      changePercent: 0,
      currentTotalInCents: 0,
      previousTotalInCents: 0,
    },
    income: {
      changePercent: 0,
      currentTotalInCents: 0,
      previousTotalInCents: 0,
    },
    recentTransactions: [],
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 pb-12 pt-10"
      showsVerticalScrollIndicator={false}
    >
      <AnimatedEntrance delay={30}>
        <View className="mt-8 overflow-hidden rounded-lg bg-primary px-6 pb-6 pt-7">
          <Abstract
            width={150}
            height={150}
            style={{
              opacity: 0.2,
              position: "absolute",
              right: 24,
              top: -18,
            }}
          />

          <Text className="font-inter-regular text-sm uppercase text-neutral/80">
            Saldo em caixa
          </Text>

          <Text className="mt-5 font-inter-bold text-xl leading-none text-neutral">
            {formatCurrencyFromCents(summary.balanceInCents)}
          </Text>
        </View>
      </AnimatedEntrance>

      <View className="mt-7 gap-4">
        <MetricCard
          amount={formatCurrencyFromCents(summary.income.currentTotalInCents)}
          change={formatMetricChange(
            summary.income.currentTotalInCents,
            summary.income.previousTotalInCents,
            summary.income.changePercent,
          )}
          delay={110}
          title="Entrada mensal"
          variant="income"
        />

        <MetricCard
          amount={formatCurrencyFromCents(summary.expense.currentTotalInCents)}
          change={formatMetricChange(
            summary.expense.currentTotalInCents,
            summary.expense.previousTotalInCents,
            summary.expense.changePercent,
          )}
          delay={170}
          title="Despesas mensais"
          variant="expense"
        />
      </View>

      <AnimatedEntrance delay={230}>
        <View className="mt-6">
          <Text className="text-text text-sm font-inter-medium">
            Transações recentes
          </Text>
        </View>
      </AnimatedEntrance>

      <View className="mt-4">
        {summary.recentTransactions.length === 0 ? (
          <AnimatedEntrance delay={280}>
            <View className="rounded-lg bg-white px-5 py-5">
              <Text className="font-inter-semibold text-sm text-text">
                Nenhuma transação cadastrada
              </Text>
              <Text className="mt-2 font-inter-regular text-sm leading-5 text-text/65">
                As movimentações salvas em receita e despesa aparecerão aqui.
              </Text>
            </View>
          </AnimatedEntrance>
        ) : (
          summary.recentTransactions.map((transaction, index) => (
            <View
              key={transaction.id}
              className={
                index === summary.recentTransactions.length - 1 ? "" : "mb-2"
              }
            >
              <TransactionCard
                amount={formatSignedCurrencyFromCents(transaction.amountInCents)}
                category={transaction.category}
                delay={280 + index * 70}
                description={formatTransactionDescription(transaction)}
                onPress={() => router.push(`/transactions/${transaction.id}`)}
                title={transaction.title}
                typeLabel={transaction.typeLabel}
                variant={transaction.variant}
              />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
