"use client";

import { LINKS } from "@/lib/site";
import { useSettings } from "./Settings";
import { MasterspreadLogo } from "./MasterspreadLogo";

// The Accessories subsection has no looks of its own: every accessory is on
// Masterspread (masterspread.com), so the subsection points there instead.
export function AccessoriesLink() {
  const { t } = useSettings();
  return (
    <main className="grid grid-accessories">
      <a className="soon-list acc-link" href={LINKS.productos} target="_blank" rel="noopener" data-umami-event="abrir_masterspread_accesorios">
        <span className="soon-list-ic" aria-hidden="true">
          <MasterspreadLogo />
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
