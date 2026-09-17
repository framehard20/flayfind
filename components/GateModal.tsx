"use client";

import { useEffect, useRef, useState } from "react";
import { lockScroll } from "@/lib/scrollLock";
import { INVITE_CODE, LINKS } from "@/lib/site";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Visitor clicked through to Hipobuy to register / log in. */
  onGoRegister: () => void;
  /** Go on to the product they wanted. */
  onContinue: () => void;
  /** false when the click was a generic "register" button, not a product. */
  toProduct: boolean;
};

// Shown the first time someone taps "Comprar" in a visit: make sure they're
// signed in to Hipobuy in this browser (with the -25% invite code) before the
// product opens. After they click through it doesn't close — it flips to
// "¿Listo?" with a button straight to the product they were after, so the
// purchase isn't lost on the way.
export function GateModal({ open, onClose, onGoRegister, onContinue, toProduct }: Props) {
  const [step, setStep] = useState<"gate" | "ready">("gate");
  const [tip, setTip] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const readyRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setStep("gate");
    setTip(false);
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => ctaRef.current?.focus({ preventScroll: true }));
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (step === "ready") readyRef.current?.focus({ preventScroll: true });
  }, [step]);

  const tab = open ? 0 : -1;

  return (
    <div
      className={`backdrop reg-backdrop gate${open ? " show" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="reg">
        <button className="reg-x" aria-label="Cerrar" onClick={onClose} tabIndex={tab}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        {step === "gate" ? (
          <>
            <div className="gate-head">
              <span className="gate-bag" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M9 8V6.5a3 3 0 016 0V8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="gate-bag-pct">%</span>
              </span>
              <div>
                <span className="reg-kicker">
                  <span className="reg-dot" /> Un paso antes de comprar
                </span>
                <h2 id="gate-title" className="gate-title">
                  Activa tu <em>−25%</em> en envíos
                </h2>
              </div>
            </div>

            <div className="reg-body">
              <ol className="gate-steps">
                <li>
                  <span className="gate-n">1</span>
                  <span>
                    <b>Entra con nuestro link</b>
                    <small>Se abre Hipobuy con el código {INVITE_CODE} ya puesto</small>
                  </span>
                </li>
                <li>
                  <span className="gate-n">2</span>
                  <span>
                    <b>Crea la cuenta o inicia sesión</b>
                    <small>Gratis y en menos de 1 minuto, tengas cuenta o no</small>
                  </span>
                </li>
                <li>
                  <span className="gate-n gate-n-ok">
                    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                      <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <b>Vuelve y compra la prenda</b>
                    <small>Con tu descuento aplicado en el envío</small>
                  </span>
                </li>
              </ol>

              <div className={`gate-tip${tip ? " open" : ""}`}>
                <button type="button" onClick={() => setTip((t) => !t)} aria-expanded={tip} tabIndex={tab}>
                  <span className="gate-tip-ico" aria-hidden="true">!</span>
                  ¿Te sale un aviso en rojo al abrir el producto?
                  <svg className="gate-tip-chev" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="gate-tip-body">
                  <p>
                    Es que no tienes la sesión abierta <b>en el navegador</b> (aunque la tengas en la app). Entra con el
                    link de arriba, inicia sesión y desaparece.
                  </p>
                </div>
              </div>

              <a
                ref={ctaRef}
                className="reg-go"
                href={LINKS.hipobuy}
                target="_blank"
                rel="noopener"
                data-umami-event="gate_registro"
                onClick={() => {
                  onGoRegister();
                  if (toProduct) setStep("ready");
                  else onClose();
                }}
                tabIndex={tab}
              >
                Conseguir mi −25% gratis
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <button type="button" className="gate-skip" onClick={onContinue} tabIndex={tab}>
                Ya tengo la sesión abierta · <b>{toProduct ? "ir a la prenda →" : "continuar →"}</b>
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
            <h2 id="gate-title" className="reg-title">
              ¿Ya tienes la sesión abierta?
            </h2>
            <p className="gate-ready-txt">
              Termina en la pestaña de Hipobuy y pulsa aquí para abrir la prenda que querías, ya con tu descuento.
            </p>
            <button ref={readyRef} type="button" className="reg-go" onClick={onContinue} tabIndex={tab}>
              Sí, ir a la prenda
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a className="reg-later" href={LINKS.hipobuy} target="_blank" rel="noopener" tabIndex={tab}>
              ¿No se abrió Hipobuy? Abrir otra vez
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
