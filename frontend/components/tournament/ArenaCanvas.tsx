"use client";

import { useEffect, useRef, useState } from "react";

import { ArenaStatic } from "@/components/tournament/ArenaStatic";
import type { ArenaHandle } from "@/components/tournament/arena/arenaScene";

type Props = {
  mode?: "intro" | "ambient";
  className?: string;
  durationMs?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  /** Skip WebGL and render the handcrafted SVG arena instead. */
  forceStatic?: boolean;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 4;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ??
    false;
  return cores <= 4 || saveData;
}

/**
 * Renders the arena. WebGL (Three.js) is loaded lazily and only when the
 * device can afford it; every other path — reduced motion, data saver, no
 * WebGL, small screens — gets the handcrafted SVG arena, which is also the
 * placeholder while the 3D bundle downloads.
 */
export function ArenaCanvas({
  mode = "ambient",
  className = "",
  durationMs = 2800,
  onProgress,
  onComplete,
  forceStatic = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<ArenaHandle | null>(null);
  const [webgl, setWebgl] = useState(false);
  // Starts false so server and client markup match; flipped after mount.
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    if (forceStatic || prefersReducedMotion() || !supportsWebGL()) {
      setWebgl(false);
    } else {
      setWebgl(true);
    }
    setAllowMotion(!prefersReducedMotion());
  }, [forceStatic]);

  useEffect(() => {
    if (!webgl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const cleanupFns: (() => void)[] = [];

    (async () => {
      try {
        const scene = await import("@/components/tournament/arena/arenaScene");
        if (cancelled) return;
        const handle = scene.createArenaScene({
          canvas,
          mode,
          durationMs,
          quality: isLowPower() ? "low" : "high",
          onProgress,
          onComplete,
        });
        handleRef.current = handle;

        const resize = () => {
          const rect = canvas.parentElement?.getBoundingClientRect();
          handle.resize(rect?.width || canvas.clientWidth, rect?.height || canvas.clientHeight);
        };
        resize();
        handle.start();

        resizeObserver = new ResizeObserver(resize);
        if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

        observer = new IntersectionObserver(
          (entries) => handle.setPaused(!entries[0]?.isIntersecting),
          { threshold: 0.01 },
        );
        observer.observe(canvas);

        const onVisibility = () => handle.setPaused(document.hidden);
        document.addEventListener("visibilitychange", onVisibility);
        cleanupFns.push(() => document.removeEventListener("visibilitychange", onVisibility));
      } catch {
        setWebgl(false);
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      resizeObserver?.disconnect();
      cleanupFns.forEach((fn) => fn());
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [webgl, mode, durationMs, onProgress, onComplete]);

  return (
    <div className={`relative ${className}`}>
      <ArenaStatic className="absolute inset-0 h-full w-full" animate={!webgl && allowMotion} />
      {webgl && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          style={{ opacity: 1 }}
        />
      )}
    </div>
  );
}
