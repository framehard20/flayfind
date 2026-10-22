"use client";

import { useSettings } from "./Settings";

export function Footer() {
  const { t, tr } = useSettings();
  return (
    <footer>
      <div className="code">{tr("footer.line")}</div>
      <p>{t("footer.sub")}</p>
      <p className="footer-links">
        <a href="/aviso-legal">{t("footer.legal")}</a>
        {" · "}
        <a href="/terminos">{t("footer.terms")}</a>
        {" · "}
        <a href="/privacidad">{t("footer.privacy")}</a>
      </p>
    </footer>
  );
}
