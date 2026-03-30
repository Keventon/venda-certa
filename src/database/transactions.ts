import type {
  CreateTransactionInput,
  DashboardSummary,
  HistoryPeriod,
  HistoryType,
  TransactionRecord,
  TransactionVariant,
  UpdateTransactionInput,
} from "@/types/transactions";
import type { SQLiteDatabase } from "expo-sqlite";

type TransactionRow = {
  amount_in_cents: number;
  category: TransactionRecord["category"];
  counterparty: string | null;
  created_at: string;
  id: string;
  notes: string | null;
  occurred_at: string;
  title: string;
  type_label: string;
  updated_at: string;
  variant: TransactionRecord["variant"];
};

export type ListTransactionsOptions = {
  period: HistoryPeriod;
  type: HistoryType;
};

type SumRow = {
  total: number | null;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getPeriodRange(period: HistoryPeriod) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (period === "today") {
    return {
      endAt: tomorrow.toISOString(),
      startAt: today.toISOString(),
    };
  }

  if (period === "7days") {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    return {
      endAt: tomorrow.toISOString(),
      startAt: sevenDaysAgo.toISOString(),
    };
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  return {
    endAt: nextMonthStart.toISOString(),
    startAt: monthStart.toISOString(),
  };
}

function getMonthRange(monthOffset = 0) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset + 1,
    1,
  );

  return {
    endAt: nextMonthStart.toISOString(),
    startAt: monthStart.toISOString(),
  };
}

function generateTransactionId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function assertNonZeroAmount(amountInCents: number) {
  if (amountInCents === 0) {
    throw new Error("Transaction amount must be different from zero");
  }
}

function mapRowToTransaction(row: TransactionRow): TransactionRecord {
  return {
    amountInCents: row.amount_in_cents,
    category: row.category,
    counterparty: row.counterparty,
    createdAt: row.created_at,
    id: row.id,
    notes: row.notes,
    occurredAt: row.occurred_at,
    title: row.title,
    typeLabel: row.type_label,
    updatedAt: row.updated_at,
    variant: row.variant,
  };
}

async function getSignedSum(
  db: SQLiteDatabase,
  startAt: string,
  endAt: string,
  variant?: TransactionVariant,
) {
  if (variant) {
    const row = await db.getFirstAsync<SumRow>(
      `
        SELECT COALESCE(SUM(amount_in_cents), 0) AS total
        FROM transactions
        WHERE occurred_at >= ? AND occurred_at < ? AND variant = ?
      `,
      [startAt, endAt, variant],
    );

    return row?.total ?? 0;
  }

  const row = await db.getFirstAsync<SumRow>(
    `
      SELECT COALESCE(SUM(amount_in_cents), 0) AS total
      FROM transactions
      WHERE occurred_at >= ? AND occurred_at < ?
    `,
    [startAt, endAt],
  );

  return row?.total ?? 0;
}

function calculateChangePercent(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}

export async function createTransaction(
  db: SQLiteDatabase,
  input: CreateTransactionInput,
) {
  assertNonZeroAmount(input.amountInCents);

  const now = new Date().toISOString();
  const transaction: TransactionRecord = {
    ...input,
    createdAt: now,
    id: input.id ?? generateTransactionId(),
    updatedAt: now,
  };

  await db.runAsync(
    `
      INSERT INTO transactions (
        id,
        title,
        type_label,
        variant,
        category,
        amount_in_cents,
        counterparty,
        notes,
        occurred_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      transaction.id,
      transaction.title,
      transaction.typeLabel,
      transaction.variant,
      transaction.category,
      transaction.amountInCents,
      transaction.counterparty,
      transaction.notes,
      transaction.occurredAt,
      transaction.createdAt,
      transaction.updatedAt,
    ],
  );

  return transaction;
}

export async function getTransactionById(db: SQLiteDatabase, id: string) {
  const row = await db.getFirstAsync<TransactionRow>(
    `
      SELECT
        id,
        title,
        type_label,
        variant,
        category,
        amount_in_cents,
        counterparty,
        notes,
        occurred_at,
        created_at,
        updated_at
      FROM transactions
      WHERE id = ?
    `,
    [id],
  );

  if (!row) {
    return null;
  }

  return mapRowToTransaction(row);
}

export async function updateTransaction(
  db: SQLiteDatabase,
  id: string,
  input: UpdateTransactionInput,
) {
  const current = await getTransactionById(db, id);

  if (!current) {
    return null;
  }

  const updated: TransactionRecord = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  assertNonZeroAmount(updated.amountInCents);

  await db.runAsync(
    `
      UPDATE transactions
      SET
        title = ?,
        type_label = ?,
        variant = ?,
        category = ?,
        amount_in_cents = ?,
        counterparty = ?,
        notes = ?,
        occurred_at = ?,
        updated_at = ?
      WHERE id = ?
    `,
    [
      updated.title,
      updated.typeLabel,
      updated.variant,
      updated.category,
      updated.amountInCents,
      updated.counterparty,
      updated.notes,
      updated.occurredAt,
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export async function deleteTransaction(db: SQLiteDatabase, id: string) {
  await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
}

export async function listTransactions(
  db: SQLiteDatabase,
  { period, type }: ListTransactionsOptions,
) {
  const { endAt, startAt } = getPeriodRange(period);
  const params: Array<string> = [startAt, endAt];

  let query = `
    SELECT
      id,
      title,
      type_label,
      variant,
      category,
      amount_in_cents,
      counterparty,
      notes,
      occurred_at,
      created_at,
      updated_at
    FROM transactions
    WHERE occurred_at >= ? AND occurred_at < ?
  `;

  if (type !== "all") {
    query += " AND variant = ?";
    params.push(type);
  }

  query += " ORDER BY occurred_at DESC";

  const rows = await db.getAllAsync<TransactionRow>(query, params);

  return rows.map(mapRowToTransaction);
}

export async function listRecentTransactions(
  db: SQLiteDatabase,
  limit = 3,
) {
  const rows = await db.getAllAsync<TransactionRow>(
    `
      SELECT
        id,
        title,
        type_label,
        variant,
        category,
        amount_in_cents,
        counterparty,
        notes,
        occurred_at,
        created_at,
        updated_at
      FROM transactions
      ORDER BY occurred_at DESC
      LIMIT ?
    `,
    [limit],
  );

  return rows.map(mapRowToTransaction);
}

export async function getDashboardSummary(
  db: SQLiteDatabase,
): Promise<DashboardSummary> {
  const currentMonth = getMonthRange(0);
  const previousMonth = getMonthRange(-1);

  const [
    balanceRow,
    currentIncomeSigned,
    currentExpenseSigned,
    previousIncomeSigned,
    previousExpenseSigned,
    recentTransactions,
  ] = await Promise.all([
    db.getFirstAsync<SumRow>(
      "SELECT COALESCE(SUM(amount_in_cents), 0) AS total FROM transactions",
    ),
    getSignedSum(
      db,
      currentMonth.startAt,
      currentMonth.endAt,
      "income",
    ),
    getSignedSum(
      db,
      currentMonth.startAt,
      currentMonth.endAt,
      "expense",
    ),
    getSignedSum(
      db,
      previousMonth.startAt,
      previousMonth.endAt,
      "income",
    ),
    getSignedSum(
      db,
      previousMonth.startAt,
      previousMonth.endAt,
      "expense",
    ),
    listRecentTransactions(db, 3),
  ]);

  const currentIncome = currentIncomeSigned;
  const currentExpense = Math.abs(currentExpenseSigned);
  const previousIncome = previousIncomeSigned;
  const previousExpense = Math.abs(previousExpenseSigned);

  return {
    balanceInCents: balanceRow?.total ?? 0,
    expense: {
      changePercent: calculateChangePercent(currentExpense, previousExpense),
      currentTotalInCents: currentExpense,
      previousTotalInCents: previousExpense,
    },
    income: {
      changePercent: calculateChangePercent(currentIncome, previousIncome),
      currentTotalInCents: currentIncome,
      previousTotalInCents: previousIncome,
    },
    recentTransactions,
  };
}
