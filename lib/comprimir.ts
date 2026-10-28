import sharp from "sharp";

// Outfit photos used to be stored as they came: about 3 MB each (Gemini's 2K
// pictures, phone photos). Every download counts against Supabase's monthly
// transfer, so they're stored as a JPEG of at most 1200 px wide instead, still
// sharp in the site's biggest view, at around a tenth of the size.

export const ANCHO_MAX = 1200;

/** A web-sized JPEG of any photo (turned upright from its EXIF data). */
export async function comprimir(bytes: ArrayBuffer | Uint8Array): Promise<{ bytes: Buffer; mime: "image/jpeg" }> {
  const out = await sharp(Buffer.from(bytes as ArrayBuffer))
    .rotate()
    .resize({ width: ANCHO_MAX, height: ANCHO_MAX * 2, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { bytes: out, mime: "image/jpeg" };
}
