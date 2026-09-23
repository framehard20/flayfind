// The four styles that ship with the site. They have translations in
// lib/i18n (keys "f.gym", "f.elegant"…); styles created from the panel don't,
// so those show with the name typed there, in every language.

export const BUILTIN_STYLES = [
  { slug: "streetwear", key: "f.street", nombre: "Streetwear" },
  { slug: "gym", key: "f.gym", nombre: "Gym" },
  { slug: "elegante", key: "f.elegant", nombre: "Elegante" },
  { slug: "tech", key: "f.accessories", nombre: "Accesorios" },
] as const;

export type Style = { slug: string; nombre: string; key?: string };

/** Built-in styles first, then the ones created in the panel. */
export function allStyles(extra: { slug: string; nombre: string }[]): Style[] {
  return [...BUILTIN_STYLES.map((s) => ({ slug: s.slug, nombre: s.nombre, key: s.key })), ...extra];
}

/** Styles offered in the filter: "tech" is its own section, not a style. */
export const filterStyles = (extra: { slug: string; nombre: string }[]): Style[] =>
  allStyles(extra).filter((s) => s.slug !== "tech");
