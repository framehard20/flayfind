import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { pt } from "./pt";
import { zh } from "./zh";

// Every string on the public site, in the seven languages of the picker.
// Spanish is the source: lib/i18n/*.ts are generated from the table in
// gen-i18n.py, so add new strings there and re-run it.
//
// Values may contain **bold** and {placeholders}; <T> / tr() below turn them
// into React nodes. The admin panel stays in Spanish.

export type Dict = Record<string, string>;

export const LANGS = [
  { code: "es", label: "Español", flag: "🇪🇸", locale: "es-ES" },
  { code: "en", label: "English", flag: "🇬🇧", locale: "en-GB" },
  { code: "fr", label: "Français", flag: "🇫🇷", locale: "fr-FR" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", locale: "de-DE" },
  { code: "it", label: "Italiano", flag: "🇮🇹", locale: "it-IT" },
  { code: "pt", label: "Português", flag: "🇵🇹", locale: "pt-PT" },
  { code: "zh", label: "中文", flag: "🇨🇳", locale: "zh-CN" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

export const DICTS: Record<Lang, Dict> = { es, en, fr, de, it, pt, zh };

export const DEFAULT_LANG: Lang = "es";

export const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.code === v);

export const localeOf = (lang: Lang) => LANGS.find((l) => l.code === lang)?.locale ?? "es-ES";

/** Picks the best language for a browser's preferences. */
export function pickLang(preferred: readonly string[]): Lang {
  for (const p of preferred) {
    const base = p.toLowerCase().split("-")[0];
    const hit = LANGS.find((l) => l.code === base);
    if (hit) return hit.code;
  }
  return DEFAULT_LANG;
}

/** Fills {placeholders}; missing keys fall back to Spanish, then to the key. */
export function raw(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const text = DICTS[lang]?.[key] ?? DICTS[DEFAULT_LANG][key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}
