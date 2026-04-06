import { DEFAULT_BUSINESSES, DEFAULT_BUSINESS_ID } from "@/constants/businesses";
import type { BusinessId, BusinessRecord } from "@/types/business";
import type { SQLiteDatabase } from "expo-sqlite";

const ACTIVE_BUSINESS_KEY = "active_business_id";

type BusinessRow = {
  created_at: string;
  id: BusinessId;
  name: string;
  sort_order: number;
  subtitle: string;
};

function mapBusinessRow(row: BusinessRow): BusinessRecord {
  return {
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    subtitle: row.subtitle,
  };
}

export async function listBusinesses(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<BusinessRow>(
    `
      SELECT id, name, subtitle, sort_order, created_at
      FROM businesses
      ORDER BY sort_order ASC, name ASC
    `,
  );

  if (rows.length === 0) {
    return DEFAULT_BUSINESSES;
  }

  return rows.map(mapBusinessRow);
}

export async function getStoredActiveBusinessId(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ value: BusinessId }>(
    "SELECT value FROM app_preferences WHERE key = ?",
    [ACTIVE_BUSINESS_KEY],
  );

  return row?.value ?? DEFAULT_BUSINESS_ID;
}

export async function storeActiveBusinessId(
  db: SQLiteDatabase,
  businessId: BusinessId,
) {
  await db.runAsync(
    `
      INSERT INTO app_preferences (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    [ACTIVE_BUSINESS_KEY, businessId],
  );
}
