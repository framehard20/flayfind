// Prices are stored in euros (that's what Hipobuy charges). The picker only
// converts them for display, with daily rates through /api/rates.

export const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US dollar", symbol: "$" },
  { code: "GBP", label: "British pound", symbol: "£" },
  { code: "MXN", label: "Peso mexicano", symbol: "$" },
  { code: "ARS", label: "Peso argentino", symbol: "$" },
  { code: "COP", label: "Peso colombiano", symbol: "$" },
  { code: "CLP", label: "Peso chileno", symbol: "$" },
  { code: "PEN", label: "Sol peruano", symbol: "S/" },
  { code: "BRL", label: "Real brasileño", symbol: "R$" },
  { code: "CNY", label: "人民币 / Yuan", symbol: "¥" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["code"];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as readonly string[];

export const DEFAULT_CURRENCY: Currency = "EUR";

export const isCurrency = (v: unknown): v is Currency => CURRENCIES.some((c) => c.code === v);

export type Rates = { base: "EUR"; date: string; rates: Record<string, number> };

/** Used until /api/rates answers, and if neither source can be reached. */
export const FALLBACK_RATES: Rates = {
  base: "EUR",
  date: "2026-09-23",
  rates: {
    EUR: 1,
    USD: 1.1452,
    GBP: 0.8579,
    MXN: 19.7894,
    ARS: 1733.42,
    COP: 3672.55,
    CLP: 1086.52,
    PEN: 3.8608,
    BRL: 5.8556,
    CNY: 7.683,
  },
};

export function convert(amountEur: number, currency: Currency, rates: Rates): number {
  if (currency === "EUR") return amountEur;
  const rate = rates.rates[currency];
  return rate ? amountEur * rate : amountEur;
}

/** The currencies the loaded rates can actually convert to. */
export const availableCurrencies = (rates: Rates) =>
  CURRENCIES.filter((c) => c.code === "EUR" || typeof rates.rates[c.code] === "number");

/** These would all render as a bare "$" and be mistaken for dollars, so they
 *  show their code (MXN, ARS…) instead. */
const AMBIGUOUS = ["MXN", "ARS", "COP", "CLP"];

function format(value: number, currency: Currency, locale: string, digits?: number): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: AMBIGUOUS.includes(currency) ? "symbol" : "narrowSymbol",
      // no digits given: each currency uses its own convention (Chilean pesos
      // have no cents, euros do)
      ...(digits == null ? {} : { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    }).format(value);
  } catch {
    return `${digits == null ? value.toFixed(2) : value.toFixed(digits)} ${currency}`;
  }
}

export function formatMoney(amountEur: number, currency: Currency, rates: Rates, locale: string): string {
  return format(convert(amountEur, currency, rates), currency, locale);
}

/** Rounded, for round marketing numbers like "under 50 €". */
export function formatMoneyRounded(amountEur: number, currency: Currency, rates: Rates, locale: string): string {
  const value = convert(amountEur, currency, rates);
  // round to something that still reads as a round number in any size
  const magnitude = Math.max(1, Math.pow(10, Math.floor(Math.log10(Math.max(value, 1))) - 1));
  const step = value >= 100 ? magnitude : 5;
  return format(Math.round(value / step) * step, currency, locale, 0);
}
