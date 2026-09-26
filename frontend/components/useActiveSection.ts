"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy for the homepage navbar.
 *
 * Observes the given section ids and reports the one currently under the
 * reading line (a thin band around the middle of the viewport). Only the
 * first intersecting section in document order wins, so a short section can
 * never leave the navbar without an active item.
 *
 * Runs only when `ids` is non-empty (i.e. on the homepage) and degrades to
 * `null` where IntersectionObserver is unavailable.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId(null);
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const next = ids.find((id) => visible.has(id)) ?? null;
        // `null` keeps the previous item highlighted between sections.
        if (next) setActiveId((current) => (current === next ? current : next));
      },
      // A 10%-tall band across the middle of the viewport acts as the
      // reading line the user is currently looking at.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

/**
 * Smoothly scrolls to a homepage section and records it in the URL without a
 * history entry or a jump. Falls back to native anchor behaviour when the
 * target is missing.
 */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, "", `#${id}`);
  }
}
