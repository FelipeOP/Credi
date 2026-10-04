export const currency = (value: number, decimals = 0) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
export const percent = (value: number, decimals = 2) =>
  `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value)} %`;
export const compactCurrency = (value: number) =>
  value >= 1e6
    ? `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value / 1e6)} M`
    : currency(value);
