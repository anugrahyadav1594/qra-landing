"use client";

/**
 * THE ROUTE — how information becomes understanding.
 *
 * One continuous SVG, and the only thing that moves inside it is a single
 * travelling packet: the route is drawn by the scroll, the packet rides it, and
 * at each station the geometry that belongs to that station resolves.
 *
 * The geometry is authored as a *plan*: the full route and all three stations
 * are drawn faintly from the start, so the diagram is legible before any
 * animation runs, under reduced motion, and with JavaScript switched off. The
 * scroll only adds emphasis — the route fills in, the stations come up to full
 * strength, and the packet advances. Nothing is ever hidden behind motion.
 *
 * Stations alternate above and below the line, and the packet's vertical
 * position follows the route, so the eye is led left to right and then released
 * into the two columns beneath each station.
 */

import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion";
import { IDEA } from "@/lib/content";

import { useScrollScene } from "./useScrollScene";

/** The thread, with a shallow lift at each station so the packet has a shape. */
const THREAD = "M -20 100 C 70 100 90 92 150 92 S 250 100 300 100 C 380 100 400 108 450 108 S 550 100 600 100 C 680 100 700 86 750 86 S 850 100 920 100";

/** Where the packet rides, sampled from the same curve as the thread. */
const STATIONS = [
  { key: "find", label: IDEA.steps[0].title, caption: IDEA.steps[0].body, x: 150, y: 92 },
  { key: "explain", label: IDEA.steps[1].title, caption: IDEA.steps[1].body, x: 450, y: 108 },
  { key: "understand", label: IDEA.steps[2].title, caption: IDEA.steps[2].body, x: 750, y: 86 },
];

export function QRAProcessDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) setStill(true);
  }, []);

  useScrollScene(ref, ({ gsap }) => {
    const scope = ref.current;
    if (!scope) return;

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scope,
        start: "top 82%",
        end: "bottom 52%",
        scrub: 0.7,
      },
    });

    // The route draws. Nothing else moves.
    timeline.fromTo(
      "[data-route]",
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 3 },
      0,
    );

    // The packet advances along it, station by station.
    timeline.fromTo(
      "[data-packet]",
      { x: 150, y: 92, opacity: 0, duration: 0.2 },
      { x: 750, y: 86, opacity: 1, duration: 2.6 },
      0.2,
    );

    // Each station's geometry comes up as the packet reaches it.
    STATIONS.forEach((station, index) => {
      const at = 0.25 + index * 0.95;
      timeline.to(`[data-station='${station.key}'] [data-geometry]`, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
      }, at);
      timeline.to(`[data-station='${station.key}'] [data-ring]`, {
        opacity: 1,
        scale: 1,
        transformOrigin: "center",
        duration: 0.4,
      }, at);
    });

    // The three captions arrive with their stations.
    timeline.from("[data-caption]", { opacity: 0, y: 14, duration: 0.6, stagger: 0.5 }, 0.5);
  });

  return (
    <div ref={ref} className="mt-16" data-still={still ? "true" : "false"}>
      <div className="route-frame">
        <svg
          viewBox="0 0 900 210"
          className="qra-route h-auto w-full"
          role="img"
          preserveAspectRatio="xMidYMid meet"
          aria-label="A route through three stages: find the information, explain it in plain language, understand what it means"
        >
          {/* ── the plan: the whole route, faintly, from the start ── */}
          <path d={THREAD} pathLength={1} className="qra-route__plan" />
          <path data-route pathLength={1} d={THREAD} className="qra-route__route" />

          {/* The packet: the one moving object on the page. */}
          <g data-packet className="qra-route__packet">
            <circle r="9" className="qra-route__packet-halo" />
            <circle r="3.2" className="qra-route__packet-dot" />
          </g>

          {STATIONS.map((station, index) => (
            <g
              key={station.key}
              data-station={station.key}
              className="qra-route__station"
              data-tone={index === 1 ? "low" : "high"}
            >
              {/* The marker on the line. */}
              <circle data-ring cx={station.x} cy={station.y} r="13" className="qra-route__ring" />
              <circle cx={station.x} cy={station.y} r="3.4" className="qra-route__node" />

              {/* The stem, down to the caption. */}
              <line
                data-geometry
                x1={station.x}
                y1={station.y + (station.y > 100 ? 13 : -13)}
                x2={station.x}
                y2={station.y > 100 ? 168 : 34}
                className="qra-route__stem"
              />

              {/* Station geometry: what that stage actually does. */}
              {index === 0 ? (
                /* Sources, converging. */
                <g data-geometry>
                  {[
                    [64, 26], [96, 44], [58, 58], [104, 20], [80, 66],
                  ].map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="1.9" className="qra-route__speck" />
                      <line x1={x} y1={y} x2={station.x} y2={station.y} className="qra-route__ray" />
                    </g>
                  ))}
                </g>
              ) : index === 1 ? (
                /* Plain language, as ruled lines of text. */
                <g data-geometry>
                  {[
                    [378, 126, 144, 7],
                    [378, 144, 106, 5],
                    [378, 158, 128, 5],
                  ].map(([x, y, w, h], i) => (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx="1.5"
                      className={i === 0 ? "qra-route__words qra-route__words--lead" : "qra-route__words"}
                    />
                  ))}
                </g>
              ) : (
                /* A hierarchy, settling. */
                <g data-geometry>
                  {[
                    [688, 22, 148, 6],
                    [688, 38, 104, 4],
                    [712, 54, 124, 4],
                    [728, 68, 88, 4],
                  ].map(([x, y, w, h], i) => (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx="1.5"
                      className={i === 0 ? "qra-route__words qra-route__words--lead" : "qra-route__words"}
                    />
                  ))}
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* The three stages, named. One column per station, aligned to it. */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
        {STATIONS.map((station, index) => (
          <div key={station.key} data-caption className="route-caption">
            <div className="flex items-baseline gap-3">
              <span className="route-caption__n">{String(index + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="route-caption__rule" />
            </div>
            <p className="route-caption__title">{station.label}</p>
            <p className="route-caption__body">{station.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
