"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/outfits", label: "Outfits" },
  { href: "/admin/seguidores", label: "De seguidores" },
  { href: "/admin/estilos", label: "Estilos" },
  { href: "/admin/solicitudes", label: "Solicitudes" },
];

export function Nav({ nuevas = 0 }: { nuevas?: number }) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <>
      <div className="ad-top">
        <div className="ad-brand">
          Flay<span>find</span> <span className="ad-badge">panel</span>
        </div>
        <div className="ad-row">
          <a className="ad-btn ad-btn-ghost ad-btn-sm" href="/" target="_blank" rel="noopener">
            Ver la web ↗
          </a>
          <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={logout}>
            Salir
          </button>
        </div>
      </div>
      <nav className="ad-nav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
            {l.label}
            {l.href === "/admin/solicitudes" && nuevas > 0 ? ` (${nuevas})` : ""}
          </Link>
        ))}
      </nav>
    </>
  );
}
