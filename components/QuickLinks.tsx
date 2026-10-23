"use client";

import { LINKS } from "@/lib/site";
import { useSettings } from "./Settings";
import { DiscordIcon } from "./DiscordIcon";
import { MasterspreadLogo } from "./MasterspreadLogo";
import { TelegramIcon } from "./TelegramIcon";

/** A slim row between the filters and the looks: Masterspread (the one that
 *  stands out), then Discord and Telegram, each with a few words on what it is.
 *  The bigger cards stay at the end of the catalogue. */
export function QuickLinks() {
  const { t } = useSettings();
  return (
    <nav className="quick-links" aria-label={t("quick.label")}>
      <a className="ql ql-ms" href={LINKS.productos} target="_blank" rel="noopener" data-umami-event="abrir_masterspread_filtros">
        <span className="ql-ic" aria-hidden="true">
          <MasterspreadLogo size={24} />
        </span>
        <span className="ql-tx">
          <b>masterspread.com</b>
          <span>{t("quick.ms")}</span>
        </span>
        <span className="ql-go" aria-hidden="true">↗</span>
      </a>
      <a className="ql ql-dc" href={LINKS.discord} target="_blank" rel="noopener">
        <span className="ql-ic" aria-hidden="true">
          <DiscordIcon />
        </span>
        <span className="ql-tx">
          <b>Discord</b>
          <span>{t("quick.dc")}</span>
        </span>
      </a>
      <a className="ql ql-tg" href={LINKS.telegram} target="_blank" rel="noopener">
        <span className="ql-ic" aria-hidden="true">
          <TelegramIcon />
        </span>
        <span className="ql-tx">
          <b>Telegram</b>
          <span>{t("quick.tg")}</span>
        </span>
      </a>
    </nav>
  );
}
