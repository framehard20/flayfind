export function eur(n: number): string {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

/** Same slugging rule as the original site, kept as-is so existing Umami event names keep matching. */
export function slug(nombre: string): string {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function totalDe(prendas: { precio: number }[]): number {
  return prendas.reduce((s, p) => s + (+p.precio || 0), 0);
}

export const CAT_LABEL: Record<string, string> = {
  gym: "Gym",
  elegante: "Elegante",
  streetwear: "Streetwear",
  tech: "Accesorios",
};
