/**
 * Motion tokens and capability checks.
 *
 * One place decides how much motion the device can afford, so every animated
 * component answers the same questions the same way: is motion wanted, is this
 * a touch device, and how much work can this screen handle.
 */

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Durations (seconds) — kept short. Nothing on this site should make anyone wait. */
export const DURATION = {
  micro: 0.18,
  fast: 0.32,
  base: 0.55,
  slow: 0.9,
  scene: 1.4,
} as const;

export const EASE = {
  /** The house curve: quick out, long settle. */
  out: "power3.out",
  inOut: "power2.inOut",
  none: "none",
} as const;

/** Safe on the server and in tests, where `window` may not exist. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia === "function" && window.matchMedia("(hover: none)").matches) {
    return true;
  }
  return navigator.maxTouchPoints > 0;
}

/**
 * Rough capability tier. Deliberately conservative: a small viewport means a
 * small GPU, and the visualisations halve their work rather than dropping
 * frames. Not a user-agent sniff — it adapts to the screen it is drawn on.
 */
export function deviceTier(): "low" | "high" {
  if (typeof window === "undefined") return "high";
  const small = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return small || cores <= 4 || memory <= 4 ? "low" : "high";
}

/** Scale a particle/line budget down on weaker or smaller devices. */
export function scaleCount(base: number, tier: "low" | "high" = "high"): number {
  const factor = tier === "low" ? 0.45 : 1;
  return Math.max(6, Math.round(base * factor));
}

/** Deterministic pseudo-random source, so a field looks the same every load. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Frame-rate independent easing toward a target. */
export function damp(current: number, target: number, smoothing: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-smoothing * delta));
}
