import type {
  TransactionCategory,
  TransactionVariant,
} from "@/types/transactions";

export type TransactionCategoryOption = {
  label: string;
  value: TransactionCategory;
};

export const INCOME_CATEGORIES: TransactionCategoryOption[] = [
  { label: "Venda balcão", value: "counter-sale" },
  { label: "Delivery", value: "delivery" },
  { label: "Evento", value: "event" },
  { label: "Outros", value: "other" },
];

export const EXPENSE_CATEGORIES: TransactionCategoryOption[] = [
  { label: "Ingredientes", value: "ingredients" },
  { label: "Embalagens", value: "packaging" },
  { label: "Logística", value: "logistics" },
  { label: "Outros", value: "other" },
];

export const DEFAULT_INCOME_CATEGORY: TransactionCategory = "counter-sale";
export const DEFAULT_EXPENSE_CATEGORY: TransactionCategory = "ingredients";

export function getCategoryOptionsByVariant(variant: TransactionVariant) {
  return variant === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryLabel(
  variant: TransactionVariant,
  category: TransactionCategory,
) {
  const option = getCategoryOptionsByVariant(variant).find(
    (item) => item.value === category,
  );

  return option?.label ?? "Outros";
}
