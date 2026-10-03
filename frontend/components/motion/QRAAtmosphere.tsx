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

import { observeAhead, observeOnScreen } from "./screen-observer";

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
  // Generated backdrops, made for the position each one sits in: a contour field
  // for the hero, a crowd of overlapping panels for the problem, lines settling
  // into rows for the idea, and one horizon for trust. They are processed to the
  // site's own register — desaturated, darkened, vignetted — so they read as
  // depth rather than as pictures.
  hero: "/images/ai-hero.webp",
  problem: "/images/ai-problem.webp",
  idea: "/images/ai-idea.webp",
  product: "/images/ai-product.webp",
  investor: "/images/ai-investor.webp",
  trust: "/images/ai-trust.webp",
  about: "/images/ai-about.webp",
  waitlist: "/motion/waitlist-poster.webp",
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
  opacity,
  image,
  className = "",
}: {
  variant: AtmosphereVariant;
  /** Opacity multiplier (1 = the calibrated default). */
  intensity?: number;
  /** Explicit opacity, overriding the variant's calibrated value. */
  opacity?: number;
  /** Override the environment image. */
  image?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [armed, setArmed] = useState(false);

  const loop = LOOPS[variant];

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

  // A loop is only *mounted* once its section is within one viewport of the
  // screen, so a loop a page and a half below the fold costs nothing at load.
  useEffect(() => {
    if (!playVideo || armed) return;
    const scope = ref.current;
    if (!scope) return;

    return observeAhead(scope, () => setArmed(true));
  }, [playVideo, armed]);

  // And once mounted, it only runs while its section is visible: two decoders
  // playing behind each other would be a waste of everything. Playback is cheap
  // to pause and resume.
  useEffect(() => {
    const element = videoRef.current;
    if (!element || !armed) return;

    return observeOnScreen(element, (onScreen) => {
      if (onScreen) void element.play().catch(() => {});
      else element.pause();
    });
  }, [armed]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`qra-atmosphere ${className}`}
      data-variant={variant}
      style={
        {
          "--atmosphere-opacity": ((opacity ?? DEFAULT_OPACITY[variant]) * intensity).toFixed(3),
        } as React.CSSProperties
      }
    >
      <div className="qra-atmosphere__drift">
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
            {playVideo && armed && (
              <video
                ref={videoRef}
                className="qra-atmosphere__video"
                poster={loop.poster}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
                tabIndex={-1}
              >
                {/* MP4 first, on the numbers rather than on convention: these
                    loops are encoded by scripts/render-graphics.py and
                    scripts/render-motion.py, and H.264 comes out several times
                    smaller than VP9 in realtime mode (the only mode that fits in
                    this build environment) while being hardware-decoded
                    everywhere. WebM stays as the fallback for anything without
                    H.264. */}
                <source src={loop.mp4} type="video/mp4" />
                <source src={loop.webm} type="video/webm" />
              </video>
            )}
          </>
        ) : (
          /* Plain <img> on purpose: a decorative layer behind content, sized by
             CSS, so there is no layout to shift and nothing for an optimiser to
             do — and the layer needs the raw element. */
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
  hero: 0.62,
  problem: 0.58,
  idea: 0.55,
  product: 0.2,
  investor: 0.4,
  trust: 0.42,
  about: 0.34,
  waitlist: 0.34,
};


export { DEFAULT_OPACITY, IMAGES as ATMOSPHERE_IMAGES, LOOPS as ATMOSPHERE_LOOPS };
