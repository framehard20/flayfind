"use client";

import { useState } from "react";
import { INVITE_CODE, LINKS } from "@/lib/site";
import { useSettings } from "./Settings";

// Public form of the "De seguidores" section: the visitor says who they are,
// which outfit they'd like to see on the page, and confirms they registered on
// Hipobuy with the invite link. Submissions land in /admin/solicitudes.

export function SeguidoresForm() {
  const { t, tr } = useSettings();
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/submissions", { method: "POST", body: new FormData(e.currentTarget) });
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

  if (status === "ok") {
    return (
      <p className="seg-ok">{t("form.ok")}</p>
    );
  }

  return (
    <section className="seg seg-form-wrap">
      <form className="seg-form" onSubmit={onSubmit}>
        <p className="seg-step">{t("form.step1")}</p>
        <a className="seg-submit" href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="seg_form_registro">
          {t("form.register", { code: INVITE_CODE })}
        </a>
        <label className="consent">
          <input type="checkbox" name="registrado" required />
          <span>{t("form.registered")}</span>
        </label>
        <div className="fld">
          <label htmlFor="s-email">{t("form.email")}</label>
          <input
            id="s-email"
            name="email"
            type="email"
            required
            maxLength={120}
            placeholder={t("form.emailPh")}
          />
        </div>

        <p className="seg-step">{t("form.step2")}</p>
        <div className="fld">
          <label htmlFor="s-nombre">{t("form.name")}</label>
          <input id="s-nombre" name="nombre" type="text" required maxLength={80} placeholder={t("form.namePh")} />
        </div>
        <div className="fld">
          <label htmlFor="s-outfit">{t("form.outfit")}</label>
          <input id="s-outfit" name="outfit" type="text" required maxLength={80} placeholder={t("form.outfitPh")} />
        </div>
        <div className="fld">
          <label htmlFor="s-ig">{t("form.ig")}</label>
          <input id="s-ig" name="instagram" type="text" required maxLength={80} placeholder={t("form.igPh")} />
        </div>
        <div className="fld">
          <label htmlFor="s-idea">{t("form.what")}</label>
          <textarea
            id="s-idea"
            name="idea"
            required
            maxLength={1000}
            placeholder={t("form.whatPh")}
          />
        </div>

        <label className="consent">
          <input type="checkbox" name="novedades" />
          <span>{t("form.news")}</span>
        </label>

        {/* honeypot: hidden from people, filled in by bots */}
        <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />

        <button type="submit" className="seg-submit" disabled={status === "sending"}>
          {status === "sending" ? t("form.sending") : t("form.send")}
        </button>
        {error && <p className="seg-photo">{error}</p>}
        <p className="seg-photo">{tr("form.note")}</p>
      </form>
    </section>
  );
}
