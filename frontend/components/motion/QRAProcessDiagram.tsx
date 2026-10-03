"use client";

/**
 * THE ROUTE — how information becomes understanding.
 *
 * The diagram is a pre-rendered SVG file (`public/graphics/route.svg`, built by
 * `scripts/render-svgs.py`) shown as an image. Its animation — the route drawing
 * once, and a packet riding it continuously — is CSS *inside that file*, so it
 * runs in the image's own rendering context: no React work, no scroll
 * relationship, no JavaScript on the main thread.
 *
 * This replaced an inline SVG scrubbed by a GSAP timeline that wrote
 * `stroke-dashoffset` on every scroll frame, which repaints the entire graphic
 * per frame. The words live here, in HTML, so they stay selectable and readable
 * to assistive technology; the drawing is only geometry.
 */

import { IDEA } from "@/lib/content";

export function QRAProcessDiagram() {
  return (
    <div className="mt-16">
      <div className="route-frame">
        {/* A plain <img>: the SVG carries its own animation, and there is nothing
            for the page to run. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/graphics/route.svg"
          alt="A route through three stages: sources converging, becoming plain language, and settling into a hierarchy"
          width={900}
          height={210}
          loading="lazy"
          decoding="async"
          className="h-auto w-full"
        />
      </div>

      {/* The three stages, named. One column per station. */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
        {IDEA.steps.map((step, index) => (
          <div key={step.n} className="route-caption">
            <div className="flex items-baseline gap-3">
              <span className="route-caption__n">{step.n}</span>
              <span aria-hidden="true" className="route-caption__rule" />
            </div>
            <p className="route-caption__title">{step.title}</p>
            <p className="route-caption__body">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
