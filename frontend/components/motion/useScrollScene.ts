"use client";

/**
 * Scroll scenes.
 *
 * One place registers GSAP + ScrollTrigger, so every section choreographs the
 * same way and the library is loaded once. Scenes are always built inside
 * `gsap.context()`, which means a cleanup reverts every tween and trigger the
 * scene created — important in React, where effects can run twice.
 *
 * Nothing is created when motion is not wanted, and nothing is created on the
 * server, so the reduced-motion path leaves the markup exactly as authored.
 */

import { useEffect, type RefObject } from "react";

import { prefersReducedMotion } from "@/lib/motion";

type SceneBuilder = (context: {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  root: HTMLElement;
}) => void;

/**
 * Builds a scroll-driven scene scoped to `ref`.
 *
 * `reduced` receives a no-op scene by default: the elements are left at their
 * authored state, which is always the readable end state.
 */
export function useScrollScene(
  ref: RefObject<HTMLElement | null>,
  build: SceneBuilder,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // Loaded on demand: GSAP never reaches the initial bundle of a page whose
    // section has not scrolled into view yet.
    void (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          build({ gsap, ScrollTrigger, root });
        }, root);

        cleanup = () => context.revert();
      } catch {
        // The choreography is authored in its finished state, so a failed load
        // (offline, a blocked chunk) leaves a still, fully readable page
        // instead of a half-drawn one — and never an unhandled rejection.
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
