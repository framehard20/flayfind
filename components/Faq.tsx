"use client";

import { useSettings } from "./Settings";
import { INVITE_CODE } from "@/lib/site";

const ITEMS = [1, 2, 3, 4, 5, 6];

export function Faq() {
  const { t, tr } = useSettings();
  return (
    <section className="faq">
      <h2>{t("faq.title")}</h2>
      {ITEMS.map((n) => (
        <details key={n}>
          <summary>{t(`faq.q${n}`)}</summary>
          <div className="ans">{tr(`faq.a${n}`, { code: INVITE_CODE })}</div>
        </details>
      ))}
    </section>
  );
}
