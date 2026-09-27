"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";

type Variant = "up" | "fade" | "scale";

const VARIANT_CLASS: Record<Variant, string> = {
  up: "",
  fade: "reveal--fade",
  scale: "reveal--scale",
};

/** IntersectionObserver reveal: the site's standard section entry motion.
 * One reveal per block, optional stagger delay, and reduced-motion or
 * no-observer environments get the visible state immediately. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.classList.add("is-visible");

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.unobserve(el);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -70px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className: `reveal ${VARIANT_CLASS[variant]} ${className}`.trim(),
      style: delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined,
    },
    children,
  );
}
