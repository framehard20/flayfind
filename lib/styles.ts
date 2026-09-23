import type { Genero } from "./outfits";
import type { Lang } from "./i18n";

// Subsections shown inside Hombre and Mujer. The five that ship with the site
// have translations in lib/i18n (keys "f.gym", "f.puffer"…); the ones created
// in /admin/estilos carry their own translations typed there, and fall back to
// the Spanish name for any language left blank.

// Accessories comes first: it used to be a section of its own, and the chip
// row scrolls sideways on a phone, so it has to be reachable without swiping.
export const BUILTIN_STYLES = [
  { slug: "tech", key: "f.accessories", nombre: "Accesorios" },
  { slug: "streetwear", key: "f.street", nombre: "Streetwear" },
  { slug: "gym", key: "f.gym", nombre: "Gym" },
  { slug: "elegante", key: "f.elegant", nombre: "Elegante" },
  { slug: "plumiferos", key: "f.puffer", nombre: "Plumíferos" },
] as const;

/** Accessories: a subsection of both Hombre and Mujer, with no season and a
 *  plain price instead of a look total. */
export const ACCESSORIES = "tech";

/** A subsection created in the panel. `generos` says which sections offer it;
 *  `traducciones` holds its name per language (missing ones use `nombre`). */
export type ExtraStyle = {
  slug: string;
  nombre: string;
  generos: Genero[];
  traducciones: Partial<Record<Lang, string>>;
};

export type Style = {
  slug: string;
  nombre: string;
  /** Translation key — built-in styles only. */
  key?: string;
  traducciones?: Partial<Record<Lang, string>>;
};

const builtins = (): Style[] => BUILTIN_STYLES.map((s) => ({ slug: s.slug, nombre: s.nombre, key: s.key }));

const toStyle = (s: ExtraStyle): Style => ({ slug: s.slug, nombre: s.nombre, traducciones: s.traducciones });

/** Every subsection, whichever section it belongs to (admin lists). */
export function allStyles(extra: ExtraStyle[]): Style[] {
  return [...builtins(), ...extra.map(toStyle)];
}

/** Shows in this section? Built-ins always do; "ambos" matches either. */
export const inGenero = (s: ExtraStyle, genero: Genero) =>
  genero === "ambos" ? s.generos.length > 0 : s.generos.includes(genero) || s.generos.includes("ambos");

/** The subsections offered inside Hombre or Mujer, in filter order. */
export function subsections(genero: Genero, extra: ExtraStyle[]): Style[] {
  return [...builtins(), ...extra.filter((s) => inGenero(s, genero)).map(toStyle)];
}
