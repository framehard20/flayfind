"use client";

import { LINKS } from "@/lib/site";
import { useSettings } from "./Settings";

export function RepeatCta() {
  const { t } = useSettings();
  return (
    <div className="repeat-cta-wrap">
      <a className="repeat-cta" href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="registro_boton_final">
        <span className="repeat-cta-txt">
          <span className="t">{t("repeat.t")}</span>
          <span className="s">{t("repeat.s")}</span>
        </span>
        <span className="repeat-cta-arrow" aria-hidden="true">
          →
        </span>
      </a>
    </div>
  );
}
