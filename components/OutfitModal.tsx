"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Outfit } from "@/lib/outfits";
import { LINKS } from "@/lib/site";
import { lockScroll } from "@/lib/scrollLock";
import { rankClass, slug, totalDe } from "@/lib/utils";
import { useSettings } from "./Settings";

type Props = {
  list: Outfit[];
  index: number;
  /** Matches the cards' data-outfit so the zoom finds the right one. */
  scope?: string;
  /** Followers' view: medal, author and the gold / silver / bronze glow. */
  rank?: boolean;
  onIndex: (i: number) => void;
  onClose: () => void;
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

const EASE = "cubic-bezier(.2,.9,.25,1)";

/** The card photo this outfit came from, if it's on screen (zoom origin/target). */
function cardShot(o: Outfit, scope: string) {
  const el = document.querySelector<HTMLElement>(`[data-outfit="${scope}-${slug(o.nombre)}"] .look-shot`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const onScreen = r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  return onScreen ? r : null;
}

/** Transform that makes a box at `to` look like it sits at `from`. */
function invert(from: DOMRect, to: DOMRect) {
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

function useCountUp(value: number, key: string) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 750;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, key]);
  return n;
}

// Opens by zooming the card's photo up into place (FLIP via the Web
// Animations API) and closes by flying it back into the card. The photo
// tilts towards the pointer with a moving glare; pieces cascade in; the
// total counts up. ←/→ (or the arrow buttons) step through the filtered
// outfits, Escape closes.
export function OutfitModal({ list, index, scope = "of", rank = false, onIndex, onClose, onBuyClick }: Props) {
  const { t, money, styleLabel } = useSettings();
  const o = list[index];
  const total = totalDe(o.prendas);
  const shown = useCountUp(total, o.nombre);
  const ev = slug(o.nombre);
  const medal = rank ? rankClass(o.posicion) : "";

  const mediaRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [bigLoaded, setBigLoaded] = useState(false);

  // zoom in from the card
  useLayoutEffect(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    const media = mediaRef.current;
    const from = cardShot(o, scope);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (media && from && !reduce) {
      const to = media.getBoundingClientRect();
      media.animate(
        [
          { transform: invert(from, to), borderRadius: "14px" },
          { transform: "none", borderRadius: "22px" },
        ],
        { duration: 560, easing: EASE },
      );
    }
    requestAnimationFrame(() => setOpen(true));
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => setBigLoaded(false), [o.nombre]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    setOpen(false);
    const media = mediaRef.current;
    const to = cardShot(o, scope);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const done = () => {
      onClose();
      lastFocus.current?.focus?.({ preventScroll: true });
    };
    if (media && to && !reduce) {
      const from = media.getBoundingClientRect();
      const a = media.animate(
        [
          { transform: "none", borderRadius: "22px" },
          { transform: invert(to, from), borderRadius: "14px" },
        ],
        { duration: 440, easing: EASE, fill: "forwards" },
      );
      a.onfinish = done;
    } else {
      setTimeout(done, reduce ? 0 : 260);
    }
  }

  const go = (d: number) => onIndex((index + d + list.length) % list.length);

  // keys + scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // the buy gate can open on top of this; let it handle its own keys
      if (document.querySelector(".backdrop.show")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useEffect(() => lockScroll(), []);

  // pointer tilt + glare on the photo
  function onTilt(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  }
  function resetTilt() {
    const el = tiltRef.current;
    el?.style.setProperty("--ry", "0deg");
    el?.style.setProperty("--rx", "0deg");
  }

  // swipe left/right on the photo (touch)
  const swipe = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className={`om${open ? " open" : ""}${medal ? ` om-${medal}` : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={o.nombre}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {o.foto && (
        <div className="om-ambient" aria-hidden="true" key={`amb-${o.nombre}`}>
          <Image src={o.foto} alt="" fill sizes="(min-width: 720px) 290px, 50vw" style={{ objectFit: "cover" }} />
        </div>
      )}

      <div className="om-panel">
        <button ref={closeRef} type="button" className="om-x" onClick={close} aria-label={t("modal.close")}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <div
          className="om-stage"
          onPointerMove={onTilt}
          onPointerLeave={resetTilt}
          onTouchStart={(e) => (swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s || list.length < 2) return;
            const dx = e.changedTouches[0].clientX - s.x;
            const dy = e.changedTouches[0].clientY - s.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
          }}
        >
          <div ref={mediaRef} className="om-media">
            <div ref={tiltRef} className="om-tilt">
              {o.foto ? (
                <div className="om-photo" key={o.nombre}>
                  {/* the card-sized image is already cached: shows instantly, the sharp one fades in over it */}
                  <Image src={o.foto} alt="" fill sizes="(min-width: 720px) 290px, 50vw" style={{ objectFit: "cover" }} />
                  <Image
                    src={o.foto}
                    alt={o.nombre}
                    fill
                    priority
                    sizes="(min-width: 720px) 480px, 90vw"
                    className={`om-photo-hd${bigLoaded ? " in" : ""}`}
                    style={{ objectFit: "cover" }}
                    onLoad={() => setBigLoaded(true)}
                  />
                </div>
              ) : (
                <span className="placeholder">Sin foto todavía</span>
              )}
              <span className="om-glare" aria-hidden="true" />
              <span className="om-tag">{styleLabel(o.categoria)}</span>
              {rank && o.posicion ? <span className="om-medal">#{o.posicion}</span> : null}
            </div>
          </div>

          {list.length > 1 && (
            <>
              <button type="button" className="om-nav om-prev" onClick={() => go(-1)} aria-label={t("modal.prev")}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="om-nav om-next" onClick={() => go(1)} aria-label={t("modal.next")}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="om-info" key={o.nombre}>
          <span className="om-count">
            {rank && o.posicion ? t("modal.place", { n: o.posicion }) : `${index + 1} / ${list.length}`}
          </span>
          <h2 className="om-name">{o.nombre}</h2>
          {rank && o.instagram && (
            <a
              className="om-author"
              href={`https://instagram.com/${o.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener"
            >
              {t("modal.by")} <b>@{o.instagram.replace(/^@/, "")}</b>
            </a>
          )}
          <p className="om-lead">{t("modal.lead")}</p>

          <ul className="om-pieces">
            {o.prendas.map((p, i) => (
              <li key={i} style={{ "--i": i } as React.CSSProperties}>
                <span className="om-piece-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="om-piece-txt">
                  <span className="om-piece">{p.tipo}</span>
                  <span className="om-price">{money(+p.precio || 0)}</span>
                </span>
                <a
                  className="om-buy"
                  href={p.link}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => onBuyClick(e, p.link)}
                >
                  {t("modal.buy")}
                  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <div className="om-total" style={{ "--i": o.prendas.length } as React.CSSProperties}>
            <span className="om-total-lbl">{t(o.genero === "tech" ? "card.priceOnly" : "card.total")}</span>
            <span className="om-total-nums">
              {o.precioMarca > 0 && <s>{money(o.precioMarca)}</s>}
              <span className="om-total-num">{money(shown)}</span>
            </span>
          </div>

          <a
            className="om-cta"
            href={LINKS.hipobuy}
            target="_blank"
            rel="noopener"
            data-umami-event="registro_ficha_outfit"
            onClick={(e) => onBuyClick(e, LINKS.hipobuy)}
            style={{ "--i": o.prendas.length + 1 } as React.CSSProperties}
          >
            {t("modal.cta")}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="om-fine">{t("modal.fine")}</p>
        </div>
      </div>
    </div>
  );
}
