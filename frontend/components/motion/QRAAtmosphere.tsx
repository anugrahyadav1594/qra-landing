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
  hero: "/images/qra-hero.webp",
  problem: "/images/qra-information-overload.webp",
  idea: "/images/qra-clarity.webp",
  product: "/images/qra-clarity.webp",
  investor: "/motion/investors-mesh.webp",
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
  problem: {
    webm: "/motion/problem-flood.webm",
    mp4: "/motion/problem-flood.mp4",
    poster: "/motion/problem-flood-poster.webp",
  },
  idea: {
    webm: "/motion/idea-flow.webm",
    mp4: "/motion/idea-flow.mp4",
    poster: "/motion/idea-flow-poster.webp",
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
  hero: 0.34,
  problem: 0.42,
  idea: 0.3,
  product: 0.14,
  investor: 0.34,
  trust: 0.16,
  about: 0.24,
  waitlist: 0.3,
};


export { DEFAULT_OPACITY, IMAGES as ATMOSPHERE_IMAGES, LOOPS as ATMOSPHERE_LOOPS };
