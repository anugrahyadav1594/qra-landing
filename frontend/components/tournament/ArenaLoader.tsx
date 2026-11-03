"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ArenaCanvas } from "@/components/tournament/ArenaCanvas";
import { TOURNAMENT_POWERED_BY, TOURNAMENT_SHORT_NAME } from "@/lib/tournament";

const SESSION_KEY = "mtt:arena-intro-played";
const DURATION_MS = 2800;
const ARM_DELAY_MS = 220;
const SAFETY_MS = DURATION_MS * 1.7;
const FADE_MS = 520;

/**
 * ENTER THE ARENA — the tournament's startup sequence.
 *
 * Behaviour:
 *  • plays at most once per browser session (sessionStorage);
 *  • skippable at any moment (button, Esc, click anywhere);
 *  • skipped entirely when the visitor prefers reduced motion;
 *  • WebGL is optional — the SVG arena carries the same choreography;
 *  • the landing page underneath is already rendered and interactive the
 *    moment the overlay is gone (no artificial delay, no blocking fetch).
 */
export function ArenaLoader() {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [skipHover, setSkipHover] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setClosing(true);
    window.setTimeout(() => {
      setMounted(false);
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("touch-action");
    }, FADE_MS);
  }, []);

  // ── Decide whether the intro should run at all ─────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alreadyPlayed = false;
    try {
      alreadyPlayed = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      alreadyPlayed = false;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (alreadyPlayed || reduced) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* storage may be unavailable — the intro simply replays */
      }
      return;
    }
    setMounted(true);
    document.body.style.setProperty("overflow", "hidden");
    document.body.style.setProperty("touch-action", "none");
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  // ── Overlay choreography (rAF, DOM writes only — no React re-renders) ──
  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    let start = 0;
    let timer = 0;

    const frame = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION_MS, 1);

      if (gridRef.current) gridRef.current.style.opacity = String(Math.min(progress / 0.17, 1) * 0.9);
      if (scanRef.current) {
        const scan = Math.min(progress / 0.17, 1);
        scanRef.current.style.transform = `translateX(${-60 + scan * 120}vw)`;
        scanRef.current.style.opacity = String(Math.sin(scan * Math.PI));
      }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;

      const brandStart = 0.63;
      if (brandRef.current) {
        const revealed = Math.max(0, (progress - brandStart) / 0.2);
        brandRef.current.style.opacity = String(Math.min(revealed, 1));
        brandRef.current.style.transform = `translateY(${(1 - Math.min(revealed, 1)) * 18}px)`;
      }
      if (readoutRef.current) {
        readoutRef.current.textContent = progress < 0.4 ? "BOOT" : progress < 0.63 ? "LIVE" : "READY";
      }

      if (progress >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    timer = window.setTimeout(() => {
      raf = requestAnimationFrame(frame);
    }, ARM_DELAY_MS);
    const safety = window.setTimeout(finish, SAFETY_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(safety);
      cancelAnimationFrame(raf);
    };
  }, [mounted, finish]);

  // ── Skip affordances ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, finish]);

  useEffect(() => {
    return () => {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("touch-action");
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Enter the arena — tournament intro"
      onClick={finish}
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-arena-950 transition-opacity duration-500 ${
        closing ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Technical grid */}
      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0 opacity-0 arena-grid-mask"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,124,53,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(244,124,53,0.07) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        ref={scanRef}
        className="pointer-events-none absolute left-0 top-0 h-full w-[40vw] opacity-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,170,112,0.55), transparent)",
          filter: "blur(0.5px)",
        }}
      />

      {/* Arena */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <ArenaCanvas
          mode="intro"
          durationMs={DURATION_MS}
          onComplete={finish}
          className="h-[92vmin] w-[92vmin]"
        />
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-8">
        <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-flare-300/70">
          <span>
            {TOURNAMENT_SHORT_NAME} · SYSTEM BOOT
          </span>
          <span className="text-bone/40">
            STATUS <span ref={readoutRef} className="text-flare-300">BOOT</span>
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="w-32 sm:w-56">
            <div className="h-[2px] w-full bg-white/10">
              <div
                ref={progressRef}
                className="h-full origin-left scale-x-0 bg-flare-500"
                style={{ boxShadow: "0 0 12px rgba(244,124,53,0.8)" }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/35">
              Initialising trading arena
            </p>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              finish();
            }}
            onMouseEnter={() => setSkipHover(true)}
            onMouseLeave={() => setSkipHover(false)}
            className="pointer-events-auto rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/70 transition hover:border-flare-500/70 hover:text-flare-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-flare-500"
          >
            {skipHover ? "Enter now →" : "Skip intro"}
          </button>
        </div>
      </div>

      {/* Brand reveal */}
      <div
        ref={brandRef}
        className="pointer-events-none relative z-10 px-6 text-center"
        style={{ opacity: 0 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-flare-300/80">
          Quantrelic&apos;s
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[0.92] tracking-tightest text-bone sm:text-6xl">
          Mumbai Trading
          <br />
          Tournament
        </h1>
        <div className="mx-auto mt-5 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-flare-500/60" />
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-bone/50">
            {TOURNAMENT_POWERED_BY}
          </p>
          <span className="h-px w-8 bg-flare-500/60" />
        </div>
      </div>

    </div>
  );
}
