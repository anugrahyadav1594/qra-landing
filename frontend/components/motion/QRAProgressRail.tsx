"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { HOME_SECTIONS, SECTION_LABELS } from "@/lib/constants";
import { isTouchDevice } from "@/lib/motion";

/**
 * THE LEVEL MAP.
 *
 * A fixed instrument on the right edge: the page's sections as nodes on a
 * track, the track filling as you descend, and a percentage that ticks. It
 * exists because a long scroll gives no feedback — you cannot tell how much is
 * left, so there is no sense of progress, and progress is the cheapest dopamine
 * there is. This turns reading the page into descending a level map.
 *
 * Cost discipline, because this runs on every scroll frame:
 *  - one rAF-throttled listener, shared with nothing else on the page;
 *  - section offsets are cached and only re-measured when the document's height
 *    actually changes, so the scroll handler never forces a layout;
 *  - every write is a CSS custom property or a `data-` attribute, so the
 *    movement stays on the compositor and React never re-renders;
 *  - it is not mounted at all on short pages, on touch, or for reduced motion.
 */
export function QRAProgressRail() {
  const pathname = usePathname();
  const railRef = useRef<HTMLElement>(null);
  const nodesRef = useRef<Array<HTMLAnchorElement | null>>([]);

  const enabled = pathname === "/" && !isTouchDevice();

  useEffect(() => {
    if (!enabled) return;
    const rail = railRef.current;
    if (!rail) return;

    const fill = rail.querySelector<HTMLElement>("[data-rail-fill]");
    const readout = rail.querySelector<HTMLElement>("[data-rail-readout]");
    const sections = HOME_SECTIONS.map((id) => document.getElementById(id));

    let frame = 0;
    let lastActive = -1;
    let offsets: number[] = [];
    let cachedHeight = -1;

    const cache = () => {
      offsets = sections.map((element) => (element ? element.offsetTop : Number.POSITIVE_INFINITY));
      cachedHeight = document.documentElement.scrollHeight;
    };

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;

      // Content can grow after first paint (fonts, images, a panel opening).
      // Re-measuring only when the height actually moved keeps this free.
      if (doc.scrollHeight !== cachedHeight) cache();

      const scrollable = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0;

      rail.style.setProperty("--rail-progress", progress.toFixed(4));
      if (fill) fill.style.setProperty("--rail-progress", progress.toFixed(4));
      if (readout) readout.textContent = String(Math.round(progress * 100)).padStart(2, "0");

      // The active node is the last section whose top has passed the reading
      // line — slightly above centre, where the eye actually is.
      const line = y + window.innerHeight * 0.42;
      let active = 0;
      for (let i = 0; i < offsets.length; i += 1) {
        if (offsets[i] <= line) active = i;
      }

      if (active !== lastActive) {
        nodesRef.current.forEach((node, index) => {
          if (!node) return;
          node.dataset.active = index === active ? "true" : "false";
          node.dataset.passed = index < active ? "true" : "false";
        });
        lastActive = active;
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    cache();
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <nav
      ref={railRef}
      aria-label="Section progress"
      className="qra-rail"
      style={{ "--rail-progress": "0" } as React.CSSProperties}
    >
      <div className="qra-rail__head">
        <span className="qra-rail__pct" data-rail-readout>
          00
        </span>
        <span className="qra-rail__pctsign">%</span>
      </div>

      <div className="qra-rail__map">
        <div className="qra-rail__track" aria-hidden="true">
          <span className="qra-rail__fill" data-rail-fill />
        </div>

        <ol className="qra-rail__nodes">
          {HOME_SECTIONS.map((id, index) => (
            <li key={id} className="qra-rail__item">
              <a
                ref={(element) => {
                  nodesRef.current[index] = element;
                }}
                href={`#${id}`}
                data-active="false"
                data-passed="false"
                className="qra-rail__node"
              >
                <span className="qra-rail__dot" aria-hidden="true" />
                <span className="qra-rail__label">
                  <span className="qra-rail__index">{String(index + 1).padStart(2, "0")}</span>
                  {SECTION_LABELS[id]}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
