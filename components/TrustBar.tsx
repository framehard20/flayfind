"use client";

import { useSettings } from "./Settings";

// These are Uidbuy's services, not Flayfind's — Flayfind never ships or
// handles orders, it only sends people to register on Uidbuy. Only what
// uidbuy.com itself states (quality check, after-sales, one parcel, worldwide
// shipping); don't add promises it doesn't make. One mention in
// the heading covers attribution instead of repeating the name four times.
const ITEMS = [
  {
    key: "trust.photos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.3 15.3 5 5" />
        <path d="m7.8 10.6 1.9 1.9 3.4-3.6" />
      </svg>
    ),
  },
  {
    key: "trust.returns",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 4 6.5V11c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6.5L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "trust.support",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
        <path d="m4 7 8 4 8-4M12 11v10" />
      </svg>
    ),
  },
  {
    key: "trust.shipping",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.4 2.4 3.6 5.5 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.5-3.6-9S9.6 5.4 12 3Z" />
      </svg>
    ),
  },
];

export function TrustBar() {
  const { t } = useSettings();
  return (
    <div className="trustbar-wrap">
      <span className="trustbar-label">{t("trust.label")}</span>
      <ul className="trustbar">
        {ITEMS.map((item) => (
          <li key={item.key}>
            <span className="tb-ico">{item.icon}</span>
            <span>{t(item.key)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
