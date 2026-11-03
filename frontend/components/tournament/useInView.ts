"use client";

import { useEffect, useRef, useState } from "react";

/** One-shot viewport detection used to trigger count-ups and reveals. */
export function useInView<T extends HTMLElement>(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(element);
          }
        }
      },
      { threshold: options?.threshold ?? 0.2, rootMargin: options?.rootMargin ?? "0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, inView };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
