"use client";

import { LINKS } from "@/lib/site";
import { useSettings } from "./Settings";

// The Accessories subsection has no looks of its own: every accessory is on
// Masterspread (masterspread.com), so the subsection points there instead.
export function AccessoriesLink() {
  const { t } = useSettings();
  return (
    <main className="grid grid-accessories">
      <a className="soon-list acc-link" href={LINKS.productos} target="_blank" rel="noopener" data-umami-event="abrir_masterspread_accesorios">
        {/* Masterspread's logo: a blue shopping bag */}
        <span className="soon-list-ic" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="22" height="22">
            <rect width="64" height="64" rx="16" fill="#2f66f0" />
            <path d="M18 24h28l-3 22a4 4 0 0 1-4 3.5H25a4 4 0 0 1-4-3.5z" fill="#fff" />
            <path d="M25 26v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 34h16M24 40h16M32 30v14" stroke="#2f66f0" strokeWidth="2.5" />
          </svg>
        </span>
        <span className="soon-list-tx">
          <b>{t("acc.title")}</b>
          <span>{t("acc.text")}</span>
          <span className="soon-list-cta">{t("acc.cta")}</span>
        </span>
      </a>
    </main>
  );
}
