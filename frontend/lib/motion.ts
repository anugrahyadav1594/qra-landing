/**
 * The motion system.
 *
 * One file decides how this site moves: how long things take, what curve they
 * use, and how much motion the device can afford.
 *
 * It used to also describe the site in GSAP's terms — scene builders, stagger
 * presets, ScrollTrigger configs. Those are gone, along with GSAP itself: every
 * animation on the site is now either a pre-rendered asset (a video, an SVG file
 * with its own animation inside it) or a CSS transition or keyframe on opacity
 * and transform. Both run on the compositor, neither can be scrubbed into
 * stuttering, and the page no longer ships a 70kB animation library to do it.
 *
 * What remains here is the vocabulary the CSS is written against, and the two
 * capability checks every component asks before it decides to move anything.
 */

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** The scale, in milliseconds. These are the numbers in `globals.css`. */
export const MS = {
  fast: 180,
  micro: 250,
  standard: 400,
  smooth: 600,
  cinematic: 900,
  ambient: 4000,
} as const;

/** The house curve: quick to leave, long to settle, never bouncy. */
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Does this device want motion?
 *
 * Safe on the server, in tests, and in any environment without `matchMedia`:
 * the answer is "no motion" only when something explicitly says so, and
 * "assume motion" is never the fallback for an unknown API — components author
 * their finished state and opt into movement, so an unknown answer leaves the
 * page still and readable.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** A coarse pointer means no hover: no cursor, no tilt, no pointer-driven state. */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

/**
 * How much the device can afford, in two tiers.
 *
 * Used to decide whether a pre-rendered loop is mounted at all — a low-tier
 * device gets the poster, which is the same picture, still.
 */
export function deviceTier(): "low" | "high" {
  if (typeof navigator === "undefined") return "high";

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory <= 4) return "low";

  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores <= 4) return "low";

  return "high";
}

/** Scales a count of animated elements down on a low-tier device. */
export function scaleCount(base: number, tier: "low" | "high" = "high"): number {
  return tier === "low" ? Math.max(1, Math.round(base * 0.55)) : base;
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
