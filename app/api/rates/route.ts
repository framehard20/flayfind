import { FALLBACK_RATES, type Rates } from "@/lib/currency";

export const runtime = "nodejs";
// one fetch per hour for everyone; the ECB publishes once per working day
export const revalidate = 3600;

const PRIMARY = "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CNY";
const BACKUP = "https://open.er-api.com/v6/latest/EUR";

async function fromPrimary(): Promise<Rates | null> {
  const res = await fetch(PRIMARY, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as { date?: string; rates?: Record<string, number> };
  if (!data.rates?.USD) return null;
  return { base: "EUR", date: data.date ?? "", rates: { EUR: 1, ...data.rates } };
}

async function fromBackup(): Promise<Rates | null> {
  const res = await fetch(BACKUP, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as { rates?: Record<string, number>; time_last_update_utc?: string };
  if (!data.rates?.USD) return null;
  const { USD, GBP, CNY } = data.rates;
  return {
    base: "EUR",
    date: (data.time_last_update_utc ?? "").slice(5, 16),
    rates: { EUR: 1, USD, GBP, CNY },
  };
}

export async function GET() {
  for (const source of [fromPrimary, fromBackup]) {
    try {
      const rates = await source();
      if (rates) return Response.json(rates);
    } catch {}
  }
  // never fail the page over this: yesterday's numbers beat no prices
  return Response.json(FALLBACK_RATES, { status: 200 });
}
