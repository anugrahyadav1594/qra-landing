"use client";

import { createElement, useEffect, useRef, type ElementType } from "react";

import { prefersReducedMotion } from "@/lib/motion";

import { sharedRevealObserver } from "./reveal-observer";

/**
 * Word-by-word typographic reveal.
 *
 * Each word sits in a clip, so the text resolves out of the line instead of
 * fading in from somewhere. Words appear in reading order — never at random,
 * never flying in from different directions — with a stagger inside the 40–80ms
 * band, which reads as one statement arriving rather than a gimmick.
 *
 * Safety: the visible state is the default in the stylesheet and the hidden
 * state is driven by a guard animation with a hard end, so the words appear
 * even if the observer never fires — a reveal can never leave a headline blank.
 */
export function TextReveal({
  text,
  as = "span",
  className = "",
  step = 60,
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Stagger between words, in ms (40–80 is the house range). */
  step?: number;
  /** Base delay, in ms. */
  delay?: number;
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
