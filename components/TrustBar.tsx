// These are Hipobuy's guarantees, not Flayfind's — Flayfind never ships or
// handles orders, it only sends people to register on Hipobuy. One mention in
// the heading covers attribution instead of repeating the name four times.
const ITEMS = [
  {
    label: "Fotos reales antes de enviar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
        <circle cx="12" cy="13.5" r="3.3" />
      </svg>
    ),
  },
  {
    label: "Devolución si algo falla",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 4 6.5V11c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6.5L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Asistencia 24/7",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13a8 8 0 0 1 16 0" />
        <rect x="3" y="13" width="4" height="6" rx="1.4" />
        <rect x="17" y="13" width="4" height="6" rx="1.4" />
      </svg>
    ),
  },
  {
    label: "Envíos a España y a todo el mundo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.4 2.4 3.6 5.5 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.5-3.6-9S9.6 5.4 12 3Z" />
      </svg>
    ),
  },
];

export function TrustBar() {
  return (
    <div className="trustbar-wrap">
      <span className="trustbar-label">Con tu cuenta en Hipobuy tienes</span>
      <ul className="trustbar">
        {ITEMS.map((item) => (
          <li key={item.label}>
            <span className="tb-ico">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
