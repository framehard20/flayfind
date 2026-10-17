"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lanzamiento } from "@/lib/site";
import { localeOf } from "@/lib/i18n";
import { useSettings } from "./Settings";

// Countdown to LANZAMIENTO (lib/site.ts). The date is real, so this is the
// honest kind of urgency: nothing resets, and when it reaches zero the outfits
// actually appear. At zero it asks the server for the page again every few
// seconds until the server stops hiding them — the page regenerates at most a
// minute after the launch, so this covers the gap.

const POLL_MS = 5000;
const POLL_MAX = 40; // ~3 minutes, then it asks the visitor to reload

type Left = { d: number; h: number; m: number; s: number };

function split(ms: number): Left {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

const two = (n: number) => String(n).padStart(2, "0");

export function LaunchCountdown({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useSettings();
  const router = useRouter();
  const target = lanzamiento();
  // null until mounted: the server and the first client render must agree
  const [left, setLeft] = useState<number | null>(null);
  const polls = useRef(0);

  useEffect(() => {
    if (target === null) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const ms = target - Date.now();
      setLeft(ms);
      if (ms > 0) {
        // align to the wall-clock second so the digits never skip
        timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 15);
      } else if (polls.current < POLL_MAX) {
        polls.current += 1;
        router.refresh();
        timer = setTimeout(tick, POLL_MS);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, [target, router]);

  if (target === null) return null;

  const fecha = new Intl.DateTimeFormat(localeOf(lang), {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Madrid",
  }).format(new Date(target));

  // 24-hour clock in Spain, so 1 November at midnight reads "00:00" everywhere
  const hora = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Madrid",
  }).format(new Date(target));

  if (compact) {
    return <p className="cd-compact">{t("launch.seg", { date: fecha })}</p>;
  }

  if (left !== null && left <= 0) {
    return (
      <div className="cd cd-done" role="status">
        <b>{polls.current >= POLL_MAX ? t("launch.reload") : t("launch.now")}</b>
      </div>
    );
  }

  const v = left === null ? null : split(left);
  const cells: [string, string][] = [
    [v ? String(v.d) : "–", t("launch.d")],
    [v ? two(v.h) : "––", t("launch.h")],
    [v ? two(v.m) : "––", t("launch.m")],
    [v ? two(v.s) : "––", t("launch.s")],
  ];

  return (
    <div className="cd" role="timer" aria-live="off">
      <div className="cd-cells">
        {cells.map(([n, label]) => (
          <div className="cd-cell" key={label}>
            <span className="cd-n">{n}</span>
            <span className="cd-l">{label}</span>
          </div>
        ))}
      </div>
      <p className="cd-when">{t("launch.when", { date: fecha, time: hora })}</p>
    </div>
  );
}
