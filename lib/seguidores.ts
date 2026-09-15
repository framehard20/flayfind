import type { Prenda } from "./outfits";

export type Seguidor = {
  posicion: number;
  autor: string;
  instagram: string;
  nombre: string;
  foto: string;
  prendas: Prenda[];
};

// Weekly contest ranking — edit by hand each week, same shape as OUTFITS entries.
// posicion = rank (1 = best). Leave foto:"" until you have the photo.
// To empty the board: export const SEGUIDORES: Seguidor[] = [];
export const SEGUIDORES: Seguidor[] = [
  { posicion:1, autor:"@mariosanczz", instagram:"@mariosanczz", nombre:"Total black hoodie", foto:"/img/essentials-black.jpg", prendas:[
      { tipo:"Sudadera con capucha", precio:20.00, link:"https://hipobuy.com/product/weidian/7756761221?inviteCode=YILTEC" },
      { tipo:"Jogger cargo", precio:3.00, link:"https://hipobuy.com/product/weidian/7847678240?inviteCode=YILTEC" },
      { tipo:"Sneakers negras", precio:35.00, link:"https://hipobuy.com/product/weidian/7847664430?inviteCode=YILTEC" },
  ]},
  { posicion:2, autor:"@mariofits.czz", instagram:"@mariofits.czz", nombre:"Rosa preppy", foto:"/img/rosa-preppy.jpg", prendas:[
      { tipo:"Jersey trenzado rosa", precio:18.00, link:"https://hipobuy.com/product/weidian/7758828681?inviteCode=YILTEC" },
      { tipo:"Cargo negro", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers rosas", precio:28.00, link:"https://hipobuy.com/product/weidian/7759787484?inviteCode=YILTEC" },
  ]},
  { posicion:3, autor:"@mariosanczz", instagram:"@mariosanczz", nombre:"Total black baggy", foto:"/img/total-black-baggy.jpg", prendas:[
      { tipo:"Sudadera con cremallera", precio:20.00, link:"https://hipobuy.com/product/weidian/7755073801?inviteCode=YILTEC" },
      { tipo:"Jeans anchos negros", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers negras", precio:30.00, link:"https://hipobuy.com/product/weidian/7761797152?inviteCode=YILTEC" },
  ]},
  { posicion:4, autor:"@mariofits.czz", instagram:"@mariofits.czz", nombre:"Celeste clean", foto:"/img/celeste-clean.jpg", prendas:[
      { tipo:"Jersey liso celeste", precio:15.00, link:"https://hipobuy.com/product/weidian/7847727266?inviteCode=YILTEC" },
      { tipo:"Jeans negros", precio:10.00, link:"https://hipobuy.com/product/weidian/7844697549?inviteCode=YILTEC" },
      { tipo:"Sneakers", precio:38.00, link:"https://hipobuy.com/goods/details?id=7809302092&channel=WEIDIAN&inviteCode=YILTEC" },
  ]},
];
