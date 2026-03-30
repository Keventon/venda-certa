export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return amount.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function parseCurrencyInputToCents(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  return Number(digits);
}

export function formatCurrencyInputFromCents(valueInCents: number) {
  return formatCurrencyInput(String(Math.abs(valueInCents)));
}

export function formatCurrencyFromCents(valueInCents: number) {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    currency: "BRL",
    style: "currency",
  });
}

export function formatSignedCurrencyFromCents(valueInCents: number) {
  if (valueInCents === 0) {
    return formatCurrencyFromCents(0);
  }

  return `${valueInCents > 0 ? "+" : "-"}${formatCurrencyFromCents(
    Math.abs(valueInCents),
  )}`;
}
