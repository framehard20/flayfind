import { FALLBACK_RATES } from "./currency";
import { REFERIDO } from "./site";

// The product list the batch matcher searches: Masterspread
// (masterspread.com), which reads Mario's product spreadsheet, hidden links and
// pictures included. Its public API gives every row as name, price (in the sheet's own currency),
// platform + item id and a lasting picture address, so this file only fetches,
// de-duplicates and turns each item into a Uidbuy link with the referral code.

const MASTERSPREAD = "https://www.masterspread.com";
/** Masterspread's tabs change about once a month; an hour of cache is plenty. */
const REVALIDATE = 3600;
/** Bump when Masterspread changes how it reads the sheets, so no cached answer from before is reused. */
const READER = "r2";
/** Tabs with nothing to wear. */
const SKIP_TABS = /electronic|room dec|cologne|perfume|lego/i;

/** Uidbuy's number for each marketplace (checked on uidbuy.com, as in Masterspread). */
const UIDBUY_NUM: Record<string, number> = { weidian: 3, "1688": 1, taobao: 2 };

export type Producto = {
  /** Position in the list sent to Claude; stable while the list is cached. */
  n: number;
  nombre: string;
  tab: string;
  /** Price in euros (the sheets use dollars, euros or yuan; converted at today's rate). */
  eur: number | null;
  link: string;
  foto: string;
};

type Item = {
  name: string;
  p: { a: number; c: string } | null;
  ik: string;
  platform: string;
  id: string;
};
type Sheet = { sheets: { id: string; h: string; tabs: { gid: string; name: string }[] }[] };
type TabPage = { pages: number; items: Item[] };

const getJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`Masterspread no responde (${res.status})`);
  return (await res.json()) as T;
};

export const uidbuyLink = (platform: string, id: string) =>
  UIDBUY_NUM[platform] != null ? `https://www.uidbuy.com/product/${UIDBUY_NUM[platform]}/${id}?ref=${REFERIDO}` : "";

async function readTab(sheetId: string, sig: string, gid: string, tab: string) {
  // one tab that can't be read is left out; it never stops the whole list
  let pages: TabPage[];
  try {
    const first = await getJson<TabPage>(`${MASTERSPREAD}/api/tab?id=${sheetId}&gid=${gid}&page=0&r=${READER}`);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, (first.pages || 1) - 1) }, (_, i) =>
        getJson<TabPage>(`${MASTERSPREAD}/api/tab?id=${sheetId}&gid=${gid}&page=${i + 1}&r=${READER}`),
      ),
    );
    pages = [first, ...rest];
  } catch (error) {
    console.warn(`Masterspread: se salta la pestaña «${tab}»`, error);
    return [];
  }
  return pages.flatMap((page) =>
    (page.items ?? []).map((it) => ({
      it,
      tab,
      foto: it.ik ? `${MASTERSPREAD}/api/img?s=${sheetId}&g=${gid}&k=${encodeURIComponent(it.ik)}&w=400&h=${sig}` : "",
    })),
  );
}

let memo: { at: number; list: Producto[] } | null = null;

/** Every product on Masterspread once (the same item appears in several tabs). */
export async function getCatalogo(): Promise<Producto[]> {
  if (memo && Date.now() - memo.at < REVALIDATE * 1000) return memo.list;
  const { sheets } = await getJson<Sheet>(`${MASTERSPREAD}/api/sheet?r=${READER}`);
  const rows = (
    await Promise.all(
      sheets.flatMap((s) => s.tabs.filter((t) => !SKIP_TABS.test(t.name)).map((t) => readTab(s.id, s.h, t.gid, t.name))),
    )
  ).flat();

  const rates = await tasasEur();
  const seen = new Set<string>();
  const list: Producto[] = [];
  for (const { it, tab, foto } of rows) {
    const link = uidbuyLink(it.platform, it.id);
    if (!link || seen.has(it.platform + it.id)) continue;
    seen.add(it.platform + it.id);
    list.push({
      n: list.length + 1,
      nombre: it.name.replace(/\s+/g, " ").trim(),
      tab,
      eur: it.p ? aEuros(it.p.a, it.p.c, rates) : null,
      link,
      foto,
    });
  }
  memo = { at: Date.now(), list };
  return list;
}

/** Units of each currency per euro, today (the panel stores prices in euros). */
async function tasasEur(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: REVALIDATE } });
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (data.rates?.USD) return data.rates;
  } catch {}
  return FALLBACK_RATES.rates;
}

const aEuros = (amount: number, currency: string, rates: Record<string, number>): number | null => {
  if (currency === "EUR") return Math.round(amount * 100) / 100;
  const rate = rates[currency];
  return rate ? Math.round((amount / rate) * 100) / 100 : null;
};
