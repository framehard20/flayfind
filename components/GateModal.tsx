"use client";

import { LINKS } from "@/lib/site";

type Props = {
  open: boolean;
  onClose: () => void;
  onGoRegister: () => void;
  onContinue: () => void;
};

export function GateModal({ open, onClose, onGoRegister, onContinue }: Props) {
  return (
    <div
      className={`backdrop${open ? " show" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Crea tu cuenta antes de comprar"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <button className="x" aria-label="Cerrar" onClick={onClose}>
          &times;
        </button>
        <span className="kicker">
          <span className="dot" /> Tengas cuenta o no · gratis
        </span>
        <h3 className="gate-title">
          Llévate un <em>25%</em> en tus envíos
        </h3>
        <div className="steps">
          <div className="step">
            <span className="step-n">1</span>
            <span className="step-t">
              Entra con
              <br />
              el link
            </span>
          </div>
          <span className="step-arrow">→</span>
          <div className="step">
            <span className="step-n step-pct">%</span>
            <span className="step-t">
              25% en tus
              <br />
              envíos gratis
            </span>
          </div>
          <span className="step-arrow">→</span>
          <div className="step">
            <span className="step-n step-ok">3</span>
            <span className="step-t">
              Ya ves y
              <br />
              compras todo
            </span>
          </div>
        </div>
        <p className="warn">
          ¿Te sale un aviso en <b>rojo</b> al abrir un producto? Es que no tienes la sesión abierta en el navegador
          (aunque la tengas en la app). Entra con el link y desaparece.
        </p>
        <a className="go" href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="gate_registro" onClick={onGoRegister}>
          Conseguir mi 25% gratis →
        </a>
        <p className="mini">
          Ya lo hice ·{" "}
          <b>
            <a
              href="#"
              style={{ color: "inherit" }}
              onClick={(e) => {
                e.preventDefault();
                onContinue();
              }}
            >
              continuar →
            </a>
          </b>
        </p>
      </div>
    </div>
  );
}
