"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPassword("");
        setCode("");
        router.refresh();
      } else {
        setError(data.error ?? "No se pudo entrar.");
      }
    } catch {
      setError("Sin conexión con el servidor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ad-login">
      <h1>Panel</h1>
      <p className="ad-lead">Entra con tu contraseña y el código de 6 cifras de tu app de autenticación.</p>

      {!configured && (
        <div className="ad-msg ad-msg-err">
          El panel todavía no tiene las claves configuradas. Sigue los pasos de ADMIN.md y añade las variables en Vercel.
        </div>
      )}

      <form className="ad-card" onSubmit={onSubmit}>
        <label className="ad-field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label className="ad-field">
          <span>Código de 6 cifras</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />
        </label>
        <button className="ad-btn" type="submit" disabled={busy || !configured}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
        {error && <p className="ad-msg ad-msg-err">{error}</p>}
      </form>
    </div>
  );
}
