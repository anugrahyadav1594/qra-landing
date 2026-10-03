"use client";

/**
 * QRA ATMOSPHERE — the site's one background system.
 *
 * Two delivery mechanisms, one visual language:
 *
 *   video  — for the two positions that carry continuous motion (the hero and
 *            the closing CTA). A pre-rendered loop costs the main thread
 *            nothing; a canvas field that recalculates every frame costs it on
 *            every scroll.
 *   still  — everywhere else. A desaturated, darkened image under the same
 *            gradient wash is indistinguishable from a very slow animation,
 *            and it is free.
 *
 * Both are wrapped in the same layer stack: image → wash → (the section's own
 * SVG) → content. The environment is always subordinate: held at 14–30%
 * opacity, desaturated, darkened, and desaturated again by the wash.
 *
 * Under reduced motion, when the connection is slow, or when the browser
 * declines to autoplay, the poster is shown instead and nothing moves. The
 * layout is identical either way, so nothing shifts.
 */

import { useEffect, useRef, useState } from "react";

import { deviceTier, prefersReducedMotion } from "@/lib/motion";

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

/**
 * The positions that play a pre-rendered loop, and the poster that stands in
 * for it until (or instead of) playback. Rendered by scripts/render-motion.py.
 */
const LOOPS: Partial<Record<AtmosphereVariant, { webm: string; mp4: string; poster: string }>> = {
  hero: {
    webm: "/motion/hero.webm",
    mp4: "/motion/hero.mp4",
    poster: "/motion/hero-poster.webp",
  },
  waitlist: {
    webm: "/motion/waitlist.webm",
    mp4: "/motion/waitlist.mp4",
    poster: "/motion/waitlist-poster.webp",
  },
};

export function QRAAtmosphere({
  variant,
  intensity = 1,
  speed = 1,
  opacity,
  image,
  className = "",
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
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  const loop = LOOPS[variant];

  // Scroll drift: every variant moves the same way — a small, linear travel
  // tied to its own section — with one parameter changed so the page reads as
  // one environment rather than six effects.
  useScrollScene(ref, ({ gsap }) => {
    const scope = ref.current;
    const drift = driftRef.current;
    if (!scope || !drift) return;

    const recipes: Record<AtmosphereVariant, gsap.TweenVars> = {
      hero: { from: { y: 14 }, to: { y: -32 } },
      problem: { from: { x: 18 }, to: { x: -22 } },
      idea: { from: { scale: 1.04, y: 8 }, to: { scale: 1.0, y: -10 } },
      product: { from: { scale: 1.02 }, to: { scale: 1.05 } },
      investor: { from: { y: -12 }, to: { y: 14 } },
      trust: { from: { y: 8, rotate: -0.2 }, to: { y: -8, rotate: 0.2 } },
      about: { from: { scale: 1.05 }, to: { scale: 1.0 } },
      waitlist: { from: { scale: 1.05, y: 10 }, to: { scale: 1.0, y: -8 } },
    };

    const recipe = recipes[variant];
    gsap.fromTo(
      drift,
      { ...recipe.from, transformOrigin: "50% 50%" },
      {
        ...recipe.to,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      },
    );
  }, [variant]);

  // Playback is a privilege, not an assumption: a desktop-class device, a
  // connection that is not deliberately slow, and motion that has not been
  // turned off. Anything else keeps the poster.
  useEffect(() => {
    if (!loop) return;
    if (prefersReducedMotion()) return;
    if (deviceTier() === "low") return;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return;

    setPlayVideo(true);
  }, [loop]);

  // Only the visible section's loop runs: seven decoders would be a waste of
  // everything. Playback is also cheap to pause and resume.
  useEffect(() => {
    const element = videoRef.current;
    if (!element || !playVideo) return;

    return observeOnScreen(element, (onScreen) => {
      if (onScreen) void element.play().catch(() => {});
      else element.pause();
    });
  }, [playVideo]);

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
        {loop ? (
          <>
            {/* The poster is always present, so there is something to see
                before the loop has decoded, and something that stays if it
                never plays. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={loop.poster}
              alt=""
              width={960}
              height={540}
              loading={variant === "hero" ? "eager" : "lazy"}
              decoding="async"
              className="qra-atmosphere__image"
            />
            {playVideo && (
              <video
                ref={videoRef}
                className="qra-atmosphere__video"
                poster={loop.poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
              >
                <source src={loop.webm} type="video/webm" />
                <source src={loop.mp4} type="video/mp4" />
              </video>
            )}
          </>
        ) : (
          /* Plain <img> on purpose: a decorative layer behind content, sized by
             CSS, so there is no layout to shift and nothing for an optimiser to
             do — and the drift animation needs the raw element. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image ?? IMAGES[variant]}
            alt=""
            loading="lazy"
            decoding="async"
            className="qra-atmosphere__image"
          />
        )}
      </div>

      {/* The wash: a gradient and a vignette that pull the environment into the
          page's own background. */}
      <div className="qra-atmosphere__wash" />
    </div>
  );
}

/** Calibrated so the environment is felt rather than seen. */
const DEFAULT_OPACITY: Record<AtmosphereVariant, number> = {
  hero: 0.34,
  problem: 0.22,
  idea: 0.16,
  product: 0.14,
  investor: 0.2,
  trust: 0.16,
  about: 0.24,
  waitlist: 0.3,
};

/** One breathing cycle per variant, in seconds — used by the still layers. */
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

export { DEFAULT_OPACITY, IMAGES as ATMOSPHERE_IMAGES, AMBIENT_SECONDS, LOOPS as ATMOSPHERE_LOOPS };
