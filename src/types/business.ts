export type BusinessId = "restaurant" | "petshop";

export type BusinessRecord = {
  createdAt: string;
  id: BusinessId;
  name: string;
  sortOrder: number;
  subtitle: string;
};
