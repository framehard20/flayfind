"use client";

import { INVITE_CODE, LINKS } from "@/lib/site";
import { useSettings } from "./Settings";
import { DiscordIcon } from "./DiscordIcon";

export function Reqs() {
  const { t, tr, tn } = useSettings();

  const cuentaA = (
    <a href={LINKS.instagramMain} target="_blank" rel="noopener">
      @mariosanczz
    </a>
  );
  const cuentaB = (
    <a href={LINKS.instagramFits} target="_blank" rel="noopener">
      @mariofits.czz
    </a>
  );

  return (
    <section className="seg reqs">
      <h3 className="reqs-title">{t("reqs.title")}</h3>
      <ol className="reqs-list">
        <li>
          <span className="rn">1</span>
          <div className="rc">
            <b>{t("reqs.1t")}</b>
            <span>{tn("reqs.1d", { a: cuentaA, b: cuentaB })}</span>
          </div>
        </li>
        <li>
          <span className="rn">2</span>
          <div className="rc">
            <b>{t("reqs.2t")}</b>
            <span>
              {tr("reqs.2d", { code: INVITE_CODE })}{" "}
              <a href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="registro_como_participar">
                {t("reqs.2cta", { code: INVITE_CODE })}
              </a>
            </span>
          </div>
        </li>
        <li>
          <span className="rn">3</span>
          <div className="rc">
            <b>{t("reqs.3t")}</b>
            <span>{t("reqs.3d")}</span>
          </div>
        </li>
      </ol>
      <p className="reqs-note">{t("reqs.note")}</p>

      <a className="discord-cta" href={LINKS.discord} target="_blank" rel="noopener">
        <span className="dc-ic" aria-hidden="true">
          <DiscordIcon />
        </span>
        <span className="dc-tx">
          <b>{t("discord.join")}</b>
          <span>{t("discord.joinSub")}</span>
        </span>
        <span className="dc-ar" aria-hidden="true">
          →
        </span>
      </a>
    </section>
  );
}
