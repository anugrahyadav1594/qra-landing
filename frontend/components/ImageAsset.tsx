"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

type ImageAssetProps = {
  /** Path from `IMAGE_ASSETS` — always a local file under /public. */
  src: string;
  /** Describes the visual, for the people who never see it. */
  alt: string;
  /** Sizes (and positions) the frame. The frame reserves the space, so a
   *  missing image can never shift the layout. */
  className?: string;
  /** Extra classes on the image itself (object-position, opacity, blend). */
  imageClassName?: string;
  /** Surface shown when the file is absent — defaults to the dark fallback. */
  fallbackClassName?: string;
  /** Extra detail drawn on top of the fallback surface. */
  fallback?: ReactNode;
  /** Responsive hint passed to next/image. */
  sizes?: string;
  priority?: boolean;
  /** Decorative layers should not be announced twice. */
  decorative?: boolean;
};

/**
 * A local image with a dark, on-brand fallback.
 *
 * The frame is always rendered at its final size and always holds a dark
 * surface, so:
 *   · a missing file shows concept art instead of a broken-image icon,
 *   · nothing shifts when the file appears (or never does),
 *   · the image itself fades in, which doubles as the site's image reveal.
 *
 * Nothing is fetched from a third party and nothing is inlined: the assets are
 * exactly the files placed in `public/images/`. They are already generated and
 * delivered as WebP, so they are served as supplied (`unoptimized`) rather than
 * re-encoded — and a file that has not been placed yet fails fast into the
 * fallback instead of reaching the image optimiser.
 */
export function ImageAsset({
  src,
  alt,
  className = "",
  imageClassName = "",
  fallbackClassName = "",
  fallback,
  sizes = "100vw",
  priority = false,
  decorative = false,
}: ImageAssetProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`overflow-hidden bg-ink-900 ${className}`}>
      {/* The frame itself is always relative; the caller decides where the
          frame sits (absolute band, aspect box, grid cell) without the two
          positioning systems fighting each other. */}
      <div className="relative h-full w-full">
        {/* Concealed fallback surface — always present, always underneath. */}
        <div aria-hidden="true" className={`absolute inset-0 ${fallbackClassName}`}>
          <div className="absolute inset-0 grid-backdrop opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(63,111,255,0.10),transparent_70%)]" />
          {fallback}
        </div>

        {!failed && (
          <Image
            src={src}
            alt={decorative ? "" : alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`object-cover transition-opacity duration-[1100ms] ease-editorial ${
              loaded ? "opacity-100" : "opacity-0"
            } ${imageClassName}`}
          />
        )}

        {/* The description survives the file being absent. */}
        {failed && !decorative && <span className="sr-only">{alt}</span>}
      </div>
    </div>
  );
}
