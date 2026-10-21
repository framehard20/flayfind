import { FALLBACK_RATES } from "./currency";
import { REFERIDO } from "./site";

// The product list the batch matcher searches: Masterspread
// (masterspread.com), which reads Mario's product spreadsheet, hidden links and
// pictures included. Its public API gives every row as name, price (USD),
// platform + item id and a lasting picture address, so this file only fetches,
// de-duplicates and turns each item into a Uidbuy link with the referral code.

const MASTERSPREAD = "https://www.masterspread.com";
/** Masterspread's tabs change about once a month; an hour of cache is plenty. */
const REVALIDATE = 3600;
/** Tabs with nothing to wear. */
const SKIP_TABS = /electronic|room dec|cologne|perfume|lego/i;

/** Uidbuy's number for each marketplace (checked on uidbuy.com, as in Masterspread). */
const UIDBUY_NUM: Record<string, number> = { weidian: 3, "1688": 1, taobao: 2 };

export type Producto = {
  /** Position in the list sent to Claude; stable while the list is cached. */
  n: number;
  nombre: string;
  tab: string;
  usd: number | null;
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
  const first = await getJson<TabPage>(`${MASTERSPREAD}/api/tab?id=${sheetId}&gid=${gid}&page=0`);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, (first.pages || 1) - 1) }, (_, i) =>
      getJson<TabPage>(`${MASTERSPREAD}/api/tab?id=${sheetId}&gid=${gid}&page=${i + 1}`),
    ),
  );
  return [first, ...rest].flatMap((page) =>
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
  const { sheets } = await getJson<Sheet>(`${MASTERSPREAD}/api/sheet`);
  const rows = (
    await Promise.all(
      sheets.flatMap((s) => s.tabs.filter((t) => !SKIP_TABS.test(t.name)).map((t) => readTab(s.id, s.h, t.gid, t.name))),
    )
  ).flat();

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
      usd: it.p?.c === "USD" ? it.p.a : null,
      link,
      foto,
    });
  }
  memo = { at: Date.now(), list };
  return list;
}

/** Euros per US dollar today (the panel stores prices in euros). */
export async function eurPorUsd(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: REVALIDATE } });
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (data.rates?.USD) return 1 / data.rates.USD;
  } catch {}
  return 1 / FALLBACK_RATES.rates.USD;
}
