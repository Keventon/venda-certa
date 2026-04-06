import type { BusinessId } from "@/types/business";

export type TransactionVariant = "income" | "expense";

export type TransactionCategory =
  | "accessories"
  | "bills"
  | "cleaning"
  | "counter-sale"
  | "delivery"
  | "event"
  | "food"
  | "ingredients"
  | "logistics"
  | "medicine"
  | "other"
  | "packaging"
  | "pet-food"
  | "sales"
  | "stock"
  | "subscription"
  | "utilities";

export type TransactionRecord = {
  // Persist a signed integer in cents to avoid floating-point drift.
  amountInCents: number;
  businessId: BusinessId;
  category: TransactionCategory;
  counterparty: string | null;
  createdAt: string;
  id: string;
  notes: string | null;
  occurredAt: string;
  title: string;
  typeLabel: string;
  updatedAt: string;
  variant: TransactionVariant;
};

export type NewTransactionInput = Omit<
  TransactionRecord,
  "createdAt" | "updatedAt"
>;

export type CreateTransactionInput = Omit<NewTransactionInput, "id"> & {
  id?: string;
};

export type UpdateTransactionInput = Partial<
  Omit<TransactionRecord, "id" | "createdAt" | "updatedAt">
>;

export type HistoryPeriod = "today" | "7days" | "month";
export type HistoryType = "all" | TransactionVariant;

export type SectionListSection<TItem> = {
  data: TItem[];
  key: string;
  title: string;
};

export type HistoryItem = TransactionRecord;

export type HistorySection = SectionListSection<HistoryItem> & {
  countLabel: string;
  dateKey: string;
};

export type HistoryFilters = {
  monthDate?: string;
  period: HistoryPeriod;
  type: HistoryType;
};

export type DashboardMetric = {
  changePercent: number | null;
  currentTotalInCents: number;
  previousTotalInCents: number;
};

export type DashboardSummary = {
  balanceInCents: number;
  expense: DashboardMetric;
  income: DashboardMetric;
  recentTransactions: TransactionRecord[];
};
