// OutfitScene3D.tsx loads three.js from a CDN at runtime via the import map
// in app/layout.tsx (three, three/addons/...), not from node_modules — that's
// deliberate, so nothing here needs npm/Next's bundler. TypeScript's type
// checker doesn't know about import maps though, and tries to resolve these
// as regular packages during `next build`, which fails with TS2307 since
// they're genuinely not installed. These bare declarations (no body = `any`)
// just satisfy that resolution; the component already treats the three.js
// API as loosely-typed (`any`) for the same reason.
declare module "three";
declare module "three/addons/controls/OrbitControls.js";
declare module "three/addons/loaders/GLTFLoader.js";
declare module "three/addons/loaders/DRACOLoader.js";
