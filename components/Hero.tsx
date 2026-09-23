"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Outfit3DViewer } from "./Outfit3DViewer";
import { useSettings } from "./Settings";

// The 3D garments sit around the title at fixed distances in em, but the
// title's three lines are very different lengths from one language to the
// next: Portuguese runs into the trousers, Chinese leaves the sneaker on top
// of the characters. So the hero measures its own lines after every language
// change (and on resize) and fits the composition to them:
//
//   --title-scale  shrinks the type when a line is too long to leave room
//   --sneak-l      how far along the last line the sneaker sits
//
// The defaults in globals.css are the Spanish layout, which is what these
// numbers reproduce when the text is Spanish.

const SNEAK_W = 2.9;
/** Where the sneaker sits along the last line, as a fraction of it: this is
 *  the Spanish layout (1.9em into a 7.13em line). */
const SNEAK_RATIO = 0.267;
/** Below this the sneaker would cover most of the line (short German or
 *  Chinese lines), so it moves to the end and only clips the last letter. */
const SHORT_LINE = 5.5;
const SNEAK_END_GAP = 0.5;

export function Hero() {
  const { t, tr, lang, moneyRound } = useSettings();
  const heroRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  const fit = useCallback(() => {
    const hero = heroRef.current;
    const h1 = h1Ref.current;
    if (!hero || !h1) return;

    // measure at scale 1, so the result doesn't depend on the previous fit
    hero.style.setProperty("--title-scale", "1");
    const fs = parseFloat(getComputedStyle(h1).fontSize);
    if (!fs) return;
    const lines = [...h1.querySelectorAll<HTMLElement>(".hl")].map((el) => el.getBoundingClientRect().width / fs);
    if (lines.length < 3) return;

    const container = h1.getBoundingClientRect().width / fs;
    const l3 = lines[2];
    const longest = Math.max(...lines);

    // the trousers and shirt sit behind the words, so the only thing that has
    // to fit is the text itself: shrink just enough that no line is cut off
    const scale = Math.min(1, (container - 0.2) / longest);
    const room = container / scale;

    const wanted = l3 >= SHORT_LINE ? l3 * SNEAK_RATIO : l3 - SNEAK_END_GAP;
    const sneaker = Math.min(Math.max(wanted, 1.4), room - SNEAK_W - 0.1);

    hero.style.setProperty("--title-scale", scale.toFixed(3));
    hero.style.setProperty("--sneak-l", `${sneaker.toFixed(2)}em`);
  }, [lang]); // lang isn't read directly, but a new language means new lines

  useLayoutEffect(() => {
    fit();
    // the display font arrives after first paint and changes every width
    document.fonts?.ready.then(fit).catch(() => {});
  }, [fit]);

  useEffect(() => {
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fit]);

  return (
    <section className="hero" ref={heroRef}>
      <h1 ref={h1Ref}>
        <span className="hero-title">
          <span className="hero-title-l1 hl">{t("hero.l1")}</span>
          <br />
          <span className="hl">{t("hero.l2")}</span>
          <br />
          <em className="hl">{t("hero.l3")}</em>
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
