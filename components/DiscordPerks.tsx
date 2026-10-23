"use client";

import { LINKS } from "@/lib/site";
import { useSettings } from "./Settings";
import { DiscordIcon } from "./DiscordIcon";
import { MasterspreadLogo } from "./MasterspreadLogo";

/** The Discord community card. With `shop`, Masterspread (every product, for
 *  anything that isn't in a look) goes first, above it. `join` swaps the
 *  Discord words for the plain invitation used in the followers' tab. */
export function DiscordPerks({ join = false, shop = false }: { join?: boolean; shop?: boolean } = {}) {
  const { t } = useSettings();
  return (
    <div className={`discord-standalone more-links${join ? " discord-standalone-join" : ""}`}>
      {shop && (
        <a className="link-card link-card-shop" href={LINKS.productos} target="_blank" rel="noopener" data-umami-event="abrir_masterspread_filtros">
          <span className="lc-ic" aria-hidden="true">
            <MasterspreadLogo size={26} />
          </span>
          <span className="lc-tx">
            <b>{t("shop.t")}</b>
            <span>{t("shop.s")}</span>
          </span>
          <span className="lc-btn">{t("shop.cta")} ↗</span>
        </a>
      )}
      <a className="link-card link-card-discord" href={LINKS.discord} target="_blank" rel="noopener">
        <span className="lc-ic" aria-hidden="true">
          <DiscordIcon />
        </span>
        <span className="lc-tx">
          <b>{t(join ? "discord.join" : "discord.t")}</b>
          <span>{t(join ? "discord.joinSub" : "discord.s")}</span>
        </span>
        <span className="lc-btn">{t("discord.cta")}</span>
      </a>
    </div>
  );
}
