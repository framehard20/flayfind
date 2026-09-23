"use client";

import { Outfit3DViewer } from "./Outfit3DViewer";
import { useSettings } from "./Settings";

export function Hero() {
  const { t, tr, moneyRound } = useSettings();
  return (
    <section className="hero">
      <h1>
        <span className="hero-title">
          <span className="hero-title-l1">{t("hero.l1")}</span>
          <br />
          {t("hero.l2")}
          <br />
          <em>{t("hero.l3")}</em>
          <Outfit3DViewer />
        </span>
      </h1>
      <p className="pitch">{tr("hero.pitch", { marca: moneyRound(300), precio: moneyRound(50) })}</p>
      <p className="sub">{t("hero.sub")}</p>
      <div className="cue">
        <span className="dot" /> {t("hero.cue")}
      </div>
      <p className="hero-season">{t("hero.season")}</p>
    </section>
  );
}
