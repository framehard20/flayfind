"use client";

import { useSettings } from "./Settings";

export function SegIntro() {
  const { t, tr } = useSettings();
  return (
    <div className="seg seg-intro">
      <h2>
        {t("seg.title1")}
        <br />
        {t("seg.title2")}
      </h2>
      <p className="lead">{tr("seg.lead")}</p>
      <div className="cue">
        <span className="dot" /> {t("seg.cue")}
      </div>
    </div>
  );
}
