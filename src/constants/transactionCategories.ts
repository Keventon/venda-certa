import type { BusinessId } from "@/types/business";
import type {
  TransactionCategory,
  TransactionVariant,
} from "@/types/transactions";

export type TransactionCategoryOption = {
  label: string;
  value: TransactionCategory;
};

const CATEGORY_OPTIONS: Record<
  BusinessId,
  Record<TransactionVariant, TransactionCategoryOption[]>
> = {
  petshop: {
    expense: [
      { label: "Reposição", value: "stock" },
      { label: "Higiene", value: "cleaning" },
      { label: "Utilidades", value: "utilities" },
      { label: "Outros", value: "other" },
    ],
    income: [
      { label: "Rações", value: "pet-food" },
      { label: "Medicamentos", value: "medicine" },
      { label: "Acessórios", value: "accessories" },
      { label: "Outros", value: "other" },
    ],
  },
  restaurant: {
    expense: [
      { label: "Ingredientes", value: "ingredients" },
      { label: "Embalagens", value: "packaging" },
      { label: "Logística", value: "logistics" },
      { label: "Utilidades", value: "utilities" },
      { label: "Outros", value: "other" },
    ],
    income: [
      { label: "Venda balcão", value: "counter-sale" },
      { label: "Delivery", value: "delivery" },
      { label: "Evento", value: "event" },
      { label: "Outros", value: "other" },
    ],
  },
};

const DEFAULT_CATEGORY: Record<
  BusinessId,
  Record<TransactionVariant, TransactionCategory>
> = {
  petshop: {
    expense: "stock",
    income: "pet-food",
  },
  restaurant: {
    expense: "ingredients",
    income: "counter-sale",
  },
};

export function getCategoryOptionsByVariant(
  businessId: BusinessId,
  variant: TransactionVariant,
) {
  return CATEGORY_OPTIONS[businessId][variant];
}

export function getDefaultCategory(
  businessId: BusinessId,
  variant: TransactionVariant,
) {
  return DEFAULT_CATEGORY[businessId][variant];
}

export function getCategoryLabel(
  businessId: BusinessId,
  variant: TransactionVariant,
  category: TransactionCategory,
) {
  const option = getCategoryOptionsByVariant(businessId, variant).find(
    (item) => item.value === category,
  );

  return option?.label ?? "Outros";
}
