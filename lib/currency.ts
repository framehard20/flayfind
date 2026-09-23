// Prices are stored in euros (that's what Hipobuy charges). The picker only
// converts them for display, using the European Central Bank's daily rates
// through /api/rates.

export const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US dollar", symbol: "$" },
  { code: "GBP", label: "British pound", symbol: "£" },
  { code: "CNY", label: "人民币 / Yuan", symbol: "¥" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: Currency = "EUR";

export const isCurrency = (v: unknown): v is Currency => CURRENCIES.some((c) => c.code === v);

export type Rates = { base: "EUR"; date: string; rates: Record<string, number> };

/** Used until /api/rates answers, and if it can't be reached at all. */
export const FALLBACK_RATES: Rates = {
  base: "EUR",
  date: "2026-09-23",
  rates: { EUR: 1, USD: 1.1411, GBP: 0.8595, CNY: 7.6538 },
};

export function convert(amountEur: number, currency: Currency, rates: Rates): number {
  if (currency === "EUR") return amountEur;
  const rate = rates.rates[currency];
  return rate ? amountEur * rate : amountEur;
}

export function formatMoney(amountEur: number, currency: Currency, rates: Rates, locale: string): string {
  const value = convert(amountEur, currency, rates);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/** Same but rounded, for round marketing numbers like "under 50 €". */
export function formatMoneyRounded(amountEur: number, currency: Currency, rates: Rates, locale: string): string {
  const value = convert(amountEur, currency, rates);
  const step = value >= 100 ? 10 : 5;
  const rounded = Math.round(value / step) * step;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
  } catch {
    return `${rounded} ${currency}`;
  }
}
