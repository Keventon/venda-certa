import type { SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "venda-certa.db";

export async function migrateDatabaseIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      type_label TEXT NOT NULL,
      variant TEXT NOT NULL CHECK (variant IN ('income', 'expense')),
      category TEXT NOT NULL,
      amount_in_cents INTEGER NOT NULL,
      counterparty TEXT,
      notes TEXT,
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at
      ON transactions (occurred_at DESC);

    CREATE INDEX IF NOT EXISTS idx_transactions_variant_occurred_at
      ON transactions (variant, occurred_at DESC);
  `);

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  if ((result?.user_version ?? 0) < 2) {
    await db.execAsync(`
      DELETE FROM transactions;
      PRAGMA user_version = 2;
    `);
  }
}
