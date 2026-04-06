import type { BusinessId, BusinessRecord } from "@/types/business";

export const DEFAULT_BUSINESS_ID: BusinessId = "restaurant";

export const DEFAULT_BUSINESSES: BusinessRecord[] = [
  {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "restaurant",
    name: "Restaurante",
    sortOrder: 0,
    subtitle: "Restaurante",
  },
  {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "petshop",
    name: "Veterinária",
    sortOrder: 1,
    subtitle: "Loja veterinária",
  },
];

export const BUSINESS_META: Record<
  BusinessId,
  {
    icon: "paw" | "silverware-fork-knife";
    shortLabel: string;
  }
> = {
  petshop: {
    icon: "paw",
    shortLabel: "Veterinária",
  },
  restaurant: {
    icon: "silverware-fork-knife",
    shortLabel: "Restaurante",
  },
};

export function getBusinessById(id: BusinessId) {
  return DEFAULT_BUSINESSES.find((business) => business.id === id);
}

export function getBusinessName(id: BusinessId) {
  return getBusinessById(id)?.name ?? "Negócio";
}
