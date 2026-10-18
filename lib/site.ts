/* =====================================================================
   ⚙️  CONFIGURACIÓN — cambia SOLO este archivo
   =====================================================================
   Truco de trazabilidad: al final de cada enlace puedes añadir UTMs, p.ej.
   ...?utm_source=instagram&utm_medium=bio para saber de dónde vino el clic.
   ===================================================================== */

// 🛒 Agente de compras al que se manda a la gente: Uidbuy (antes Hipobuy).
// Hay dos formas de llevarse los 800 $ de descuento, y solo esas dos:
// registrarse con el link (ya lleva el código de referido) o registrarse y
// escribir CODIGO. El 40% en el envío es el cupón de bienvenida de Uidbuy.
export const AGENTE = "Uidbuy";
export const CODIGO = "800";
// código de referido que va dentro del link de registro
export const REFERIDO = "UWSV3X";

// Dirección pública de la web (la que usan Google y las vistas previas al compartir).
export const SITE_URL = "https://www.flayfind.com";

export const LINKS = {
  registro: `https://www.uidbuy.com/register?ref=${REFERIDO}`,
  discord: "https://discord.gg/BUrt9M2dyS",
  // la lista de productos (Google Sheets); solo se enseña si MOSTRAR_LISTA_PRODUCTOS es true
  productos:
    "https://docs.google.com/spreadsheets/d/17WHP0zYLfmwC9NZ9itCUNSPT9ymWnxT6qIXDKgO09Cs/edit?gid=1281688000#gid=1281688000",
} as const;

// 📋 Enlace a la lista de productos dentro de «Nuevos outfits en camino».
// Oculto desde el 18 de octubre de 2026 a petición de Mario; para volver a
// enseñarlo, pon true.
export const MOSTRAR_LISTA_PRODUCTOS = false;

// «Ocultar todos» se cambia desde /admin/outfits. Este valor solo se usa cuando
// la web no puede leer ese interruptor: antes de ejecutar supabase/schema.sql
// (que crea la tabla «ajustes») o si la base de datos no responde.
export const OUTFITS_OCULTOS_POR_DEFECTO = true;

// 🚀 Lanzamiento de los outfits nuevos, en hora de España. Hasta ese momento la
// web oculta todo (Outfits y De seguidores) y enseña una cuenta atrás. Desde
// ese momento vuelven solos: el «Ocultar todos» que estuviera encendido de
// antes deja de contar, y solo cuenta si lo vuelves a encender después.
// "+01:00" porque el 1 de noviembre España ya está en horario de invierno.
// Vacío ("") = sin lanzamiento: el interruptor del panel manda, como antes.
export const LANZAMIENTO = "2026-11-01T00:00:00+01:00";

const lanzamientoMs = LANZAMIENTO ? Date.parse(LANZAMIENTO) : NaN;

/** Milliseconds of the launch, or null when no launch is set. */
export const lanzamiento = (): number | null => (Number.isFinite(lanzamientoMs) ? lanzamientoMs : null);

/** True while a launch is set and hasn't arrived yet. */
export const antesDelLanzamiento = (ahora = Date.now()): boolean => {
  const l = lanzamiento();
  return l !== null && ahora < l;
};

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
