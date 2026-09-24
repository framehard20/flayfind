"use client";

import { LINKS } from "@/lib/site";
import { useSettings } from "./Settings";
import { DiscordIcon } from "./DiscordIcon";

/** Real feature: Mario's own Discord has a channel where a bot finds the best-quality
 *  match for a photo you send, plus Discord-only discounts and his own personal help.
 *  `join` swaps the words for the plain invitation used in the followers' tab. */
export function DiscordPerks({ join = false }: { join?: boolean } = {}) {
  const { t } = useSettings();
  return (
    <div className="discord-standalone">
      <a className="discord-cta" href={LINKS.discord} target="_blank" rel="noopener">
        <span className="dc-ic" aria-hidden="true">
          <DiscordIcon />
        </span>
        <span className="dc-tx">
          <b>{t(join ? "discord.join" : "discord.t")}</b>
          <span>{t(join ? "discord.joinSub" : "discord.s")}</span>
        </span>
        <span className="dc-ar" aria-hidden="true">
          →
        </span>
      </a>
    </div>
  );
}
