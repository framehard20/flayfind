"use client";

import { useState } from "react";
import { LINKS } from "@/lib/site";
import { useSettings } from "./Settings";

// Shown in the Outfits tab instead of the catalog while "Ocultar todos" is on
// in /admin/outfits: says new outfits are on the way, takes an email (only with
// the privacy checkbox ticked) to notify when they're back, and points to the
// product list so nobody leaves empty-handed. Emails land in /admin/avisos.

export function OutfitsSoon() {
  const { t, tn, lang } = useSettings();
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const body = new FormData(e.currentTarget);
    body.set("idioma", lang);
    try {
      const res = await fetch("/api/avisos", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string };
      if (res.ok) setStatus("ok");
      else {
        setStatus("idle");
        // the server answers with a code so the message can be translated here
        setError(data.code ? t(`err.${data.code}`) : (data.error ?? t("err.save")));
      }
    } catch {
      setStatus("idle");
      setError(t("err.network"));
    }
  }

  const privacy = (
    <a href="/privacidad" target="_blank" rel="noopener">
      {t("soon.privacy")}
    </a>
  );

  return (
    <section className="seg soon soon-outfits" aria-labelledby="soon-title">
      <span className="soon-badge">{t("soon.badge")}</span>
      <h3 className="soon-title" id="soon-title">
        {t("soon.title")}
      </h3>
      <p className="soon-lead">{t("soon.lead")}</p>

      {status === "ok" ? (
        <p className="seg-ok" role="status">
          {t("soon.ok")}
        </p>
      ) : (
        <form className="seg-form soon-form" onSubmit={onSubmit}>
          <div className="fld">
            <label htmlFor="aviso-email">{t("soon.email")}</label>
            <input
              id="aviso-email"
              name="email"
              type="email"
              required
              maxLength={120}
              autoComplete="email"
              inputMode="email"
              placeholder={t("soon.emailPh")}
            />
          </div>
          <label className="consent">
            <input type="checkbox" name="acepta" required />
            <span>{tn("soon.consent", { privacy })}</span>
          </label>

          {/* honeypot: hidden from people, filled in by bots */}
          <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />

          <button type="submit" className="seg-submit" disabled={status === "sending"} data-umami-event="aviso_outfits">
            {status === "sending" ? t("form.sending") : t("soon.send")}
          </button>
          {error && (
            <p className="seg-photo" role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      <a className="soon-list" href={LINKS.productos} target="_blank" rel="noopener" data-umami-event="lista_productos_preparacion">
        <span className="soon-list-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" fill="#159A57" />
            <rect x="7.3" y="7" width="9.4" height="9.6" rx="1" fill="#fff" />
            <path d="M7.3 10.2h9.4M7.3 13.4h9.4M12 7v9.6" stroke="#159A57" strokeWidth="1.1" />
          </svg>
        </span>
        <span className="soon-list-tx">
          <b>{t("soon.listTitle")}</b>
          <span>{t("soon.listText")}</span>
          <span className="soon-list-cta">{t("soon.listCta")}</span>
        </span>
      </a>
    </section>
  );
}
