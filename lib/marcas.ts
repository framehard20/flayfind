// Brand and model names that must never appear in an outfit's name or in a
// garment's label (Mario's rule, 21 Oct 2026): the site shows generic names
// such as "Camiseta básica" or "Sudadera con diseño". Used by the panel to
// warn before saving, by the outfits API to refuse new ones, and to clean what
// Claude writes. Based on Masterspread's brand list (public/catalog.js); the
// very short abbreviations there (ap, rl, ck, ee...) are left out because they
// clash with ordinary words.

const BRANDS: [string, string][] = [
  ["Nike", "nike|nocta|nike sb"], ["Jordan", "jordan|air jordan|aj ?\\d+"], ["Adidas", "adidas"],
  ["Yeezy", "yeezy|yeezys"], ["New Balance", "new balance|nb ?\\d{3,4}"], ["Asics", "asics|onitsuka( tiger)?"],
  ["Puma", "puma"], ["Converse", "converse"], ["Vans", "vans"], ["Salomon", "salomon"],
  ["On", "on running|on cloud\\w*|cloudswift|cloudmonster"], ["Hoka", "hoka"], ["The North Face", "the north face|north face|tnf"],
  ["Stüssy", "stussy"], ["Supreme", "supreme"], ["Bape", "bape|a bathing ape"], ["Palace", "palace"],
  ["Corteiz", "corteiz|crtz"], ["Trapstar", "trapstar"], ["Essentials", "essentials|fear of god|fog"],
  ["Gallery Dept", "gallery dept\\w*"], ["Chrome Hearts", "chrome hearts"], ["Amiri", "amiri"], ["Rhude", "rhude"],
  ["Represent", "represent"], ["Off-White", "off ?white"], ["Palm Angels", "palm angels"], ["Stone Island", "stone island"],
  ["C.P. Company", "cp company|c p company"], ["Moncler", "moncler"], ["Canada Goose", "canada goose"],
  ["Arc'teryx", "arc ?teryx|arcteryx"], ["Ralph Lauren", "ralph lauren|polo ralph|ralph"], ["Lacoste", "lacoste"],
  ["Tommy Hilfiger", "tommy hilfiger|tommy"], ["Calvin Klein", "calvin klein"], ["Hugo Boss", "hugo boss"],
  ["Burberry", "burberry"], ["Gucci", "gucci"], ["Louis Vuitton", "louis vuitton|lv"], ["Dior", "dior"],
  ["Prada", "prada"], ["Miu Miu", "miu ?miu"], ["Balenciaga", "balenciaga"], ["Versace", "versace"],
  ["Fendi", "fendi"], ["Givenchy", "givenchy"], ["Saint Laurent", "saint laurent|ysl"], ["Celine", "celine"],
  ["Loewe", "loewe"], ["Bottega Veneta", "bottega\\w*"], ["Valentino", "valentino"], ["Alexander McQueen", "alexander mcqueen|mcqueen"],
  ["Rick Owens", "rick owens"], ["Maison Margiela", "margiela|mm6"], ["Golden Goose", "golden goose|ggdb"],
  ["Acne Studios", "acne studios?|acne"], ["Ami", "ami paris"], ["Casablanca", "casablanca"], ["Jacquemus", "jacquemus"],
  ["Kenzo", "kenzo"], ["Hermès", "hermes"], ["Chanel", "chanel"], ["Cartier", "cartier"], ["Rolex", "rolex"],
  ["Omega", "omega"], ["Audemars Piguet", "audemars piguet|audemars"], ["Patek Philippe", "patek\\w*"],
  ["Van Cleef", "van cleef\\w*"], ["Tiffany", "tiffany"], ["Apple", "apple|airpods?"], ["Beats", "beats"],
  ["Sony", "sony"], ["Dyson", "dyson"], ["Lego", "lego|legos"], ["Ugg", "ugg|uggs"], ["Birkenstock", "birkenstock"],
  ["Crocs", "crocs"], ["Timberland", "timberland"], ["Carhartt", "carhartt"], ["Dickies", "dickies"], ["Vlone", "vlone"],
  ["Sp5der", "sp5der"], ["Hellstar", "hellstar"], ["Broken Planet", "broken planet"], ["Denim Tears", "denim tears"],
  ["Eric Emanuel", "eric emanuel"], ["Syna World", "syna world|syna"], ["Aimé Leon Dore", "aime leon dore"],
  ["Kith", "kith"], ["Travis Scott", "travis scott|cactus jack"], ["Patagonia", "patagonia"], ["Oakley", "oakley"],
  ["Goyard", "goyard"], ["Bvlgari", "bvlgari|bulgari"], ["Swarovski", "swarovski"], ["Levi's", "levis|levi s"],
  ["Zara", "zara"], ["Ellesse", "ellesse"], ["Fila", "fila"], ["Champion", "champion"], ["Reebok", "reebok"],
  ["Under Armour", "under armour"], ["Gymshark", "gymshark"], ["Moschino", "moschino"], ["Diesel", "diesel"],
  // model names that give the brand away
  ["Nike", "air ?force( 1)?|af1|air ?max|airmax|dunks?|vapormax|tn|max plus|cortez|blazer mid|pegasus|tech fleece|swoosh"],
  ["Adidas", "samba|gazelle|campus|spezial|superstar|stan smith|ozweego|forum low|handball spezial"],
  ["Dior", "b22|b23|b25|b27|b30|b33"],
  ["Supreme", "box logo"],
  ["New Balance", "550|9060|2002r|1906r|530"],
];

const PATTERNS = BRANDS.map(([name, re]) => [name, new RegExp(`(?:^| )(?:${re})(?= |$)`, "g")] as const);

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** The brands named in this text (empty when it's clean). */
export function marcasEn(text: string): string[] {
  const t = norm(text);
  if (!t) return [];
  const found = new Set<string>();
  for (const [name, re] of PATTERNS) {
    re.lastIndex = 0;
    if (re.test(t)) found.add(name);
  }
  return [...found];
}

/** The text without its brand and model names, tidied up. */
export function sinMarcas(text: string): string {
  let words = norm(text);
  for (const [, re] of PATTERNS) words = words.replace(re, " ");
  const keep = new Set(words.split(" ").filter(Boolean));
  // keep the original spelling, accents and capitals of the words that stay
  const out = text
    .split(/(\s+)/)
    .filter((w) => /^\s+$/.test(w) || norm(w).split(" ").every((x) => !x || keep.has(x)))
    .join("")
    .replace(/\s+/g, " ")
    .replace(/^[\s·,.\-–—]+|[\s·,.\-–—]+$/g, "")
    .trim();
  return out ? out[0].toUpperCase() + out.slice(1) : "";
}

/** "Sudadera Nike" -> "Sudadera"; falls back when nothing is left. */
export const generico = (text: string, fallback: string) => sinMarcas(text) || fallback;
