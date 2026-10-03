"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";

import { prefersReducedMotion } from "@/lib/motion";

import { sharedRevealObserver } from "./reveal-observer";

/**
 * The site's one entry motion for blocks.
 *
 * A reveal is a movement from "not yet read" to "read": a short lift, a fade,
 * and — for panels and figures — a clip that opens upward. It runs once, when
 * the element is meaningfully in view, and never replays.
 *
 * Everything is authored visible and only hidden once we know an observer will
 * run, so reduced motion, no JavaScript and a failed observer all leave a fully
 * readable page.
 */

export type RevealVariant = "up" | "fade" | "scale" | "clip" | "line";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "",
  fade: "qra-reveal--fade",
  scale: "qra-reveal--scale",
  clip: "qra-reveal--clip",
  line: "qra-reveal--line",
};

export function QRAReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as = "div",
}: {
  children?: ReactNode;
  className?: string;
  /** Stagger, in ms. Keep to the 40–80ms band. */
  delay?: number;
  variant?: RevealVariant;
  as?: "div" | "li" | "section" | "span" | "p";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const show = () => element.classList.add("is-visible");

    // The shared capability check: safe on the server, in tests, and anywhere
    // matchMedia is unavailable.
    if (prefersReducedMotion()) {
      show();
      return;
    }

    return sharedRevealObserver().observe(element, show);
  }, []);

  return createElement(
    as,
    {
      ref,
      className: `qra-reveal ${VARIANT_CLASS[variant]} ${className}`.trim(),
      style: delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined,
    },
    children,
  );
}
