const moneyFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

export function displayMoney(value: number): string {
  return Number.isFinite(value) ? moneyFormatter.format(value) : "";
}

export function normalizeMoneyInput(raw: string): string {
  const negative = raw.trim().startsWith("-");
  const clean = raw.replace(/[^\d,]/g, "");
  const comma = clean.indexOf(",");
  const integer = (comma < 0 ? clean : clean.slice(0, comma)).replace(
    /^0+(?=\d)/,
    "",
  );
  const fraction =
    comma < 0
      ? ""
      : clean
          .slice(comma + 1)
          .replace(/,/g, "")
          .slice(0, 2);
  if (!integer && comma < 0) return negative ? "-" : "";
  const grouped = (integer || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${grouped}${comma < 0 ? "" : `,${fraction}`}`;
}

export function parseMoneyInput(display: string): number {
  if (!display || display === "-") return NaN;
  return Number(display.replace(/\./g, "").replace(",", "."));
}

export function moneyCaretPosition(
  display: string,
  significantCharacters: number,
): number {
  if (significantCharacters === 0) return 0;
  let count = 0;
  for (let index = 0; index < display.length; index += 1) {
    if (/[\d,-]/.test(display[index])) count += 1;
    if (count === significantCharacters) return index + 1;
  }
  return display.length;
}
