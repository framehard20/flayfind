export type Prenda = { tipo: string; precio: number; link: string };

/** Which section an outfit shows in. "ambos" appears in Hombre and Mujer —
 *  handy for accessories that suit anyone. */
export type Genero = "hombre" | "mujer" | "ambos";
export type Temporada = "invierno" | "verano";
/** A subsection slug: the built-in ones live in lib/styles.ts, the rest are
 *  created in /admin/estilos, so this can be any slug. */
export type Categoria = string;

export type Outfit = {
  nombre: string;
  genero: Genero;
  temporada: Temporada;
  categoria: Categoria;
  foto: string;
  precioMarca: number;
  prendas: Prenda[];
  /** Followers' section only: place in the list (1 = first) and who sent it. */
  posicion?: number;
  autor?: string;
  instagram?: string;
};

// Data copied verbatim from the original index.html OUTFITS array — see
// README-style comment at the bottom of this file for how to add a new one.
export const OUTFITS: Outfit[] = [
  // ---------- OUTFITS ----------
  {
    nombre:"Total black hoodie",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/essentials-black.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Sudadera con capucha", precio:20.00, link:"https://www.uidbuy.com/product/3/7756761221?ref=UWSV3X" },
      { tipo:"Jogger cargo", precio:3.00, link:"https://www.uidbuy.com/product/3/7847678240?ref=UWSV3X" },
      { tipo:"Sneakers negras", precio:35.00, link:"https://www.uidbuy.com/product/3/7847664430?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Rosa preppy",
    genero:"hombre",
    temporada:"invierno",
    categoria:"elegante",
    foto:"/img/rosa-preppy.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Jersey trenzado rosa", precio:18.00, link:"https://www.uidbuy.com/product/3/7758828681?ref=UWSV3X" },
      { tipo:"Cargo negro", precio:10.00, link:"https://www.uidbuy.com/product/3/7844697549?ref=UWSV3X" },
      { tipo:"Sneakers rosas", precio:28.00, link:"https://www.uidbuy.com/product/3/7759787484?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Total black baggy",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/total-black-baggy.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Sudadera con cremallera", precio:20.00, link:"https://www.uidbuy.com/product/3/7755073801?ref=UWSV3X" },
      { tipo:"Jeans anchos negros", precio:10.00, link:"https://www.uidbuy.com/product/3/7844697549?ref=UWSV3X" },
      { tipo:"Sneakers negras", precio:30.00, link:"https://www.uidbuy.com/product/3/7761797152?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Deportivo rosa",
    genero:"hombre",
    temporada:"verano",
    categoria:"gym",
    foto:"/img/ua-rosa.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta técnica", precio:15.00, link:"https://www.uidbuy.com/product/3/7758879675?ref=UWSV3X" },
      { tipo:"Short deportivo", precio:15.00, link:"https://www.uidbuy.com/product/3/7758879675?ref=UWSV3X" },
      { tipo:"Zapatillas blancas", precio:28.00, link:"https://www.uidbuy.com/product/3/7759787484?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Celeste clean",
    genero:"hombre",
    temporada:"invierno",
    categoria:"elegante",
    foto:"/img/celeste-clean.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Jersey liso celeste", precio:15.00, link:"https://www.uidbuy.com/product/3/7847727266?ref=UWSV3X" },
      { tipo:"Jeans negros", precio:10.00, link:"https://www.uidbuy.com/product/3/7844697549?ref=UWSV3X" },
      { tipo:"Sneakers", precio:38.00, link:"https://www.uidbuy.com/product/3/7809302092?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Box logo verano",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/supreme-verano.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta box logo", precio:15.00, link:"https://www.uidbuy.com/product/3/7755042357?ref=UWSV3X" },
      { tipo:"Short cargo camo", precio:15.00, link:"https://www.uidbuy.com/product/3/7828556935?ref=UWSV3X" },
      { tipo:"Sneakers", precio:38.00, link:"https://www.uidbuy.com/product/3/7765822954?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Rosa street",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/rosa-street.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta manga larga rosa", precio:20.00, link:"https://www.uidbuy.com/product/3/7844809847?ref=UWSV3X" },
      { tipo:"Jeans anchos", precio:10.00, link:"https://www.uidbuy.com/product/3/7844684305?ref=UWSV3X" },
      { tipo:"Sneakers", precio:38.00, link:"https://www.uidbuy.com/product/3/7765822954?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Chándal técnico verde",
    genero:"hombre",
    temporada:"verano",
    categoria:"gym",
    foto:"/img/nike-verde.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Cortavientos verde", precio:14.00, link:"https://www.uidbuy.com/product/3/7844788151?ref=UWSV3X" },
      { tipo:"Short técnico", precio:14.00, link:"https://www.uidbuy.com/product/3/7844788151?ref=UWSV3X" },
      { tipo:"Zapatillas running", precio:38.00, link:"https://www.uidbuy.com/product/3/7809302092?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Manga larga black",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/supreme-black.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta manga larga", precio:28.00, link:"https://www.uidbuy.com/product/3/7847756966?ref=UWSV3X" },
      { tipo:"Jogger negro", precio:29.00, link:"https://www.uidbuy.com/product/3/7844666677?ref=UWSV3X" },
      { tipo:"Sneakers negras", precio:28.00, link:"https://www.uidbuy.com/product/3/7759787484?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Gris esencial",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/gris-esencial.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Sudadera crew negra", precio:28.00, link:"https://www.uidbuy.com/product/3/7847756966?ref=UWSV3X" },
      { tipo:"Jogger gris", precio:18.00, link:"https://www.uidbuy.com/product/3/7756650815?ref=UWSV3X" },
      { tipo:"Sneakers", precio:38.00, link:"https://www.uidbuy.com/product/3/7809302092?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Navy compass",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/navy-compass.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta manga larga blanca", precio:20.00, link:"https://www.uidbuy.com/product/3/7844646833?ref=UWSV3X" },
      { tipo:"Jogger navy", precio:30.00, link:"https://www.uidbuy.com/product/3/7844666677?ref=UWSV3X" },
      { tipo:"Sneakers navy", precio:40.00, link:"https://www.uidbuy.com/product/3/7847771722?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Corazón oliva",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/corazon-oliva.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta manga larga", precio:20.00, link:"https://www.uidbuy.com/product/3/7844786285?ref=UWSV3X" },
      { tipo:"Jogger oliva", precio:38.00, link:"https://www.uidbuy.com/product/3/7847814128?ref=UWSV3X" },
      { tipo:"Sneakers", precio:38.00, link:"https://www.uidbuy.com/product/3/7765822954?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Zip navy baggy",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/supreme-baggy.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Sudadera con cremallera", precio:40.00, link:"https://www.uidbuy.com/product/3/7847780224?ref=UWSV3X" },
      { tipo:"Jeans anchos", precio:10.00, link:"https://www.uidbuy.com/product/3/7844697549?ref=UWSV3X" },
      { tipo:"Sneakers azules", precio:50.00, link:"https://www.uidbuy.com/product/3/7844774575?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Beige monograma",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/beige-monograma.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Jersey de punto beige", precio:35.00, link:"https://www.uidbuy.com/product/3/7761806646?ref=UWSV3X" },
      { tipo:"Jeans blancos", precio:10.00, link:"https://www.uidbuy.com/product/3/7844697549?ref=UWSV3X" },
      { tipo:"Sneakers beige", precio:70.00, link:"https://www.uidbuy.com/product/3/7755056127?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Total black premium",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/total-black-lv.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Jersey de punto negro", precio:35.00, link:"https://www.uidbuy.com/product/3/7761806646?ref=UWSV3X" },
      { tipo:"Jeans negros", precio:18.00, link:"https://www.uidbuy.com/product/3/7844776481?ref=UWSV3X" },
      { tipo:"Sneakers negras", precio:70.00, link:"https://www.uidbuy.com/product/3/7755056127?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Técnico azul",
    genero:"hombre",
    temporada:"invierno",
    categoria:"streetwear",
    foto:"/img/corteiz-azul.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Chaqueta técnica azul", precio:65.00, link:"https://www.uidbuy.com/product/3/7758807204?ref=UWSV3X" },
      { tipo:"Jeans negros", precio:15.00, link:"https://www.uidbuy.com/product/3/7759866112?ref=UWSV3X" },
      { tipo:"Sneakers", precio:50.00, link:"https://www.uidbuy.com/product/3/7757976998?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Cargo blanco y negro",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/cargo-blanco-negro.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta blanca", precio:18.00, link:"https://www.uidbuy.com/product/3/7838665032?ref=UWSV3X" },
      { tipo:"Cargo corto negro", precio:15.00, link:"https://www.uidbuy.com/product/3/7838671088?ref=UWSV3X" },
      { tipo:"Sneakers", precio:30.00, link:"https://www.uidbuy.com/product/3/7845062037?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Eight ball verano",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/eight-ball.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta blanca", precio:9.00, link:"https://www.uidbuy.com/product/3/7835641437?ref=UWSV3X" },
      { tipo:"Short negro", precio:5.00, link:"https://www.uidbuy.com/product/3/7835676767?ref=UWSV3X" },
      { tipo:"Sneakers", precio:20.00, link:"https://www.uidbuy.com/product/3/7838743862?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Camo azul verano",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/camo-azul.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta estampada", precio:18.00, link:"https://www.uidbuy.com/product/3/7838752384?ref=UWSV3X" },
      { tipo:"Bermuda denim", precio:14.00, link:"https://www.uidbuy.com/product/3/7766066226?ref=UWSV3X" },
      { tipo:"Sneakers", precio:38.00, link:"https://www.uidbuy.com/product/3/7809302092?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Jersey fútbol",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/jersey-futbol.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta de fútbol", precio:3.00, link:"https://www.uidbuy.com/product/3/7848026822?ref=UWSV3X" },
      { tipo:"Short estampado", precio:13.00, link:"https://www.uidbuy.com/product/3/7829075425?ref=UWSV3X" },
      { tipo:"Sneakers blancas", precio:40.00, link:"https://www.uidbuy.com/product/3/7845091709?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Deportivo negro",
    genero:"hombre",
    temporada:"verano",
    categoria:"gym",
    foto:"/img/deportivo-negro.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta técnica", precio:12.50, link:"https://www.uidbuy.com/product/3/7834086542?ref=UWSV3X" },
      { tipo:"Short técnico", precio:12.50, link:"https://www.uidbuy.com/product/3/7834086542?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Black roses verano",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/black-roses.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta negra", precio:20.00, link:"https://www.uidbuy.com/product/3/7838631452?ref=UWSV3X" },
      { tipo:"Short negro", precio:5.00, link:"https://www.uidbuy.com/product/3/7835676767?ref=UWSV3X" },
      { tipo:"Sneakers negras", precio:30.00, link:"https://www.uidbuy.com/product/3/7845062037?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Set gris verano",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/set-gris.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta gris", precio:5.00, link:"https://www.uidbuy.com/product/3/7835676767?ref=UWSV3X" },
      { tipo:"Short gris", precio:5.00, link:"https://www.uidbuy.com/product/3/7835676767?ref=UWSV3X" },
      { tipo:"Sneakers blancas", precio:28.00, link:"https://www.uidbuy.com/product/3/7759787484?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Negro esencial verano",
    genero:"hombre",
    temporada:"verano",
    categoria:"streetwear",
    foto:"/img/essentials-negro-verano.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Camiseta negra", precio:18.00, link:"https://www.uidbuy.com/product/3/7755050285?ref=UWSV3X" },
      { tipo:"Short negro", precio:15.00, link:"https://www.uidbuy.com/product/3/7838635390?ref=UWSV3X" },
      { tipo:"Sneakers blancas", precio:28.00, link:"https://www.uidbuy.com/product/3/7759787484?ref=UWSV3X" },
    ]
  },

  // ---------- ACCESORIOS ----------
  {
    nombre:"Gafas transparentes",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gafas-transparentes.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gafas", precio:10.00, link:"https://www.uidbuy.com/product/3/7756811281?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Gafas de sol negras",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gafas-negras.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gafas de sol", precio:14.00, link:"https://www.uidbuy.com/product/3/7755016611?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Máscara térmica",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-mascara.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Máscara para correr", precio:10.00, link:"https://www.uidbuy.com/product/3/7758046112?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Bolso bandolera",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-bolso-azul.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Bolso", precio:20.00, link:"https://www.uidbuy.com/product/3/7755054157?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Gorra NY negra",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gorra-ny.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gorra", precio:13.00, link:"https://www.uidbuy.com/product/3/7756842899?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Brazalete acero",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-brazalete.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Brazalete", precio:11.00, link:"https://www.uidbuy.com/product/3/7756793531?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Bóxer blanco",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-boxer.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Bóxer", precio:3.00, link:"https://www.uidbuy.com/product/3/7758826701?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Cartera tarjetero",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-cartera.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Cartera", precio:10.00, link:"https://www.uidbuy.com/product/3/7754969369?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Reloj plateado",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-reloj.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Reloj", precio:60.00, link:"https://www.uidbuy.com/product/3/7761847996?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Gorra LA azul",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gorra-la.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gorra LA", precio:10.00, link:"https://www.uidbuy.com/product/3/7754998913?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Mochila deportiva",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-mochila.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Mochila", precio:15.00, link:"https://www.uidbuy.com/product/3/7758026344?ref=UWSV3X" },
    ]
  },
  {
    nombre:"Pack calcetines",
    genero:"ambos",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-calcetines.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Pack de calcetines", precio:5.00, link:"https://www.uidbuy.com/product/3/7759834864?ref=UWSV3X" },
    ]
  },
];
