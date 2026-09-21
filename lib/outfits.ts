export type Prenda = { tipo: string; precio: number; link: string };

export type Genero = "hombre" | "mujer" | "tech";
export type Temporada = "invierno" | "verano";
export type Categoria = "gym" | "elegante" | "streetwear" | "tech";

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
      { tipo:"Sudadera con capucha", precio:20.00, link:"https://hipobuy.com/product/weidian/7756761221?inviteCode=YILTEC" },
      { tipo:"Jogger cargo", precio:3.00, link:"https://hipobuy.com/product/weidian/7847678240?inviteCode=YILTEC" },
      { tipo:"Sneakers negras", precio:35.00, link:"https://hipobuy.com/product/weidian/7847664430?inviteCode=YILTEC" },
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
      { tipo:"Jersey trenzado rosa", precio:18.00, link:"https://hipobuy.com/product/weidian/7758828681?inviteCode=YILTEC" },
      { tipo:"Cargo negro", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers rosas", precio:28.00, link:"https://hipobuy.com/product/weidian/7759787484?inviteCode=YILTEC" },
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
      { tipo:"Sudadera con cremallera", precio:20.00, link:"https://hipobuy.com/product/weidian/7755073801?inviteCode=YILTEC" },
      { tipo:"Jeans anchos negros", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers negras", precio:30.00, link:"https://hipobuy.com/product/weidian/7761797152?inviteCode=YILTEC" },
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
      { tipo:"Camiseta técnica", precio:15.00, link:"https://hipobuy.com/product/weidian/7758879675?inviteCode=YILTEC" },
      { tipo:"Short deportivo", precio:15.00, link:"https://hipobuy.com/product/weidian/7758879675?inviteCode=YILTEC" },
      { tipo:"Zapatillas blancas", precio:28.00, link:"https://hipobuy.com/product/weidian/7759787484?inviteCode=YILTEC" },
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
      { tipo:"Jersey liso celeste", precio:15.00, link:"https://hipobuy.com/product/weidian/7847727266?inviteCode=YILTEC" },
      { tipo:"Jeans negros", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:38.00, link:"https://hipobuy.com/goods/details?id=7809302092&channel=WEIDIAN&inviteCode=YILTEC" },
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
      { tipo:"Camiseta box logo", precio:15.00, link:"https://hipobuy.com/product/weidian/7755042357?inviteCode=YILTEC" },
      { tipo:"Short cargo camo", precio:15.00, link:"https://hipobuy.com/product/weidian/7828556935?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:38.00, link:"https://hipobuy.com/product/weidian/7765822954?inviteCode=YILTEC" },
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
      { tipo:"Camiseta manga larga rosa", precio:20.00, link:"https://hipobuy.com/product/weidian/7844809847?inviteCode=YILTEC" },
      { tipo:"Jeans anchos", precio:10.00, link:"https://hipobuy.com/product/weidian/7844684305?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:38.00, link:"https://hipobuy.com/product/weidian/7765822954?inviteCode=YILTEC" },
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
      { tipo:"Cortavientos verde", precio:14.00, link:"https://hipobuy.com/product/weidian/7844788151?inviteCode=YILTEC" },
      { tipo:"Short técnico", precio:14.00, link:"https://hipobuy.com/product/weidian/7844788151?inviteCode=YILTEC" },
      { tipo:"Zapatillas running", precio:38.00, link:"https://hipobuy.com/goods/details?id=7809302092&channel=WEIDIAN&inviteCode=YILTEC" },
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
      { tipo:"Camiseta manga larga", precio:28.00, link:"https://hipobuy.com/product/weidian/7847756966?inviteCode=YILTEC" },
      { tipo:"Jogger negro", precio:29.00, link:"https://hipobuy.com/product/weidian/7844666677?inviteCode=YILTEC" },
      { tipo:"Sneakers negras", precio:28.00, link:"https://hipobuy.com/product/weidian/7759787484?inviteCode=YILTEC" },
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
      { tipo:"Sudadera crew negra", precio:28.00, link:"https://hipobuy.com/product/weidian/7847756966?inviteCode=YILTEC" },
      { tipo:"Jogger gris", precio:18.00, link:"https://hipobuy.com/product/weidian/7756650815?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:38.00, link:"https://hipobuy.com/goods/details?id=7809302092&channel=WEIDIAN&inviteCode=YILTEC" },
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
      { tipo:"Camiseta manga larga blanca", precio:20.00, link:"https://hipobuy.com/product/weidian/7844646833?inviteCode=YILTEC" },
      { tipo:"Jogger navy", precio:30.00, link:"https://hipobuy.com/product/weidian/7844666677?inviteCode=YILTEC" },
      { tipo:"Sneakers navy", precio:40.00, link:"https://hipobuy.com/product/weidian/7847771722?inviteCode=YILTEC" },
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
      { tipo:"Camiseta manga larga", precio:20.00, link:"https://hipobuy.com/product/weidian/7844786285?inviteCode=YILTEC" },
      { tipo:"Jogger oliva", precio:38.00, link:"https://hipobuy.com/product/weidian/7847814128?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:38.00, link:"https://hipobuy.com/product/weidian/7765822954?inviteCode=YILTEC" },
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
      { tipo:"Sudadera con cremallera", precio:40.00, link:"https://hipobuy.com/product/weidian/7847780224?inviteCode=YILTEC" },
      { tipo:"Jeans anchos", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers azules", precio:50.00, link:"https://hipobuy.com/product/weidian/7844774575?inviteCode=YILTEC" },
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
      { tipo:"Jersey de punto beige", precio:35.00, link:"https://hipobuy.com/product/weidian/7761806646?inviteCode=YILTEC" },
      { tipo:"Jeans blancos", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers beige", precio:70.00, link:"https://hipobuy.com/product/weidian/7755056127?inviteCode=YILTEC" },
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
      { tipo:"Jersey de punto negro", precio:35.00, link:"https://hipobuy.com/product/weidian/7761806646?inviteCode=YILTEC" },
      { tipo:"Jeans negros", precio:18.00, link:"https://hipobuy.com/product/weidian/7844776481?inviteCode=YILTEC" },
      { tipo:"Sneakers negras", precio:70.00, link:"https://hipobuy.com/product/weidian/7755056127?inviteCode=YILTEC" },
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
      { tipo:"Chaqueta técnica azul", precio:65.00, link:"https://hipobuy.com/product/weidian/7758807204?inviteCode=YILTEC" },
      { tipo:"Jeans negros", precio:15.00, link:"https://hipobuy.com/product/weidian/7759866112?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:50.00, link:"https://hipobuy.com/product/weidian/7757976998?inviteCode=YILTEC" },
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
      { tipo:"Camiseta blanca", precio:18.00, link:"https://hipobuy.com/product/weidian/7838665032?inviteCode=YILTEC" },
      { tipo:"Cargo corto negro", precio:15.00, link:"https://hipobuy.com/product/weidian/7838671088?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:30.00, link:"https://hipobuy.com/product/weidian/7845062037?inviteCode=YILTEC" },
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
      { tipo:"Camiseta blanca", precio:9.00, link:"https://hipobuy.com/product/weidian/7835641437?inviteCode=YILTEC" },
      { tipo:"Short negro", precio:5.00, link:"https://hipobuy.com/product/weidian/7835676767?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:20.00, link:"https://hipobuy.com/product/weidian/7838743862?inviteCode=YILTEC" },
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
      { tipo:"Camiseta estampada", precio:18.00, link:"https://hipobuy.com/product/weidian/7838752384?inviteCode=YILTEC" },
      { tipo:"Bermuda denim", precio:14.00, link:"https://hipobuy.com/product/weidian/7766066226?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:38.00, link:"https://hipobuy.com/goods/details?id=7809302092&channel=WEIDIAN&inviteCode=YILTEC" },
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
      { tipo:"Camiseta de fútbol", precio:3.00, link:"https://hipobuy.com/product/weidian/7848026822?inviteCode=YILTEC" },
      { tipo:"Short estampado", precio:13.00, link:"https://hipobuy.com/product/weidian/7829075425?inviteCode=YILTEC" },
      { tipo:"Sneakers blancas", precio:40.00, link:"https://hipobuy.com/product/weidian/7845091709?inviteCode=YILTEC" },
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
      { tipo:"Camiseta técnica", precio:12.50, link:"https://hipobuy.com/product/weidian/7834086542?inviteCode=YILTEC" },
      { tipo:"Short técnico", precio:12.50, link:"https://hipobuy.com/product/weidian/7834086542?inviteCode=YILTEC" },
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
      { tipo:"Camiseta negra", precio:20.00, link:"https://hipobuy.com/product/weidian/7838631452?inviteCode=YILTEC" },
      { tipo:"Short negro", precio:5.00, link:"https://hipobuy.com/product/weidian/7835676767?inviteCode=YILTEC" },
      { tipo:"Sneakers negras", precio:30.00, link:"https://hipobuy.com/product/weidian/7845062037?inviteCode=YILTEC" },
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
      { tipo:"Camiseta gris", precio:5.00, link:"https://hipobuy.com/product/weidian/7835676767?inviteCode=YILTEC" },
      { tipo:"Short gris", precio:5.00, link:"https://hipobuy.com/product/weidian/7835676767?inviteCode=YILTEC" },
      { tipo:"Sneakers blancas", precio:28.00, link:"https://hipobuy.com/product/weidian/7759787484?inviteCode=YILTEC" },
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
      { tipo:"Camiseta negra", precio:18.00, link:"https://hipobuy.com/product/weidian/7755050285?inviteCode=YILTEC" },
      { tipo:"Short negro", precio:15.00, link:"https://hipobuy.com/product/weidian/7838635390?inviteCode=YILTEC" },
      { tipo:"Sneakers blancas", precio:28.00, link:"https://hipobuy.com/product/weidian/7759787484?inviteCode=YILTEC" },
    ]
  },

  // ---------- ACCESORIOS ----------
  {
    nombre:"Gafas transparentes",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gafas-transparentes.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gafas", precio:10.00, link:"https://hipobuy.com/product/weidian/7756811281?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Gafas de sol negras",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gafas-negras.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gafas de sol", precio:14.00, link:"https://hipobuy.com/product/weidian/7755016611?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Máscara térmica",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-mascara.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Máscara para correr", precio:10.00, link:"https://hipobuy.com/product/weidian/7758046112?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Bolso bandolera",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-bolso-azul.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Bolso", precio:20.00, link:"https://hipobuy.com/product/weidian/7755054157?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Gorra NY negra",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gorra-ny.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gorra", precio:13.00, link:"https://hipobuy.com/product/weidian/7756842899?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Brazalete acero",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-brazalete.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Brazalete", precio:11.00, link:"https://hipobuy.com/product/weidian/7756793531?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Bóxer blanco",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-boxer.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Bóxer", precio:3.00, link:"https://hipobuy.com/product/weidian/7758826701?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Cartera tarjetero",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-cartera.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Cartera", precio:10.00, link:"https://hipobuy.com/product/weidian/7754969369?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Reloj plateado",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-reloj.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Reloj", precio:60.00, link:"https://hipobuy.com/product/weidian/7761847996?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Gorra LA azul",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-gorra-la.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Gorra LA", precio:10.00, link:"https://hipobuy.com/product/weidian/7754998913?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Mochila deportiva",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-mochila.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Mochila", precio:15.00, link:"https://hipobuy.com/product/weidian/7758026344?inviteCode=YILTEC" },
    ]
  },
  {
    nombre:"Pack calcetines",
    genero:"tech",
    temporada:"verano",
    categoria:"tech",
    foto:"/img/acc-calcetines.jpg",
    precioMarca:0,
    prendas:[
      { tipo:"Pack de calcetines", precio:5.00, link:"https://hipobuy.com/product/weidian/7759834864?inviteCode=YILTEC" },
    ]
  },
];
