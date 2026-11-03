"use client";

/**
 * GSAP registration helper for the tournament.
 *
 * GSAP is the single animation system for the prize pool and the command
 * bar — no second framework, nothing initialised during server rendering.
 * ScrollTrigger is registered once per client session; components create
 * their timelines inside a `gsap.context()` and revert it on unmount so no
 * tween or trigger ever survives its component.
 */

import { useEffect, useLayoutEffect } from "react";

let registered = false;

export async function loadGsap() {
  if (typeof window === "undefined") return null;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/** useLayoutEffect on the client, useEffect on the server (no SSR warning). */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
