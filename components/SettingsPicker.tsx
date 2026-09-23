"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS, useSettings } from "./Settings";
import type { Currency } from "@/lib/currency";
import type { Lang } from "@/lib/i18n";

// The control in the header: current language + currency, opening a small
// panel with both lists.

export function SettingsPicker() {
  const { lang, currency, currencies, setLang, setCurrency, t } = useSettings();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="setpick" ref={wrapRef}>
      <button
        type="button"
        className="setpick-btn"
        aria-expanded={open}
        aria-label={t("set.open")}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="setpick-code">{current.code.toUpperCase()}</span>
        <span className="setpick-sep" aria-hidden="true">
          ·
        </span>
        <span className="setpick-code">{currency}</span>
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="setpick-panel" role="dialog" aria-label={t("set.open")}>
          <p className="setpick-title">{t("set.language")}</p>
          <ul className="setpick-list">
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  aria-pressed={l.code === lang}
                  onClick={() => setLang(l.code as Lang)}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="setpick-title">{t("set.currency")}</p>
          <ul className="setpick-list setpick-list-cur">
            {currencies.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  aria-pressed={c.code === currency}
                  onClick={() => setCurrency(c.code as Currency)}
                >
                  <span aria-hidden="true">{c.symbol}</span> {c.code}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
