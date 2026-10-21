import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { eurPorUsd, getCatalogo, type Producto } from "./catalogo";

// Batch matcher for /admin/outfits/lote: given an outfit photo, find each
// garment on Masterspread's product list. Two calls to Claude:
//
//   1. look at the photo next to the whole list (names only) and shortlist up
//      to six candidates per garment;
//   2. look at the photo next to those candidates' pictures and keep the one
//      that is the same garment (same model; the colour may differ, the link
//      shows every colour), or none.
//
// Anything not found comes back without a link so the panel flags it.

const MODEL = "claude-opus-5-5";
const MAX_CANDIDATOS = 6;

export const apiKeyConfigured = () => !!process.env.ANTHROPIC_API_KEY;

export type Opcion = { n: number; nombre: string; link: string; foto: string; eur: number | null };
export type PrendaEmparejada = {
  tipo: string;
  descripcion: string;
  elegido: Opcion | null;
  confianza: "alta" | "media" | "baja" | null;
  motivo: string;
  alternativas: Opcion[];
};
export type Emparejado = {
  nombre: string;
  genero: "hombre" | "mujer" | "ambos";
  temporada: "invierno" | "verano";
  estilo: string;
  prendas: PrendaEmparejada[];
};

const Paso1 = z.object({
  nombre: z.string(),
  genero: z.enum(["hombre", "mujer", "ambos"]),
  temporada: z.enum(["invierno", "verano"]),
  estilo: z.string(),
  prendas: z.array(
    z.object({
      tipo: z.string(),
      descripcion: z.string(),
      candidatos: z.array(z.number().int()),
    }),
  ),
});

const Paso2 = z.object({
  elecciones: z.array(
    z.object({
      prenda: z.number().int(),
      candidato: z.number().int().nullable(),
      confianza: z.enum(["alta", "media", "baja"]),
      motivo: z.string(),
    }),
  ),
});

const PASO1_SYSTEM = `You help the owner of Flayfind, a Spanish outfit site, add purchase links to outfit photos. Every garment must come from the product list below (one product per line: number|tab|name|price in USD).

For the photo you receive:
- List each garment or accessory a visitor would want to buy, from top to bottom: tops and outerwear, bottoms, shoes, then visible accessories (cap, bag, belt, watch...). One entry per distinct item; two shoes of a pair are one item.
- "tipo" is a short Spanish label for the item as a shopper would say it, e.g. "Sudadera con capucha", "Jogger cargo", "Sneakers negras".
- "descripcion" is one short English line with what identifies the exact model: brand, model name if you recognise it, logos, prints, cut, distinctive details.
- "candidatos" are the numbers of up to ${MAX_CANDIDATOS} products from the list that could be that same model, best first. Judge by brand, model and type of garment; ignore colour, because each link shows every colour. Leave it empty when nothing on the list could plausibly be the same item - an empty list is better than a guess.
- Also suggest a short catchy Spanish outfit "nombre" (2-4 words, like "Total black hoodie"), the section "genero" (hombre, mujer, or ambos for unisex accessories), the "temporada" (invierno or verano) and the "estilo" slug, chosen from the slugs you are given.`;

const PASO2_PROMPT = `For each garment below you get the outfit photo's garment description and the pictures of the shortlisted products. Pick the product that is the same garment model as in the outfit photo: same brand and design (logo, print, cut, sole, details). The colour does not need to match, because the product link offers every colour. If no candidate is the same model, answer null - a wrong link is worse than no link.

"confianza" is alta when you are sure, media when it is very likely but a detail can't be checked, baja when it is only similar. "motivo" is one short Spanish sentence the owner will read, saying why (or why none fits).`;

const catalogText = (list: Producto[]) =>
  list.map((p) => `${p.n}|${p.tab}|${p.nombre}|${p.usd != null ? "$" + p.usd.toFixed(2) : "?"}`).join("\n");

/** A product picture as base64, or null when it can't be fetched quickly. */
async function picture(url: string): Promise<{ data: string; media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif" } | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!res.ok || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 3.5 * 1024 * 1024) return null;
    return { data: buf.toString("base64"), media_type: type as "image/jpeg" };
  } catch {
    return null;
  }
}

export class MatchError extends Error {}

function readParsed<T>(response: { stop_reason: string | null; parsed_output: T | null }): T {
  if (response.stop_reason === "refusal") throw new MatchError("Claude no ha querido analizar esta foto.");
  if (!response.parsed_output) throw new MatchError("La respuesta de Claude no se pudo leer; vuelve a intentarlo.");
  return response.parsed_output;
}

/** `photo` is a JPEG as base64 (the panel shrinks it before sending). */
export async function emparejar(photo: string, estilos: string[]): Promise<Emparejado> {
  const client = new Anthropic();
  const [catalogo, eur] = await Promise.all([getCatalogo(), eurPorUsd()]);
  const byN = new Map(catalogo.map((p) => [p.n, p]));
  const image: Anthropic.Beta.BetaImageBlockParam = {
    type: "image",
    source: { type: "base64", media_type: "image/jpeg", data: photo },
  };

  // ---- 1. shortlist from the names ----
  const paso1 = readParsed(
    await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(Paso1) },
      system: [
        { type: "text", text: PASO1_SYSTEM },
        // the list is the same for every photo, so it is cached between calls
        { type: "text", text: `PRODUCT LIST\n${catalogText(catalogo)}`, cache_control: { type: "ephemeral", ttl: "1h" } },
      ],
      messages: [
        {
          role: "user",
          content: [image, { type: "text", text: `Estilo slugs: ${estilos.join(", ")}.\nList the garments in this outfit photo and their candidates.` }],
        },
      ],
    }),
  );

  const prendas = paso1.prendas.map((p) => ({
    ...p,
    candidatos: [...new Set(p.candidatos)].filter((n) => byN.has(n)).slice(0, MAX_CANDIDATOS),
  }));

  const opcion = (p: Producto): Opcion => ({
    n: p.n,
    nombre: p.nombre,
    link: p.link,
    foto: p.foto,
    eur: p.usd != null ? Math.round(p.usd * eur * 100) / 100 : null,
  });

  // ---- 2. confirm with the pictures ----
  const conCandidatos = prendas.map((p, i) => ({ p, i })).filter(({ p }) => p.candidatos.length);
  let elecciones: z.infer<typeof Paso2>["elecciones"] = [];
  if (conCandidatos.length) {
    const content: Anthropic.Beta.BetaContentBlockParam[] = [{ type: "text", text: "Outfit photo:" }, image];
    for (const { p, i } of conCandidatos) {
      content.push({ type: "text", text: `\nGarment ${i}: ${p.tipo} - ${p.descripcion}` });
      const pics = await Promise.all(p.candidatos.map((n) => picture(byN.get(n)!.foto)));
      p.candidatos.forEach((n, k) => {
        const prod = byN.get(n)!;
        content.push({ type: "text", text: `Candidate ${n} for garment ${i}: ${prod.nombre}${pics[k] ? "" : " (no picture available)"}` });
        const pic = pics[k];
        if (pic) content.push({ type: "image", source: { type: "base64", ...pic } });
      });
    }
    content.push({ type: "text", text: `\n${PASO2_PROMPT}\nAnswer for garments ${conCandidatos.map(({ i }) => i).join(", ")}.` });

    elecciones = readParsed(
      await client.beta.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "high", format: betaZodOutputFormat(Paso2) },
        messages: [{ role: "user", content }],
      }),
    ).elecciones;
  }

  return {
    nombre: paso1.nombre,
    genero: paso1.genero,
    temporada: paso1.temporada,
    estilo: estilos.includes(paso1.estilo) ? paso1.estilo : estilos.includes("streetwear") ? "streetwear" : estilos[0],
    prendas: prendas.map((p, i) => {
      const e = elecciones.find((x) => x.prenda === i);
      // only a candidate that was actually offered for this garment counts
      const chosen = e?.candidato != null && p.candidatos.includes(e.candidato) ? byN.get(e.candidato)! : null;
      return {
        tipo: p.tipo,
        descripcion: p.descripcion,
        elegido: chosen ? opcion(chosen) : null,
        confianza: chosen ? e!.confianza : null,
        motivo: e?.motivo ?? (p.candidatos.length ? "" : "No hay nada parecido en la lista."),
        alternativas: p.candidatos.filter((n) => n !== chosen?.n).map((n) => opcion(byN.get(n)!)),
      };
    }),
  };
}
