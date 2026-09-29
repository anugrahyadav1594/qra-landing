/**
 * The motion system.
 *
 * One file decides everything about how this site moves: how long things take,
 * what curve they use, how much motion the device can afford, and the named
 * definitions every scene is built from. Sections do not invent their own
 * timing — they compose from this vocabulary, which is what makes the whole
 * page feel like it was choreographed by one hand.
 *
 * The house curve is `cubic-bezier(0.22, 1, 0.36, 1)` (in CSS) and its GSAP
 * equivalent `expo.out` (in JS): quick to leave, long to settle, never bouncy.
 */

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Durations in seconds, for GSAP. The names describe intent, not length, so a
 * section can ask for "cinematic" without inventing a number.
 */
export const TIMING = {
  fast: 0.18,
  micro: 0.25,
  standard: 0.4,
  smooth: 0.6,
  cinematic: 0.9,
  ambient: 4,
} as const;

/** The same scale in milliseconds, for CSS transitions and delays. */
export const MS = {
  fast: 180,
  micro: 250,
  standard: 400,
  smooth: 600,
  cinematic: 900,
  ambient: 4000,
} as const;

export const EASE = {
  /** The house curve, verbatim — the same curve the CSS tokens use. */
  css: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** GSAP's nearest equivalent, for major reveals. */
  out: "expo.out",
  /** A shorter settle for small, frequent movements. */
  soft: "power2.out",
  /** Symmetrical, for things that travel and return. */
  inOut: "power2.inOut",
  /** Scroll-scrubbed motion must be linear: the scrollbar is the clock. */
  none: "none",
} as const;

type Vars = Record<string, unknown>;

/**
 * The shared vocabulary of movements. Every scroll scene is built by picking
 * from these, so nothing on the site moves in a way nothing else does.
 */
export const MOTION = {
  /** Content arrives: a short lift and a fade. The default for anything new. */
  fadeUp: (vars: Vars = {}): Vars => ({
    opacity: 0,
    y: 18,
    duration: TIMING.smooth,
    ease: EASE.out,
    ...vars,
  }),

  /** A block wipes upward out of its own line — used for panels and figures. */
  reveal: (vars: Vars = {}): Vars => ({
    opacity: 0,
    clipPath: "inset(0 0 12% 0)",
    y: 14,
    duration: TIMING.cinematic,
    ease: EASE.out,
    ...vars,
  }),

  /** Something small resolving into place. Never larger than 3%. */
  scaleReveal: (vars: Vars = {}): Vars => ({
    opacity: 0,
    scale: 0.97,
    duration: TIMING.smooth,
    ease: EASE.out,
    ...vars,
  }),

  /** A line being drawn, always from its own left edge. */
  lineDraw: (vars: Vars = {}): Vars => ({
    scaleX: 0,
    transformOrigin: "left center",
    duration: TIMING.cinematic,
    ease: EASE.inOut,
    ...vars,
  }),

  /** Atmosphere: a few percent of travel across a whole section. */
  imageDrift: (vars: Vars = {}): Vars => ({
    ease: EASE.none,
    ...vars,
  }),

  /** Reading order: each item follows the previous one at a small interval. */
  staggerReveal: (each = 0.06, vars: Vars = {}): Vars => ({
    opacity: 0,
    y: 14,
    duration: TIMING.smooth,
    ease: EASE.out,
    stagger: { each, from: "start" },
    ...vars,
  }),
} as const;

/**
 * The scroll window a scene runs in. Sections share these defaults so the page
 * has one rhythm: a scene begins once its subject is comfortably in view and is
 * already resolved before the section leaves.
 */
export function sceneTrigger(
  trigger: Element,
  overrides: { start?: string; end?: string; scrub?: number | boolean } = {},
) {
  return {
    trigger,
    start: "top 78%",
    end: "bottom 45%",
    scrub: 0.5,
    ...overrides,
  };
}

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
