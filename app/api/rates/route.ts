import { CURRENCY_CODES, FALLBACK_RATES, type Rates } from "@/lib/currency";

export const runtime = "nodejs";
// one fetch per hour for everyone; both sources publish about once a day
export const revalidate = 3600;

// open.er-api covers the Latin American currencies (ARS, COP, CLP, PEN) that
// the ECB doesn't publish, so it goes first. The ECB feed is the backup for
// the majors; if it's the one answering, the currencies it doesn't carry
// simply don't appear in the picker.
const PRIMARY = "https://open.er-api.com/v6/latest/EUR";
const BACKUP = `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${CURRENCY_CODES.filter((c) => c !== "EUR").join(",")}`;

const pick = (all: Record<string, number>): Record<string, number> => {
  const out: Record<string, number> = { EUR: 1 };
  for (const code of CURRENCY_CODES) {
    if (typeof all[code] === "number") out[code] = all[code];
  }
  return out;
};

async function fromPrimary(): Promise<Rates | null> {
  const res = await fetch(PRIMARY, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as { rates?: Record<string, number>; time_last_update_utc?: string };
  if (!data.rates?.USD) return null;
  return { base: "EUR", date: (data.time_last_update_utc ?? "").slice(5, 16), rates: pick(data.rates) };
}

async function fromBackup(): Promise<Rates | null> {
  const res = await fetch(BACKUP, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as { date?: string; rates?: Record<string, number> };
  if (!data.rates?.USD) return null;
  return { base: "EUR", date: data.date ?? "", rates: pick(data.rates) };
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
