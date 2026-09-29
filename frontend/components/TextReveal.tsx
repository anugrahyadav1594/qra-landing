"use client";

import { createElement, useEffect, useRef, type ElementType } from "react";

/**
 * Word-by-word typographic reveal.
 *
 * Each word sits in a clip, so the text resolves out of the line instead of
 * fading in from somewhere. Motion is by transform only.
 *
 * Safety: the visible state is the default in the stylesheet and the hidden
 * state is driven by a guard animation with a hard end, so the words appear
 * even if the observer never fires — a reveal can never leave a headline
 * permanently blank.
 */
export function TextReveal({
  text,
  as = "span",
  className = "",
  step = 90,
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Stagger between words, in ms. */
  step?: number;
  /** Base delay, in ms. */
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const show = () => element.classList.add("is-visible");

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
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  return createElement(
    as,
    { ref, className: `word-reveal-group ${className}`.trim() },
    words.map((word, index) => (
      <span key={`${word}-${index}`}>
        <span className="word-reveal">
          <span
            className="word-reveal__inner"
            style={{ "--wd": `${delay + index * step}ms` } as React.CSSProperties}
          >
            {word}
          </span>
        </span>
        {index < words.length - 1 ? " " : null}
      </span>
    )),
  );
}
