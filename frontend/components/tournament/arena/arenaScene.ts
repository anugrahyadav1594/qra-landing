/**
 * The MTT arena — an original, hand-built Three.js scene.
 *
 * One scene, two modes:
 *   • "intro"    the five-act ENTER THE ARENA startup sequence (~2.8 s).
 *   • "ambient"  the persistent hero ring: slow rotation, drifting particles,
 *                reactive lighting. No timeline, no overlay.
 *
 * Design constraints honoured here:
 *   - core `three` only (no addons, no post-processing, no extra libraries);
 *   - one rAF loop, no React state writes;
 *   - every geometry/material/texture is disposed on teardown;
 *   - pixel ratio capped (1.5 desktop, 1 mobile), rendering pauses when the
 *     canvas is off-screen or the tab is hidden.
 */

import * as THREE from "three";

export type ArenaMode = "intro" | "ambient";

export type ArenaSceneOptions = {
  canvas: HTMLCanvasElement;
  mode?: ArenaMode;
  /** Called every frame with the normalised intro progress (0 → 1). */
  onProgress?: (progress: number) => void;
  /** Called once when the intro finishes (after the ring expansion). */
  onComplete?: () => void;
  durationMs?: number;
  quality?: "high" | "low";
};

export type ArenaHandle = {
  start: () => void;
  setPaused: (paused: boolean) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

const FLARE = 0xf47c35;
const FLARE_LIGHT = 0xffaa70;
const ARENA_DARK = 0x090a0d;

const SEGMENTS = 28;
const PARTICLES = 520;
const CANDLES = 16;

/** Phases of the ENTER THE ARENA sequence (fractions of the total run). */
const PHASE = {
  powerOnEnd: 0.17,
  arenaEnd: 0.4,
  ignitionEnd: 0.63,
  revealEnd: 0.83,
} as const;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const range = (t: number, start: number, end: number) =>
  clamp01((t - start) / (end - start));

function radialGlowTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,170,112,0.85)");
    gradient.addColorStop(0.35, "rgba(244,124,53,0.34)");
    gradient.addColorStop(0.7, "rgba(244,124,53,0.08)");
    gradient.addColorStop(1, "rgba(244,124,53,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createArenaScene(options: ArenaSceneOptions): ArenaHandle {
  const {
    canvas,
    mode = "intro",
    onProgress,
    onComplete,
    durationMs = 2800,
    quality = "high",
  } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality === "high",
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(ARENA_DARK, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.5 : 1));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(ARENA_DARK, 7, 18);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.35, 6.6);
  camera.lookAt(0, 0, 0);

  // ── Lighting ───────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x2a3038, 1.1);
  const keyLight = new THREE.PointLight(FLARE, 26, 16, 2);
  keyLight.position.set(2.6, 2.4, 3.0);
  const rimLight = new THREE.PointLight(FLARE_LIGHT, 14, 18, 2);
  rimLight.position.set(-3.2, -1.4, -2.4);
  const coolLight = new THREE.PointLight(0xb9c2d0, 5, 20, 2);
  coolLight.position.set(0, -2.6, 4);
  scene.add(ambient, keyLight, rimLight, coolLight);

  // ── Arena group (tilted so the ring reads as a floor arena) ────────────
  const arena = new THREE.Group();
  arena.rotation.x = -0.72;
  scene.add(arena);

  // Technical grid floor
  const grid = new THREE.GridHelper(26, 26, FLARE, 0x2a2f3a);
  const gridMaterial = grid.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0;
  grid.position.y = -1.7;
  scene.add(grid);

  // Central glow sprite
  const glowTexture = radialGlowTexture();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 11),
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.position.set(0, 0, -0.6);
  scene.add(glow);

  // The ring: continuous inner rail + segmented outer rail + tick marks.
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: FLARE,
    emissive: FLARE,
    emissiveIntensity: 0.6,
    roughness: 0.35,
    metalness: 0.65,
    transparent: true,
    opacity: 0.95,
  });
  const railGeometry = new THREE.TorusGeometry(2.24, 0.028, 8, 220);
  const rail = new THREE.Mesh(railGeometry, ringMaterial);
  arena.add(rail);

  const segmentMaterials: THREE.MeshStandardMaterial[] = [];
  const segmentMeshes: THREE.Mesh[] = [];
  const segmentGeometry = new THREE.TorusGeometry(
    2.24,
    0.075,
    10,
    14,
    (Math.PI * 2) / SEGMENTS * 0.74,
  );
  for (let index = 0; index < SEGMENTS; index += 1) {
    const material = new THREE.MeshStandardMaterial({
      color: FLARE,
      emissive: FLARE,
      emissiveIntensity: 1.6,
      roughness: 0.28,
      metalness: 0.7,
      transparent: true,
      opacity: 0,
    });
    const segment = new THREE.Mesh(segmentGeometry, material);
    segment.rotation.z = (index / SEGMENTS) * Math.PI * 2;
    segmentMeshes.push(segment);
    segmentMaterials.push(material);
    arena.add(segment);
  }

  // Tick marks around the arena (technical instrumentation feel)
  const tickGeometry = new THREE.BoxGeometry(0.012, 0.16, 0.012);
  const tickMaterial = new THREE.MeshBasicMaterial({
    color: FLARE_LIGHT,
    transparent: true,
    opacity: 0,
  });
  const ticks = new THREE.InstancedMesh(tickGeometry, tickMaterial, 72);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < 72; index += 1) {
    const angle = (index / 72) * Math.PI * 2;
    dummy.position.set(Math.cos(angle) * 2.55, Math.sin(angle) * 2.55, 0);
    dummy.rotation.set(0, 0, angle);
    dummy.updateMatrix();
    ticks.setMatrixAt(index, dummy.matrix);
  }
  arena.add(ticks);

  // ── Particles ─────────────────────────────────────────────────────────
  const particlePositions = new Float32Array(PARTICLES * 3);
  const particleSeeds = new Float32Array(PARTICLES);
  for (let index = 0; index < PARTICLES; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.2 + Math.random() * 2.4;
    particlePositions[index * 3] = Math.cos(angle) * radius;
    particlePositions[index * 3 + 1] = Math.sin(angle) * radius;
    particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 1.6;
    particleSeeds[index] = Math.random();
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: FLARE_LIGHT,
    size: 0.035,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  arena.add(particles);

  // ── Market ignition: candlesticks converging on the ring ───────────────
  const candleGroup = new THREE.Group();
  arena.add(candleGroup);
  const candleMaterial = new THREE.MeshStandardMaterial({
    color: FLARE,
    emissive: FLARE,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0,
    roughness: 0.4,
    metalness: 0.2,
  });
  const candleGeometry = new THREE.BoxGeometry(0.055, 1, 0.055);
  const candles: THREE.Mesh[] = [];
  for (let index = 0; index < CANDLES; index += 1) {
    const candle = new THREE.Mesh(candleGeometry, candleMaterial);
    const angle = (index / CANDLES) * Math.PI * 2;
    const height = 0.22 + Math.random() * 0.55;
    candle.scale.set(1, height, 1);
    candle.userData = { angle, height, radius: 3.4 };
    candles.push(candle);
    candleGroup.add(candle);
  }

  // A jagged market line that draws itself during ignition.
  const linePoints: THREE.Vector3[] = [];
  for (let index = 0; index <= 120; index += 1) {
    const t = index / 120;
    linePoints.push(
      new THREE.Vector3(
        -3.1 + t * 6.2,
        Math.sin(t * 9) * 0.35 + Math.sin(t * 23) * 0.12 - 0.1,
        -0.8,
      ),
    );
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: FLARE_LIGHT,
    transparent: true,
    opacity: 0,
  });
  const marketLine = new THREE.Line(lineGeometry, lineMaterial);
  marketLine.geometry.setDrawRange(0, 0);
  scene.add(marketLine);

  // Horizontal scan light (act 1)
  const scanGeometry = new THREE.PlaneGeometry(0.06, 9);
  const scanMaterial = new THREE.MeshBasicMaterial({
    color: FLARE_LIGHT,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const scan = new THREE.Mesh(scanGeometry, scanMaterial);
  scan.position.z = 1.2;
  scene.add(scan);

  // ── Frame loop ────────────────────────────────────────────────────────
  let rafId = 0;
  let startedAt = 0;
  let last = 0;
  let paused = false;
  let completed = false;
  let disposed = false;

  function applyIntro(progress: number) {
    const powerOn = range(progress, 0, PHASE.powerOnEnd);
    const awaken = range(progress, PHASE.powerOnEnd, PHASE.arenaEnd);
    const ignition = range(progress, PHASE.arenaEnd, PHASE.ignitionEnd);
    const reveal = range(progress, PHASE.ignitionEnd, PHASE.revealEnd);
    const enter = range(progress, PHASE.revealEnd, 1);

    // Act 1 — power on: grid, scan light, central glow ignition.
    gridMaterial.opacity = 0.16 * powerOn;
    scanMaterial.opacity = 0.9 * Math.sin(powerOn * Math.PI);
    scan.position.x = -4.4 + powerOn * 8.8;
    glow.material.opacity = 0.12 + 0.55 * easeOut(powerOn) + 0.25 * reveal;
    glow.scale.setScalar(0.6 + 0.55 * easeOut(powerOn));

    // Act 2 — the arena awakens: segments complete the circle.
    const lit = Math.floor(easeOut(awaken) * SEGMENTS);
    for (let index = 0; index < SEGMENTS; index += 1) {
      const reachable = index <= lit;
      const target = reachable ? 1 : 0;
      const material = segmentMaterials[index];
      material.opacity += (target - material.opacity) * 0.35;
      material.emissiveIntensity = 0.9 + 1.5 * material.opacity;
    }
    const railOpacity = 0.15 + 0.8 * easeOut(awaken);
    (rail.material as THREE.MeshStandardMaterial).opacity = railOpacity;
    tickMaterial.opacity = 0.35 * easeOut(awaken);
    arena.rotation.z = (1 - easeOut(awaken)) * -0.5 + awaken * 0.12;
    arena.rotation.x = -0.72 + (1 - easeOut(awaken)) * 0.5;

    // Act 3 — market ignition: candlesticks and the market line converge.
    candleMaterial.opacity = 0.55 * easeOut(ignition);
    for (let index = 0; index < candles.length; index += 1) {
      const candle = candles[index];
      const data = candle.userData as { angle: number; height: number; radius: number };
      const radius = data.radius - 1.15 * easeOut(ignition);
      candle.position.set(
        Math.cos(data.angle) * radius,
        Math.sin(data.angle) * radius,
        0.1 + Math.sin(index) * 0.3,
      );
      candle.rotation.z = data.angle;
      candle.scale.y = data.height * (0.55 + 0.45 * easeOut(ignition));
    }
    lineMaterial.opacity = 0.5 * easeOut(ignition);
    marketLine.geometry.setDrawRange(0, Math.floor(easeOut(ignition) * linePoints.length));

    // Ambient particles
    particleMaterial.opacity = 0.15 * powerOn + 0.45 * easeOut(awaken) + 0.2 * ignition;

    // Act 5 — enter the arena: the ring expands past the frame.
    if (enter > 0) {
      const push = easeInOut(enter);
      arena.scale.setScalar(1 + push * 13);
      glow.scale.setScalar(1.15 + push * 16);
      glow.material.opacity = Math.max(0, 0.9 - push * 0.55);
      camera.position.z = 6.6 - push * 2.4;
      particleMaterial.opacity = Math.max(0, 0.8 - push * 0.9);
    }
  }

  function applyAmbient(elapsed: number) {
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 0.0009);
    gridMaterial.opacity = 0.14;
    glow.material.opacity = 0.42 + pulse * 0.16;
    glow.scale.setScalar(1.08 + pulse * 0.05);
    for (let index = 0; index < SEGMENTS; index += 1) {
      const material = segmentMaterials[index];
      material.opacity = 0.9;
      material.emissiveIntensity = 1.1 + pulse * 0.7 + Math.sin(elapsed * 0.002 + index) * 0.25;
    }
    (rail.material as THREE.MeshStandardMaterial).opacity = 0.95;
    tickMaterial.opacity = 0.32;
    particleMaterial.opacity = 0.55;
    candleMaterial.opacity = 0.32;
    for (let index = 0; index < candles.length; index += 1) {
      const candle = candles[index];
      const data = candle.userData as { angle: number; height: number; radius: number };
      const radius = data.radius - 1.15 + Math.sin(elapsed * 0.0012 + index) * 0.06;
      candle.position.set(
        Math.cos(data.angle) * radius,
        Math.sin(data.angle) * radius,
        0.1 + Math.sin(index) * 0.3,
      );
      candle.rotation.z = data.angle;
    }
    lineMaterial.opacity = 0.34;
    marketLine.geometry.setDrawRange(0, linePoints.length);
    arena.rotation.z = elapsed * 0.00006;
    arena.rotation.x = -0.72 + Math.sin(elapsed * 0.0004) * 0.04;
    particles.rotation.z = elapsed * 0.00004;
    keyLight.intensity = 22 + pulse * 8;
  }

  function frame(now: number) {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    if (paused) {
      last = now;
      return;
    }
    const delta = Math.min(now - last, 64);
    last = now;
    if (!startedAt) startedAt = now;

    if (mode === "intro") {
      const progress = clamp01((now - startedAt) / durationMs);
      applyIntro(progress);
      onProgress?.(progress);
      if (progress >= 1 && !completed) {
        completed = true;
        onComplete?.();
      }
    } else {
      applyAmbient(now - startedAt);
    }

    particles.rotation.z += delta * 0.000035;
    renderer.render(scene, camera);
  }

  function start() {
    if (rafId) return;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 640 ? 46 : 38;
    camera.updateProjectionMatrix();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(rafId);
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
      else if (material) material.dispose();
    });
    glowTexture.dispose();
    renderer.dispose();
    renderer.forceContextLoss?.();
  }

  return {
    start,
    resize,
    dispose,
    setPaused: (value: boolean) => {
      paused = value;
    },
  };
}
