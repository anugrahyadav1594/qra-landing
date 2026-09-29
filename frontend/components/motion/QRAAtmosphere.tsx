"use client";

/**
 * QRA ATMOSPHERE — the site's one background system.
 *
 * Every section's atmosphere is this component, so no section invents its own
 * decoration. It layers, in order:
 *
 *   the environment image   (abstract, desaturated, heavily darkened)
 *   a dark wash             (gradient + vignette that dissolve its edges)
 *   ambient drift           (a slow breathing movement, always running)
 *   scroll drift            (a few percent of travel, tied to the section)
 *   the data field          (drawn over it by the section, not here)
 *   content                 (always on top, always the brightest thing)
 *
 * The image is never the subject — it is the room the content sits in. It is
 * held between 14% and 30% opacity, desaturated, and blended into the section's
 * own background so nobody reads it as an illustration.
 *
 * Motion rules: transform and opacity only, one scroll scene per section, no
 * work while off screen, and nothing at all under reduced motion or on a device
 * that cannot afford it.
 */

import { useEffect, useRef } from "react";

import { deviceTier, EASE, MS, prefersReducedMotion } from "@/lib/motion";

import { observeOnScreen } from "./screen-observer";
import { useScrollScene } from "./useScrollScene";

export type AtmosphereVariant =
  | "hero"
  | "problem"
  | "idea"
  | "product"
  | "investor"
  | "trust"
  | "about"
  | "waitlist";

/**
 * The environment images. Deliberately few and deliberately quiet: abstract
 * financial/data environments — no people as the subject, no AI iconography.
 */
const IMAGES: Record<AtmosphereVariant, string> = {
  hero: "/images/qra-hero.webp",
  problem: "/images/qra-information-overload.webp",
  idea: "/images/qra-clarity.webp",
  product: "/images/qra-clarity.webp",
  investor: "/images/qra-investor.webp",
  trust: "/images/qra-trust.webp",
  about: "/images/qra-about.webp",
  waitlist: "/images/qra-clarity.webp",
};

export function QRAAtmosphere({
  variant,
  intensity = 1,
  speed = 1,
  opacity,
  image,
  interactive = false,
  className = "",
  children,
}: {
  variant: AtmosphereVariant;
  /** Opacity and drift multiplier (1 = the calibrated default). */
  intensity?: number;
  /** Ambient speed multiplier (1 = the calibrated default). */
  speed?: number;
  /** Explicit opacity, overriding the variant's calibrated value. */
  opacity?: number;
  /** Override the environment image. */
  image?: string;
  /** Follow the pointer by a few pixels (desktop, fine pointers only). */
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);

  // Scroll drift: every variant moves the same way — a small, linear travel
  // tied to its own section — with one parameter changed so the page reads as
  // one environment rather than six effects.
  useScrollScene(ref, ({ gsap }) => {
    const scope = ref.current;
    const drift = driftRef.current;
    if (!scope || !drift) return;

    const recipes: Record<AtmosphereVariant, gsap.TweenVars> = {
      // The hero's environment keeps rising gently as the page begins.
      hero: { from: { y: 18 }, to: { y: -46 } },
      // The problem's environment drifts sideways, like a pile being pushed.
      problem: { from: { x: 26 }, to: { x: -30 } },
      // The idea's environment settles inward as the fragments organise.
      idea: { from: { scale: 1.05, y: 10 }, to: { scale: 1.0, y: -12 } },
      product: { from: { scale: 1.02 }, to: { scale: 1.06 } },
      investor: { from: { y: -14 }, to: { y: 16 } },
      // Trust barely moves — the page is becoming calmer.
      trust: { from: { y: 10, rotate: -0.25 }, to: { y: -10, rotate: 0.25 } },
      // About: structure revealing itself as the architecture is explained.
      about: { from: { scale: 1.06, opacity: 0.55 }, to: { scale: 1.0, opacity: 1 } },
      // Waitlist: everything drawing toward one point.
      waitlist: { from: { scale: 1.07, y: 12 }, to: { scale: 1.0, y: -10 } },
    };

    const recipe = recipes[variant];
    gsap.fromTo(
      drift,
      { ...recipe.from, transformOrigin: "50% 50%" },
      {
        ...recipe.to,
        ease: EASE.none,
        scrollTrigger: {
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      },
    );
  }, [variant]);

  // Continuous motion only while visible. The attribute is only ever written to
  // stop the breathing, so a page without JavaScript keeps a still image rather
  // than an invisible one.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return observeOnScreen(element, (onScreen) => {
      element.dataset.onscreen = onScreen ? "true" : "false";
    });
  }, []);

  // Pointer response: a couple of pixels, written straight to the element.
  useEffect(() => {
    if (!interactive || prefersReducedMotion() || deviceTier() === "low") return;
    const element = ref.current;
    if (!element || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const x = (event.clientX / window.innerWidth - 0.5) * -8;
        const y = (event.clientY / window.innerHeight - 0.5) * -6;
        element.style.setProperty("--atmosphere-px", `${x.toFixed(2)}px`);
        element.style.setProperty("--atmosphere-py", `${y.toFixed(2)}px`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [interactive]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`qra-atmosphere ${className}`}
      data-variant={variant}
      style={
        {
          "--atmosphere-opacity": ((opacity ?? DEFAULT_OPACITY[variant]) * intensity).toFixed(3),
          "--atmosphere-speed": `${(AMBIENT_SECONDS[variant] / Math.max(0.4, speed)).toFixed(1)}s`,
        } as React.CSSProperties
      }
    >
      <div ref={driftRef} className="qra-atmosphere__drift">
        {/* Plain <img> on purpose: this is a decorative layer behind content,
            sized by CSS, so there is no layout to shift and nothing to gain
            from an optimiser — and the drift animation needs the raw element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image ?? IMAGES[variant]}
          alt=""
          /* Above the fold the environment is part of the first paint; below it
             can wait until the section is nearly in view. */
          loading={variant === "hero" ? "eager" : "lazy"}
          decoding="async"
          className="qra-atmosphere__image"
        />
      </div>
      {/* The wash: a gradient and a vignette that pull the image into the page. */}
      <div className="qra-atmosphere__wash" />
      {children}
    </div>
  );
}

/** Calibrated so the environment is felt rather than seen. */
const DEFAULT_OPACITY: Record<AtmosphereVariant, number> = {
  hero: 0.3,
  problem: 0.22,
  idea: 0.16,
  product: 0.14,
  investor: 0.2,
  trust: 0.16,
  about: 0.24,
  waitlist: 0.18,
};

/** One breathing cycle per variant, in seconds — never faster than ~18s. */
const AMBIENT_SECONDS: Record<AtmosphereVariant, number> = {
  hero: 26,
  problem: 22,
  idea: 24,
  product: 28,
  investor: 24,
  trust: 30,
  about: 26,
  waitlist: 22,
};

export { DEFAULT_OPACITY, IMAGES as ATMOSPHERE_IMAGES, AMBIENT_SECONDS, MS as ATMOSPHERE_MS };
