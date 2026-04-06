import { DEFAULT_BUSINESSES, DEFAULT_BUSINESS_ID } from "@/constants/businesses";
import type { SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "venda-certa.db";

type TableInfoRow = {
  name: string;
};

async function hasTransactionColumn(
  db: SQLiteDatabase,
  columnName: string,
) {
  const rows = await db.getAllAsync<TableInfoRow>("PRAGMA table_info(transactions)");

  return rows.some((row) => row.name === columnName);
}

export async function migrateDatabaseIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_preferences (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      business_id TEXT NOT NULL,
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
  `);

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 2) {
    await db.execAsync(`
      DELETE FROM transactions;
      PRAGMA user_version = 2;
    `);
  }

  if (!(await hasTransactionColumn(db, "business_id"))) {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN business_id TEXT;
    `);
  }

  for (const business of DEFAULT_BUSINESSES) {
    await db.runAsync(
      `
        INSERT INTO businesses (
          id,
          name,
          subtitle,
          sort_order,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          subtitle = excluded.subtitle,
          sort_order = excluded.sort_order
      `,
      [
        business.id,
        business.name,
        business.subtitle,
        business.sortOrder,
        business.createdAt,
      ],
    );
  }

  await db.runAsync(
    `
      INSERT OR IGNORE INTO app_preferences (key, value)
      VALUES (?, ?)
    `,
    ["active_business_id", DEFAULT_BUSINESS_ID],
  );

  await db.runAsync(
    `
      UPDATE transactions
      SET business_id = ?
      WHERE business_id IS NULL OR business_id = ''
    `,
    [DEFAULT_BUSINESS_ID],
  );

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at
      ON transactions (occurred_at DESC);

    CREATE INDEX IF NOT EXISTS idx_transactions_variant_occurred_at
      ON transactions (variant, occurred_at DESC);

    CREATE INDEX IF NOT EXISTS idx_transactions_business_occurred_at
      ON transactions (business_id, occurred_at DESC);

    CREATE INDEX IF NOT EXISTS idx_transactions_business_variant_occurred_at
      ON transactions (business_id, variant, occurred_at DESC);

    PRAGMA user_version = 4;
  `);
}
