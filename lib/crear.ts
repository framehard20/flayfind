import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { eurPorUsd, getCatalogo, type Producto } from "./catalogo";
import { catalogBlock, readParsed, type Opcion } from "./emparejar";
import { generico } from "./marcas";

// Outfit creator for /admin/outfits/crear: pick products from Masterspread's
// list (search, or let Claude suggest a look), then Google's image model lays
// them out as a flat-lay photo in the style of Flayfind's own outfit photos
// (light-blue shaggy carpet, shot from above). Claude can't make images, so
// the photo is Gemini's; the links and prices are the products' own.

const MODEL = "claude-opus-5-5";
/** Google's image model (Nano Banana 2.1): up to 10 object references, 9:16 output. */
const IMAGE_MODEL = "gemini-nano-banana-2.1";
/** One of Flayfind's real photos, used only as the style to copy. */
export const STYLE_PHOTO = "/img/essentials-black.jpg";

export const geminiConfigured = () => !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

export type Pieza = Opcion & { tipo: string };

/** Product pictures may only come from Masterspread's picture relay. */
export const isProductPicture = (url: string) => /^https:\/\/www\.masterspread\.com\/api\/img\?/.test(url);

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** A Spanish label for the piece, guessed from its name and tab; editable in the panel. */
export function tipoDe(nombre: string, tab = ""): string {
  const t = ` ${norm(nombre)} ${norm(tab)} `;
  const rules: [RegExp, string][] = [
    [/ (zip|zipper|half zip) /, "Sudadera con cremallera"],
    [/ (hoodie|hoody) /, "Sudadera con capucha"],
    [/ (sweatshirt|crewneck|crew neck) /, "Sudadera"],
    [/ (puffer|down jacket) /, "Plumífero"],
    [/ (jacket|windbreaker|coat|parka|bomber) /, "Chaqueta"],
    [/ (sweater|knit|cardigan) /, "Jersey"],
    [/ (shirt|polo) /, "Camisa"],
    [/ (t shirt|tee|tshirt) /, "Camiseta"],
    [/ (cargo) /, "Pantalón cargo"],
    [/ (jogger|sweatpants|track pants) /, "Jogger"],
    [/ (jeans|denim) /, "Jeans"],
    [/ (shorts) /, "Shorts"],
    [/ (pants|trousers) /, "Pantalón"],
    [/ (socks?) /, "Calcetines"],
    [/ (cap|hat|beanie) /, "Gorra"],
    [/ (bag|backpack|tote) /, "Bolso"],
    [/ (belt) /, "Cinturón"],
    [/ (slides?|slippers?|slipers?|sandals?) /, "Chanclas"],
    [/ (boots?) /, "Botas"],
    [/ (shoes?|sneakers?|trainers?|runners?|jordan|dunk|air force|yeezy|footwear) /, "Zapatillas"],
  ];
  const base = rules.find(([re]) => re.test(t))?.[1] ?? "Prenda";
  // tops: say whether they carry a design, never whose design it is
  if (/^(Camiseta|Sudadera|Sudadera con capucha|Jersey)$/.test(base)) {
    if (/ (plain|basic|blank) /.test(t)) return base === "Camiseta" ? "Camiseta básica" : `${base} básica`;
    if (/ (graphic|print|printed|logo|letter|letters|design|pattern|star|flame|skull|text) /.test(t)) return `${base} con diseño`;
  }
  return base;
}

const opcion = (p: Producto, eur: number): Opcion => ({
  n: p.n,
  nombre: p.nombre,
  link: p.link,
  foto: p.foto,
  eur: p.usd != null ? Math.round(p.usd * eur * 100) / 100 : null,
});

/** Products whose name has every word of the search, cheapest first within the best tab. */
export async function buscar(q: string, limit = 40): Promise<Pieza[]> {
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return [];
  const [catalogo, eur] = await Promise.all([getCatalogo(), eurPorUsd()]);
  return catalogo
    .filter((p) => p.foto && words.every((w) => norm(p.nombre).includes(w)))
    .slice(0, limit)
    .map((p) => ({ ...opcion(p, eur), tipo: tipoDe(p.nombre, p.tab) }));
}

const Sugerencia = z.object({
  outfits: z.array(
    z.object({
      nombre: z.string(),
      prendas: z.array(z.object({ tipo: z.string(), producto: z.number().int() })),
    }),
  ),
});

export const MAX_OUTFITS = 8;

const SUGERIR_SYSTEM = `You put together outfits for Flayfind, a Spanish outfit site. Every piece must be a product from the list above, given by its number.

Build the number of looks you are asked for. Each is a complete, wearable look that people of the given section would actually want: a top (and outerwear if the season calls for it), a bottom and a pair of shoes; one accessory only if it clearly lifts the look. Pieces must go together in style and colour family, and match the idea and season. Prefer well-known, popular items over obscure ones, and respect the budget when one is given (the list's prices are in USD). Pick products whose names say clearly what they are. When you build several looks, make them clearly different from each other (different pieces and colours); never repeat the same top or the same shoes across looks.

"tipo" is a short generic Spanish label as a shopper would say it ("Sudadera con capucha", "Camiseta básica", "Camiseta con diseño", "Jogger cargo", "Sneakers negras"). "nombre" is a short catchy Spanish outfit name (2-4 words, like "Total black hoodie"). NEVER put a brand or model name in "tipo" or "nombre" (no Nike, Essentials, Dior, Air Force, B22...): describe the item instead (colour, cut, "con logo", "con diseño", "básica").`;

export type Sugerido = { nombre: string; piezas: Pieza[] };

export async function sugerir(o: {
  genero: string;
  estilo: string;
  temporada: string;
  idea: string;
  presupuesto: string;
  cantidad: number;
}): Promise<Sugerido[]> {
  const cantidad = Math.min(MAX_OUTFITS, Math.max(1, Math.round(o.cantidad) || 1));
  const client = new Anthropic();
  const [catalogo, eur] = await Promise.all([getCatalogo(), eurPorUsd()]);
  const byN = new Map(catalogo.map((p) => [p.n, p]));
  const pedido = [
    `Section: ${o.genero}`,
    `Style: ${o.estilo}`,
    `Season: ${o.temporada}`,
    o.idea.trim() ? `Idea from the owner: ${o.idea.trim()}` : "No specific idea: surprise with a strong, popular look.",
    o.presupuesto.trim() ? `Budget for each outfit: about ${o.presupuesto.trim()} EUR.` : "",
    `Number of looks: ${cantidad}`,
  ].filter(Boolean).join("\n");

  const s = readParsed(
    await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(Sugerencia) },
      system: [catalogBlock(catalogo), { type: "text", text: SUGERIR_SYSTEM }],
      messages: [{ role: "user", content: pedido }],
    }),
  );
  // brand names never reach the site, even if Claude slips one in
  return s.outfits
    .slice(0, cantidad)
    .map((look) => ({
      nombre: generico(look.nombre, "Outfit"),
      piezas: look.prendas
        .filter((x) => byN.get(x.producto)?.foto)
        .map((x) => {
          const p = byN.get(x.producto)!;
          return { ...opcion(p, eur), tipo: generico(x.tipo, tipoDe(p.nombre, p.tab)) };
        }),
    }))
    .filter((look) => look.piezas.length);
}

const FOTO_PROMPT = `Create a photorealistic overhead flat-lay product photo in vertical 9:16 format.

Copy the STYLE of the first image exactly: the same soft light-blue shaggy carpet filling the whole background edge to edge, the same soft, even daylight from above with gentle shadows, the same straight-down camera angle and scale. Arrange the clothes the same way: the top laid flat in the upper part with its sleeves slightly out, the trousers below and slightly angled, overlapping the top a little, and the pair of shoes at the bottom, one shoe on each side, all neatly placed with small natural folds. Accessories go in a free space where they look natural.

Do NOT copy the clothes in the first image - they only show the style. The clothes must be exactly the products in the other images: keep each product's design, cut, colours, logos, prints and details faithful to its photo. If a product photo shows several colours or several views, use one colourway only and show the item once (shoes as one pair).

No people, mannequins or hangers. No text, labels, price tags or watermarks. Nothing that is not listed.`;

export class FotoError extends Error {}

/** A JPEG/PNG from our own site or Masterspread, as Gemini wants it. */
async function asImage(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const mime = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!res.ok || !/^image\/(jpeg|png|webp)$/.test(mime)) return null;
  return { type: "image" as const, mime_type: mime as "image/jpeg", data: Buffer.from(await res.arrayBuffer()).toString("base64") };
}

/** The flat-lay photo of these pieces, as bytes. `origin` is this site's address (for the style photo). */
export async function generarFoto(piezas: Pieza[], notas: string, origin: string): Promise<{ bytes: Buffer; mime: string }> {
  // the relay serves bigger pictures on request: more detail for the model
  const [style, ...pics] = await Promise.all([
    asImage(origin + STYLE_PHOTO),
    ...piezas.map((p) => asImage(p.foto.replace(/([?&])w=\d+/, "$1w=1000"))),
  ]);
  if (!style) throw new FotoError("No se pudo leer la foto de estilo de la web.");

  const input: ({ type: "text"; text: string } | NonNullable<Awaited<ReturnType<typeof asImage>>>)[] = [
    { type: "text", text: FOTO_PROMPT },
    { type: "text", text: "Image 1 - the style to copy (not its clothes):" },
    style,
  ];
  let n = 2;
  piezas.forEach((p, i) => {
    const pic = pics[i];
    if (!pic) return;
    input.push({ type: "text", text: `Image ${n++} - ${p.tipo}: ${p.nombre}` }, pic);
  });
  if (n === 2) throw new FotoError("No se pudo leer ninguna foto de las prendas; prueba otra vez.");
  if (notas.trim()) input.push({ type: "text", text: `Notes from the owner: ${notas.trim()}` });

  const ai = new GoogleGenAI({});
  const result = await ai.interactions.create({
    model: IMAGE_MODEL,
    input,
    response_format: { type: "image", aspect_ratio: "9:16", image_size: "2K" },
  });
  const out = result.output_image;
  if (!out?.data) throw new FotoError("Google no devolvió ninguna imagen; vuelve a intentarlo (o cambia alguna prenda).");
  return { bytes: Buffer.from(out.data, "base64"), mime: out.mime_type || "image/png" };
}
