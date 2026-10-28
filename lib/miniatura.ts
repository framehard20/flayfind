/** A small copy of a stored photo, made and cached by Vercel's image optimizer.
 *  The originals are full-size photos in Supabase: showing them as they are in
 *  the panel downloaded megabytes per thumbnail and used up Supabase's monthly
 *  transfer. Local paths and data: URLs stay as they are. */
export const miniatura = (url: string, w: 256 | 640 | 1080 = 256) =>
  /^https?:\/\//.test(url) ? `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75` : url;
