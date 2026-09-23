"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  FALLBACK_RATES,
  formatMoney,
  formatMoneyRounded,
  isCurrency,
  type Currency,
  type Rates,
} from "@/lib/currency";
import { DEFAULT_LANG, isLang, LANGS, localeOf, pickLang, raw, type Lang } from "@/lib/i18n";
import { BUILTIN_STYLES } from "@/lib/styles";

// Language + currency for the whole public site. The choice lives in
// localStorage, so it survives reloads; the first visit follows the browser's
// language. Prices are stored in euros and converted for display only.

const LANG_KEY = "flayfind_lang";
const CUR_KEY = "flayfind_currency";
const RATES_KEY = "flayfind_rates";
const RATES_MAX_AGE = 6 * 3600_000;

type Ctx = {
  lang: Lang;
  currency: Currency;
  rates: Rates;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  /** Plain string with {placeholders} filled in. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Same, but **bold** becomes <b> — use inside JSX. */
  tr: (key: string, vars?: Record<string, string | number>) => React.ReactNode;
  /** For sentences with links or other elements inside: {name} → the node. */
  tn: (key: string, nodes: Record<string, React.ReactNode>) => React.ReactNode;
  /** Formats an amount in euros in the chosen currency. */
  money: (amountEur: number) => string;
  /** Rounded version for marketing numbers ("under 50 €"). */
  moneyRound: (amountEur: number) => string;
  /** Styles created in /admin/estilos, on top of the built-in ones. */
  estilos: { slug: string; nombre: string }[];
  /** Label for an outfit's style: translated if built in, as typed if custom. */
  styleLabel: (slug: string) => string;
};

const SettingsContext = createContext<Ctx | null>(null);

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings() necesita estar dentro de <SettingsProvider>");
  return ctx;
}

/** **bold** → <b>bold</b>, keeping the rest as plain text. */
function bold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

/** Splits on {placeholders} and drops the given nodes in their place. */
function withNodes(text: string, nodes: Record<string, React.ReactNode>): React.ReactNode {
  return text.split(/(\{\w+\})/g).map((part, i) => {
    const name = part.match(/^\{(\w+)\}$/)?.[1];
    if (name && name in nodes) return <span key={i}>{nodes[name]}</span>;
    return <span key={i}>{bold(part)}</span>;
  });
}

export function SettingsProvider({
  children,
  estilos = [],
}: {
  children: React.ReactNode;
  estilos?: { slug: string; nombre: string }[];
}) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);

  // restore the choice (or follow the browser) once mounted, so the server and
  // the first client render agree on Spanish and hydration stays quiet
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY);
      setLangState(isLang(savedLang) ? savedLang : pickLang(navigator.languages ?? [navigator.language]));
      const savedCur = localStorage.getItem(CUR_KEY);
      if (isCurrency(savedCur)) setCurrencyState(savedCur);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // rates: cached copy first, then a fresh one if it's older than 6 h
  useEffect(() => {
    let cached: (Rates & { fetchedAt?: number }) | null = null;
    try {
      cached = JSON.parse(localStorage.getItem(RATES_KEY) ?? "null");
    } catch {}
    if (cached?.rates?.USD) setRates(cached);
    if (cached?.fetchedAt && Date.now() - cached.fetchedAt < RATES_MAX_AGE) return;

    let cancelled = false;
    fetch("/api/rates")
      .then((r) => r.json())
      .then((data: Rates) => {
        if (cancelled || !data?.rates?.USD) return;
        setRates(data);
        try {
          localStorage.setItem(RATES_KEY, JSON.stringify({ ...data, fetchedAt: Date.now() }));
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CUR_KEY, c);
    } catch {}
  }, []);

  const value = useMemo<Ctx>(() => {
    const locale = localeOf(lang);
    return {
      lang,
      currency,
      rates,
      setLang,
      setCurrency,
      t: (key, vars) => raw(lang, key, vars),
      tr: (key, vars) => bold(raw(lang, key, vars)),
      tn: (key, nodes) => withNodes(raw(lang, key), nodes),
      money: (amountEur) => formatMoney(amountEur, currency, rates, locale),
      moneyRound: (amountEur) => formatMoneyRounded(amountEur, currency, rates, locale),
      estilos,
      styleLabel: (slug) => {
        const builtin = BUILTIN_STYLES.find((s) => s.slug === slug);
        if (builtin) return raw(lang, builtin.key);
        return estilos.find((s) => s.slug === slug)?.nombre ?? slug;
      },
    };
  }, [lang, currency, rates, setLang, setCurrency, estilos]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export { CURRENCIES, LANGS };
