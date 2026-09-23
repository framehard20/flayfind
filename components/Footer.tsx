"use client";

import { useSettings } from "./Settings";

export function Footer() {
  const { t, tr } = useSettings();
  return (
    <footer>
      <div className="code">{tr("footer.line")}</div>
      <p>{t("footer.sub")}</p>
    </footer>
  );
}
