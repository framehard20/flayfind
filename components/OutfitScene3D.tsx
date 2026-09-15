"use client";

import { useEffect, useRef } from "react";

// Real three.js scene (not <model-viewer>) — this is the one thing model-viewer
// genuinely can't do: multiple pieces, each spinning at its own independent
// speed, sharing one camera/frame. Loaded via CDN ES module imports (jsdelivr)
// instead of an npm package, same reasoning as the rest of this project's 3D
// work — nothing for Next's bundler to process, nothing to break the build.
// The dynamic import() targets are built from a template string specifically
// so bundlers can't statically analyze/bundle them; they stay genuine runtime
// fetches handled by the browser's own module loader.
//
// Layout (shirt top, pants middle, shoe pair bottom) uses the same real-world
// scale numbers verified earlier by actually rendering this composition in
// Python (trimesh) — pants ~98cm, shirt ~74cm, shoe ~16cm — but positions the
// ORIGINAL untouched high-quality files live via transforms, no decimation or
// mesh-merging involved at all.
const THREE_VERSION = "0.160.0";
const BASE = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}`;
const DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

const SHOE_CM = 16;
const PANTS_CM = 98;
const SHIRT_CM = 74;
const PANTS_Y = 17;
const SHIRT_Y = 94;

export function OutfitScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let renderer: any;
    let raf = 0;
    let resizeObserver: ResizeObserver | null = null;
    let controls: any;

    async function init() {
      try {
        const [THREE, { OrbitControls }, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
          import(/* webpackIgnore: true */ `${BASE}/build/three.module.js`),
          import(/* webpackIgnore: true */ `${BASE}/examples/jsm/controls/OrbitControls.js`),
          import(/* webpackIgnore: true */ `${BASE}/examples/jsm/loaders/GLTFLoader.js`),
          import(/* webpackIgnore: true */ `${BASE}/examples/jsm/loaders/DRACOLoader.js`),
        ]);

        if (disposed || !container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 1, 5000);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        container.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x555566, 1.15));
        const key = new THREE.DirectionalLight(0xffffff, 1.5);
        key.position.set(60, 220, 140);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.55);
        fill.position.set(-90, 60, -70);
        scene.add(fill);

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        function loadModel(url: string): Promise<any> {
          return new Promise((resolve, reject) => {
            loader.load(url, (gltf: any) => resolve(gltf.scene), undefined, reject);
          });
        }

        const [shirtScene, pantsScene, shoeL, shoeR] = await Promise.all([
          loadModel("/models/shirt.glb"),
          loadModel("/models/pants.glb"),
          loadModel("/models/sneaker.glb"),
          loadModel("/models/sneaker.glb"),
        ]);

        if (disposed || !container) return;

        function sizeOf(obj: any) {
          const size = new THREE.Vector3();
          new THREE.Box3().setFromObject(obj).getSize(size);
          return size;
        }

        const shirtSize = sizeOf(shirtScene);
        const pantsSize = sizeOf(pantsScene);
        const shoeSize = sizeOf(shoeL);

        const shirtScale = SHIRT_CM / shirtSize.y;
        const pantsScale = PANTS_CM / pantsSize.y;
        const shoeScale = SHOE_CM / shoeSize.y;
        const shoeOffsetX = shoeSize.x * shoeScale * 0.55;

        const group = new THREE.Group();

        shirtScene.scale.setScalar(shirtScale);
        shirtScene.position.set(0, SHIRT_Y, 0);
        group.add(shirtScene);

        pantsScene.scale.setScalar(pantsScale);
        pantsScene.position.set(0, PANTS_Y, 0);
        group.add(pantsScene);

        shoeL.scale.setScalar(shoeScale);
        shoeL.position.set(-shoeOffsetX, 0, 0);
        group.add(shoeL);

        // mirrored pair via negative X scale, not a second export
        shoeR.scale.set(-shoeScale, shoeScale, shoeScale);
        shoeR.position.set(shoeOffsetX, 0, 0);
        group.add(shoeR);

        scene.add(group);

        const box = new THREE.Box3().setFromObject(group);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const maxDim = Math.max(size.x, size.y);
        const fitDistance = maxDim * 0.62 / Math.tan((camera.fov * Math.PI) / 360);

        camera.position.set(center.x, center.y, center.z + fitDistance);
        camera.near = fitDistance / 100;
        camera.far = fitDistance * 10;
        camera.updateProjectionMatrix();

        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(center);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = fitDistance * 0.45;
        controls.maxDistance = fitDistance * 2.2;
        controls.update();

        function resize() {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (!w || !h) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        // independent per-piece spin — the whole reason this is real three.js
        // and not <model-viewer>
        const speeds = { shirt: 0.24, pants: -0.17, shoeL: 0.32, shoeR: -0.32 };
        const clock = new THREE.Clock();

        function animate() {
          if (disposed) return;
          const dt = Math.min(clock.getDelta(), 0.05);
          shirtScene.rotation.y += speeds.shirt * dt;
          pantsScene.rotation.y += speeds.pants * dt;
          shoeL.rotation.y += speeds.shoeL * dt;
          shoeR.rotation.y += speeds.shoeR * dt;
          controls.update();
          renderer.render(scene, camera);
          raf = requestAnimationFrame(animate);
        }
        animate();
      } catch (err) {
        console.error("OutfitScene3D failed to load:", err);
      }
    }

    init();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      controls?.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.remove();
      }
    };
  }, []);

  return <div ref={containerRef} className="outfit3d-square" />;
}
