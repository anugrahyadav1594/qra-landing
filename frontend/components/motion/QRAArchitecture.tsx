"use client";

/**
 * THE QRA ARCHITECTURE — an SVG that draws itself.
 *
 * Sixteen hundred canvas nodes used to simulate this continuously. The graphic
 * is in fact a structure: spines, beams, nodes and one pathway through them,
 * and a structure is best described once, as geometry.
 *
 * Only `stroke-dashoffset` and opacity are animated, both on the compositor, and
 * only while the drawing is on screen. Under reduced motion it is simply a
 * finished architectural drawing — which is what it is for.
 */

import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion";

/** Six vertical spines, and the beams that cross them. */
const SPINES = [70, 200, 330, 460, 590, 720];
const BEAMS = [90, 170, 250, 330, 410];
const NODES: Array<[number, number]> = [
  [70, 90], [200, 170], [330, 250], [460, 170], [590, 330], [720, 250],
  [200, 410], [460, 410], [330, 90], [590, 90],
];

/** The pathway: information entering, being organised, arriving. */
const PATHWAY = "M20 250 L70 250 L70 90 L330 90 L330 250 L460 250 L460 410 L720 410 L720 250 L780 250";

export function QRAArchitecture({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // The drawing is static under reduced motion; the CSS simply shows it.
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setReady(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 800 500"
      className={`qra-architecture ${className}`}
      data-ready={ready ? "true" : "false"}
      role="img"
      aria-label="The Quantrelic architecture: information moving through structure"
      preserveAspectRatio="xMidYMid slice"
    >
      <g className="qra-architecture__spines">
        {SPINES.map((x, index) => (
          <line
            key={x}
            x1={x}
            y1="20"
            x2={x}
            y2="480"
            style={{ "--i": index, "--len": 460 } as React.CSSProperties}
          />
        ))}
      </g>

      <g className="qra-architecture__beams">
        {BEAMS.map((y, index) => (
          <line
            key={y}
            x1="40"
            y1={y}
            x2="760"
            y2={y}
            style={{ "--i": index + 4, "--len": 720 } as React.CSSProperties}
          />
        ))}
      </g>

      <path
        className="qra-architecture__pathway"
        d={PATHWAY}
        style={{ "--i": 9, "--len": 2100 } as React.CSSProperties}
      />

      <g className="qra-architecture__nodes">
        {NODES.map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="3"
            style={{ "--i": index } as React.CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}
