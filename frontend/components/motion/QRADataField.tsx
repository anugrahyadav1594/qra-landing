"use client";

/**
 * QRA DATA FIELD — the site's one visual system.
 *
 * A field of very thin lines, small nodes and connection paths that move
 * between four states:
 *
 *   scattered  →  connected  →  structured  →  understood
 *
 * Every section uses this component rather than its own decoration, which is
 * what makes the site read as one product instead of a set of animations.
 *
 * Performance notes (this runs on marketing pages, so it has to be free):
 *   · one rAF loop, only while the field is on screen (IntersectionObserver)
 *     and only while the tab is visible;
 *   · geometry is recomputed every few frames, not every frame;
 *   · edges are batched into a handful of alpha buckets and stroked in one
 *     path each, so state changes stay rare;
 *   · no shadowBlur, no per-frame allocations in the hot loop, no React state;
 *   · the device pixel ratio is capped, and node counts drop on small or
 *     low-core devices;
 *   · reduced motion draws a single static frame and never starts the loop.
 */

import { useEffect, useRef, type CSSProperties } from "react";

import { clamp01, damp, deviceTier, prefersReducedMotion, scaleCount, seededRandom } from "@/lib/motion";

export type DataFieldVariant = "ambient" | "scatter" | "organize" | "converge" | "structure";

type DataFieldProps = {
  /** Which transformation the field performs. */
  variant?: DataFieldVariant;
  /** Node budget multiplier (clamped). */
  density?: number;
  /** Drift / settle speed multiplier. */
  speed?: number;
  /** Opacity and connection-threshold multiplier. */
  intensity?: number;
  /** Node colour; connections inherit it at lower alpha. */
  color?: string;
  /** React to the pointer (desktop only, ignored for reduced motion). */
  interactive?: boolean;
  /** Seed for the deterministic layout. */
  seed?: number;
  /** Optional fixed progress in 0..1 instead of scroll-derived. */
  progress?: number;
  /** Perform the transformation once on entry, then hold it. */
  autoPlay?: boolean;
  /**
   * Keep the canvas viewport-sized and pinned while the wrapper (which is what
   * measures scroll progress) covers a taller section. Without this, a field
   * spanning a three-screen section would allocate a three-screen canvas.
   */
  stickyCanvas?: boolean;
  className?: string;
  style?: CSSProperties;
};

type Node = {
  /** Chaos pose — where the information starts. */
  cx: number;
  cy: number;
  /** Home pose — where it ends up once the information is structured. */
  hx: number;
  hy: number;
  /** Current pose. */
  x: number;
  y: number;
  /** Drift phase for the ambient variant. */
  phase: number;
  speed: number;
  /** Lane, used by ambient and organize. */
  lane: number;
  size: number;
  bright: number;
};

type Edge = { a: number; b: number; strength: number };

const BASE_COUNT = 150;
const MAX_EDGES_PER_NODE = 3;

export function QRADataField({
  variant = "ambient",
  density = 1,
  speed = 1,
  intensity = 1,
  color = "#3F6FFF",
  interactive = false,
  seed = 7,
  progress: fixedProgress,
  autoPlay = false,
  stickyCanvas = false,
  className = "",
  style,
}: DataFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Scroll-derived progress, written outside React. */
  const targetRef = useRef(fixedProgress ?? 0);
  const pointerRef = useRef({ x: -1, y: -1, active: false });

  useEffect(() => {
    if (fixedProgress !== undefined) targetRef.current = fixedProgress;
  }, [fixedProgress]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    // jsdom and very old browsers: draw nothing rather than throw.
    if (!context) return;

    // Narrowed aliases: the helpers below are hoisted functions, and TypeScript
    // cannot carry the null checks into them through the captured refs.
    const root: HTMLDivElement = wrap;
    const surface: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = context;

    const reduced = prefersReducedMotion();
    const tier = deviceTier();
    const rgb = hexToRgb(color);
    const count = scaleCount(BASE_COUNT * clamp(density, 0.2, 2), tier);
    const connectionDistance = (tier === "low" ? 0.17 : 0.14) * clamp(intensity, 0.3, 2);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let last = 0;
    let frame = 0;
    let displayed = fixedProgress ?? 0;

    const nodes: Node[] = [];
    let edges: Edge[] = [];

    /* ── Layout ──────────────────────────────────────────────────────── */

    const random = seededRandom(seed);

    for (let i = 0; i < count; i += 1) {
      const lane = Math.floor(random() * 7);
      const home = homePose(variant, i, count, lane, random);
      const chaos = {
        x: random() * 1.2 - 0.1,
        y: random() * 1.2 - 0.1,
      };
      nodes.push({
        cx: chaos.x,
        cy: chaos.y,
        hx: home.x,
        hy: home.y,
        x: chaos.x,
        y: chaos.y,
        phase: random() * Math.PI * 2,
        speed: 0.25 + random() * 0.75,
        lane,
        size: 0.6 + random() * 1.1,
        bright: 0.3 + random() * 0.7,
      });
    }

    function rebuildEdges(progress: number) {
      const next: Edge[] = [];
      const maxDistance2 = connectionDistance * connectionDistance;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        let made = 0;
        for (let j = i + 1; j < nodes.length && made < MAX_EDGES_PER_NODE; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxDistance2) continue;
          // Connections reach full strength later in the transformation.
          const strength = (1 - Math.sqrt(d2) / connectionDistance) * clamp01((progress - 0.35) / 0.5);
          if (strength <= 0.02) continue;
          next.push({ a: i, b: j, strength });
          made += 1;
        }
      }
      edges = next;
      return next;
    }

    /* ── Sizing ──────────────────────────────────────────────────────── */

    function resize() {
      // Scroll progress comes from the wrapper; the drawing surface comes from
      // the holder, which is viewport-sized when the canvas is pinned.
      const rect = (holderRef.current ?? root).getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      dpr = Math.min(window.devicePixelRatio || 1, tier === "low" ? 1.25 : 2);
      width = rect.width;
      height = rect.height;
      surface.width = Math.floor(width * dpr);
      surface.height = Math.floor(height * dpr);
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    /* ── Scroll progress (rAF-throttled, never in React state) ───────── */

    function measure() {
      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      targetRef.current = clamp01((viewport - rect.top) / (viewport + rect.height));
    }

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        measure();
        if (!running) draw(0, true);
      });
    };

    /* ── Painting ────────────────────────────────────────────────────── */

    const EDGE_BUCKETS = 4;

    function draw(delta: number, force = false) {
      if (!force && width === 0) return;
      const rectW = width;
      const rectH = height;
      if (rectW === 0 || rectH === 0) return;

      // Fixed-progress fields never follow the scroll.
      if (autoPlay && variant !== "ambient") {
        displayed = damp(displayed, targetRef.current, 1.6, delta);
      } else if (fixedProgress === undefined && variant !== "ambient") {
        displayed = force ? targetRef.current : damp(displayed, targetRef.current, 3.2, delta);
      } else if (fixedProgress !== undefined) {
        displayed = fixedProgress;
      } else {
        // Ambient fields settle to their resting state.
        displayed = damp(displayed, 1, 1.1, delta);
      }

      frame += 1;
      const time = performance.now() / 1000;

      // Poses (cheap; geometry rebuild is the expensive part).
      for (const node of nodes) {
        if (variant === "ambient") {
          const drift = Math.sin(time * 0.06 * node.speed * speed + node.phase) * 0.012;
          node.x = node.hx + drift;
          node.y = node.hy;
          continue;
        }
        const travel = easeInOutCubic(clamp01((displayed - node.lane * 0.03) / 0.85));
        node.x = node.cx + (node.hx - node.cx) * travel;
        node.y = node.cy + (node.hy - node.cy) * travel;
        if (variant === "converge") {
          const pull = easeInOutCubic(clamp01((displayed - 0.3) / 0.7));
          node.x += (0.5 - node.x) * pull;
          node.y += (0.5 - node.y) * pull;
        }
      }

      if (frame % 5 === 1 || force) edges = rebuildEdges(displayed);

      ctx.clearRect(0, 0, rectW, rectH);

      // Ambient fields are mostly line: long horizontals that slide sideways at
      // slightly different speeds, which is what makes the field feel alive
      // without anything ever "flying around".
      if (variant === "ambient") {
        const lanes = tier === "low" ? 9 : 14;
        ctx.lineWidth = 1;
        for (let lane = 0; lane < lanes; lane += 1) {
          const y = ((lane + 1) / (lanes + 1)) * rectH + Math.sin(time * 0.08 + lane) * 1.2;
          const drift = ((time * (6 + (lane % 4) * 3) * speed) % (rectW + 240)) - 120;
          const fade = 0.04 + ((lane % 3) + 1) * 0.022;
          ctx.globalAlpha = fade * intensity;
          ctx.strokeStyle = "#F5F7FA";
          ctx.beginPath();
          ctx.moveTo(drift - 150, Math.round(y) + 0.5);
          ctx.lineTo(drift + rectW * 0.42, Math.round(y) + 0.5);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Coordinate system, only where it means something.
      if (variant === "structure" || variant === "organize") {
        const gridAlpha = 0.05 * intensity * clamp01(displayed * 1.4);
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.lineWidth = 1;
        ctx.globalAlpha = gridAlpha;
        ctx.beginPath();
        const step = tier === "low" ? 96 : 72;
        for (let x = 0; x <= rectW; x += step) {
          ctx.moveTo(Math.round(x) + 0.5, 0);
          ctx.lineTo(Math.round(x) + 0.5, rectH);
        }
        for (let y = 0; y <= rectH; y += step) {
          ctx.moveTo(0, Math.round(y) + 0.5);
          ctx.lineTo(rectW, Math.round(y) + 0.5);
        }
        ctx.stroke();
      }

      // Connections, batched by alpha bucket. The band is deliberately narrow
      // (0.05–0.17 before intensity): these lines are the texture of the page,
      // never a feature of it.
      ctx.lineWidth = 1;
      for (let bucket = 0; bucket < EDGE_BUCKETS; bucket += 1) {
        const lower = bucket / EDGE_BUCKETS;
        const upper = (bucket + 1) / EDGE_BUCKETS;
        ctx.globalAlpha = (0.05 + 0.12 * upper) * intensity;
        ctx.strokeStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.beginPath();
        for (const edge of edges) {
          if (edge.strength < lower || edge.strength >= upper) continue;
          const a = nodes[edge.a];
          const b = nodes[edge.b];
          ctx.moveTo(a.x * rectW, a.y * rectH);
          ctx.lineTo(b.x * rectW, b.y * rectH);
        }
        ctx.stroke();
      }

      // Nodes.
      for (let bucket = 0; bucket < EDGE_BUCKETS; bucket += 1) {
        const lower = bucket / EDGE_BUCKETS;
        const upper = (bucket + 1) / EDGE_BUCKETS;
        ctx.globalAlpha = (0.18 + 0.5 * upper) * intensity;
        ctx.fillStyle = bucket >= EDGE_BUCKETS - 2 ? `rgb(${rgb.r},${rgb.g},${rgb.b})` : "#F5F7FA";
        ctx.beginPath();
        for (const node of nodes) {
          if (node.bright < lower || node.bright >= upper) continue;
          const size = node.size * (1 + 0.5 * clamp01(displayed));
          const half = size / 2;
          const radius = pointerRef.current.active
            ? pointerDistance(pointerRef.current, node, rectW, rectH)
            : 1;
          ctx.rect(
            node.x * rectW - half * radius,
            node.y * rectH - half * radius,
            size * radius,
            size * radius,
          );
        }
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    function pointerDistance(
      pointer: { x: number; y: number },
      node: Node,
      rectW: number,
      rectH: number,
    ) {
      const dx = pointer.x - node.x * rectW;
      const dy = pointer.y - node.y * rectH;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return 1 + Math.max(0, 1 - distance / 120) * 0.9;
    }

    /* ── Loop control ────────────────────────────────────────────────── */

    function tick(now: number) {
      if (!running) return;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      draw(delta);
      raf = window.requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    if (!resize()) {
      // Hidden at mount (for example inside a collapsed panel) — try once after
      // a frame, then give up and stay invisible rather than looping forever.
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (!resize()) return;
        if (reduced) draw(0, true);
        else start();
      });
    } else if (reduced) {
      draw(0, true);
    }

    const onResize = () => {
      if (!resize()) return;
      draw(0, true);
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting && !reduced) {
                  // The one-shot transformation begins when the field arrives.
                  if (autoPlay) targetRef.current = 1;
                  start();
                  schedule();
                } else {
                  stop();
                }
              }
            },
            { rootMargin: "120px" },
          );
    observer?.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };
    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    // Scroll only matters for the scrubbed variants.
    const scrubbed = variant !== "ambient" && fixedProgress === undefined && !autoPlay;
    if (scrubbed) {
      measure();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    }
    if (interactive && !reduced && !isCoarsePointer()) {
      root.addEventListener("pointermove", onPointerMove);
      root.addEventListener("pointerleave", onPointerLeave);
    }

    if (reduced) draw(0, true);
    else if (!observer) start();

    return () => {
      stop();
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [variant, density, speed, intensity, color, interactive, seed, fixedProgress, autoPlay, stickyCanvas]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`qra-data-field ${className}`}
      style={style}
      data-variant={variant}
    >
      {stickyCanvas ? (
        <div ref={holderRef} className="sticky top-0 h-full w-full lg:h-screen">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      ) : (
        <div ref={holderRef} className="h-full w-full">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}

/* ── Layouts ─────────────────────────────────────────────────────────── */

/** Where a node ends up once the information has been organised. */
function homePose(
  variant: DataFieldVariant,
  index: number,
  count: number,
  lane: number,
  random: () => number,
): { x: number; y: number } {
  switch (variant) {
    case "structure": {
      // Orthogonal architecture: vertical spines, horizontal beams, nodes at
      // the intersections. This is the "infrastructure for understanding" pose.
      const spine = index % 6;
      const onBeam = index % 3 === 0;
      const x = 0.12 + spine * 0.152;
      const y = onBeam ? 0.2 + Math.floor(index / 6) * 0.13 : 0.06 + random() * 0.88;
      return { x: Math.min(0.94, x), y: Math.min(0.94, y) };
    }
    case "converge":
      // Everything gathers around one point.
      return {
        x: 0.5 + (random() - 0.5) * 0.16,
        y: 0.5 + (random() - 0.5) * 0.16,
      };
    case "organize":
    case "scatter": {
      // Even columns inside the node's lane — a readable structure.
      const perLane = Math.max(1, Math.ceil(count / 7));
      const column = index % perLane;
      return {
        x: 0.08 + (column / Math.max(1, perLane - 1)) * 0.84,
        y: 0.14 + lane * 0.12,
      };
    }
    case "ambient":
    default: {
      // Sparse horizontal lines with nodes resting on them.
      return { x: 0.02 + random() * 0.96, y: 0.1 + lane * 0.13 + random() * 0.02 };
    }
  }
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function isCoarsePointer() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(hover: none)").matches
    : false;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((character) => character + character)
          .join("")
      : clean;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return { r: 63, g: 111, b: 255 };
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}
