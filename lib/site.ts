/* =====================================================================
   ⚙️  CONFIGURACIÓN — cambia SOLO este archivo
   =====================================================================
   Truco de trazabilidad: al final de cada enlace puedes añadir UTMs, p.ej.
   ...?utm_source=instagram&utm_medium=bio para saber de dónde vino el clic.
   ===================================================================== */

export const INVITE_CODE = "YILTEC";

export const LINKS = {
  hipobuy: `https://hipobuy.com/register?inviteCode=${INVITE_CODE}`,
  discord: "https://discord.gg/JAHXtxX6tb",
  instagramMain: "https://instagram.com/mariosanczz",
  instagramFits: "https://instagram.com/mariofits.czz",
} as const;

export const CONTACT_EMAIL = "flayfind@gmail.com";

// Umami (analítica gratis y sin cookies). Deja websiteId vacío para desactivarla.
// Si cambias de proveedor, actualiza también la CSP en next.config.ts.
export const UMAMI = {
  websiteId: "d55e4e01-2e22-4458-8f90-a3f0a14b4ec5",
  src: "https://cloud.umami.is/script.js",
};

// El formulario del concurso de seguidores necesita un endpoint que reciba el
// POST (el índice original usaba Netlify Forms, que no funciona en Vercel).
// Pon aquí la URL de acción de Formspree/Getform/tu propia API, o déjalo
// vacío para mostrar solo el email de contacto sin intentar enviar nada.
export const CONTEST_FORM_ENDPOINT = "";
