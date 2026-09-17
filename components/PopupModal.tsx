"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { INVITE_CODE, LINKS } from "@/lib/site";

// Registration popup (Hipobuy account with the -25% shipping invite code).
//
// When it opens — once per visit, whichever comes first:
//  - 5 s on the page,
//  - the visitor scrolls past the hero (they're browsing outfits: intent),
//  - desktop only: the mouse heads for the tab bar to leave (exit intent).
// Never for someone who already clicked through to register. If another
// dialog (an outfit, the buy gate) is open at that moment it waits for it to
// close instead of giving up. Closing it keeps it quiet for the rest of the
// visit and leaves a small "-25%" pill in the corner, so the offer is still
// one tap away without interrupting again.

const DISMISS_KEY = "flayfind_pop_dismissed"; // sessionStorage: closed this visit
const SEEN_KEY = "flayfind_pop"; // sessionStorage: already shown this visit
const TIMER_MS = 5_000;

const dialogOpen = () => !!document.querySelector(".backdrop.show, .om");

const PHOTOS = [
  { src: "/img/rosa-street.jpg", alt: "Outfit rosa street" },
  { src: "/img/corteiz-azul.jpg", alt: "Outfit azul con zapatillas" },
  { src: "/img/total-black-baggy.jpg", alt: "Outfit total black baggy" },
];

const PERKS = [
  { t: "Fotos reales de tu pedido", s: "antes de que te lo envíen" },
  { t: "Devolución si algo falla", s: "sin quedarte tirado" },
  { t: "Envíos a España", s: "y a todo el mundo" },
];

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}
const track = (event: string, data?: Record<string, unknown>) => {
  try {
    window.umami?.track(event, data);
  } catch {}
};

type Props = {
  /** Already clicked through to register this visit (from Catalog). */
  registered: boolean;
  onRegister: () => void;
};

export function PopupModal({ registered, onRegister }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"offer" | "done">("offer");
  const [pill, setPill] = useState(false);
  const [copied, setCopied] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const registeredRef = useRef(registered);
  registeredRef.current = registered;

  const show = useCallback((reason: string) => {
    if (registeredRef.current) return;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    lastFocus.current = document.activeElement as HTMLElement | null;
    setStep("offer");
    setOpen(true);
    setPill(false);
    track("popup_mostrado", { motivo: reason });
  }, []);

  // triggers
  useEffect(() => {
    let dismissed = false;
    let seen = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (dismissed || seen) {
      if (dismissed && !registeredRef.current) setPill(true);
      return;
    }

    let fired = false;
    let scrollTimer = 0;
    let retryTimer = 0;
    const fire = (reason: string) => {
      if (fired) return;
      fired = true;
      removeTriggers();
      // don't stack on top of the buy gate or an open outfit: wait until it closes
      const attempt = () => {
        if (dialogOpen()) retryTimer = window.setTimeout(attempt, 800);
        else show(reason);
      };
      attempt();
    };

    const timer = window.setTimeout(() => fire("tiempo"), TIMER_MS);

    const hero = document.querySelector(".hero");
    const onScroll = () => {
      const bottom = hero ? hero.getBoundingClientRect().bottom : 400;
      if (bottom < 0 && !scrollTimer) scrollTimer = window.setTimeout(() => fire("scroll"), 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onLeave = (e: MouseEvent) => {
      if (desktop && !e.relatedTarget && e.clientY <= 0) fire("salida");
    };
    document.addEventListener("mouseout", onLeave);

    function removeTriggers() {
      clearTimeout(timer);
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    }
    return () => {
      removeTriggers();
      clearTimeout(retryTimer);
    };
  }, [show]);

  // registered elsewhere (buy gate): drop the reminder too
  useEffect(() => {
    if (registered) setPill(false);
  }, [registered]);

  // open: focus the CTA, Escape closes, page doesn't scroll behind
  useEffect(() => {
    if (!open) return;
    if (step === "offer") ctaRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step]);

  function close() {
    setOpen(false);
    lastFocus.current?.focus?.({ preventScroll: true });
  }

  function dismiss() {
    if (step === "offer") {
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {}
      track("popup_cerrado");
      if (!registeredRef.current) setPill(true);
    }
    close();
  }

  function register() {
    onRegister();
    setStep("done");
    setPill(false);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(INVITE_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <>
      <div
        className={`backdrop reg-backdrop${open ? " show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-title"
        aria-hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget) dismiss();
        }}
      >
        <div className="reg">
          <button className="reg-x" aria-label="Cerrar" onClick={dismiss} tabIndex={open ? 0 : -1}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>

          {step === "offer" ? (
            <>
              <div className="reg-hero">
                <div className="reg-photos" aria-hidden="true">
                  {PHOTOS.map((p, i) => (
                    <div key={p.src} className={`reg-photo reg-photo-${i}`}>
                      <Image src={p.src} alt="" fill sizes="80px" loading="eager" style={{ objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
                <div className="reg-offer">
                  <span className="reg-kicker">
                    <span className="reg-dot" /> Regalo de bienvenida
                  </span>
                  <p className="reg-num">
                    −25<span>%</span>
                  </p>
                  <p className="reg-num-sub">en tus envíos</p>
                </div>
              </div>

              <div className="reg-body">
                <h2 id="reg-title" className="reg-title">
                  Crea tu cuenta y pide tus outfits <em>más baratos</em>
                </h2>

                <ul className="reg-perks">
                  {PERKS.map((p) => (
                    <li key={p.t}>
                      <span className="reg-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="12" height="12">
                          <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>
                        <b>{p.t}</b> {p.s}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="reg-code">
                  <span>
                    Código <b>{INVITE_CODE}</b> · ya va incluido en el link
                  </span>
                  <button type="button" onClick={copyCode} tabIndex={open ? 0 : -1}>
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>

                <a
                  ref={ctaRef}
                  className="reg-go"
                  href={LINKS.hipobuy}
                  target="_blank"
                  rel="noopener"
                  data-umami-event="popup_registro_hipobuy"
                  onClick={register}
                  tabIndex={open ? 0 : -1}
                >
                  Activar mi −25% gratis
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <p className="reg-fine">Gratis · sin compromiso · menos de 1 minuto</p>

                <button type="button" className="reg-later" onClick={dismiss} tabIndex={open ? 0 : -1}>
                  Ahora no, solo estoy mirando
                </button>
              </div>
            </>
          ) : (
            <div className="reg-body reg-done">
              <span className="reg-done-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30">
                  <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 id="reg-title" className="reg-title">
                ¡Ya casi! Termina el registro en la pestaña nueva
              </h2>
              <ol className="reg-steps">
                <li>Crea la cuenta en Hipobuy (el código {INVITE_CODE} ya está puesto)</li>
                <li>Vuelve a esta pestaña</li>
                <li>Elige tu outfit y compra cada prenda con su link</li>
              </ol>
              <button type="button" className="reg-go" onClick={close} tabIndex={open ? 0 : -1}>
                Ver los outfits
              </button>
              <a className="reg-later" href={LINKS.hipobuy} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
                ¿No se abrió? Abrir Hipobuy otra vez
              </a>
            </div>
          )}
        </div>
      </div>

      {pill && !open && (
        <div className="reg-pill">
          <button type="button" className="reg-pill-open" onClick={() => show("recordatorio")}>
            <span className="reg-pill-num">−25%</span> en tus envíos
          </button>
          <button type="button" className="reg-pill-x" aria-label="Ocultar recordatorio" onClick={() => setPill(false)}>
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
