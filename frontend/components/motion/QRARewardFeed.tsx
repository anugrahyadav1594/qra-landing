"use client";

import { useEffect, useRef, useState } from "react";

import type { HomeSectionId } from "@/lib/constants";
import { HOME_SECTIONS } from "@/lib/constants";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

import { sharedRevealObserver } from "./reveal-observer";

/**
 * THE REWARD FEED — the page's dopamine loop.
 *
 * Reading a long page is unrewarded: nothing acknowledges the effort, so
 * attention has no reason to stay. This gives each section a payoff — a small
 * XP gain, an unlock, a streak — delivered as a toast in the corner, with a
 * running session total that only ever climbs.
 *
 * The pacing is the whole point. A reward on every scroll event is noise and
 * trains the reader to ignore it, so there is a hard floor between rewards:
 * surprise, then enough quiet to process it, then the next one. Rewards earned
 * during the quiet are queued, not dropped and not stacked, so descending fast
 * still yields every one of them — spaced out.
 *
 * The state machine deliberately lives in refs rather than in state: the timer
 * callbacks outlive the render that created them, and a callback closing over a
 * stale `current` is exactly how two toasts end up on screen at once. Refs give
 * the timers one truth to read. React state is used only for what is painted.
 *
 * Cost: it renders a handful of times for the whole page (once per reward),
 * animates only `transform` and `opacity`, reuses the site's single
 * IntersectionObserver, and does no work at all for reduced motion or touch.
 */

type Reward = {
  id: string;
  /** The glyph that leads the toast. Kept typographic — no icon library. */
  glyph: string;
  title: string;
  detail: string;
  xp: number;
  /** Unlocks and streaks read differently from a plain XP gain. */
  kind?: "unlock" | "streak";
};

const REWARDS: Partial<Record<HomeSectionId, Reward>> = {
  problem: {
    id: "problem",
    glyph: "◧",
    title: "+40 XP",
    detail: "Read the problem",
    xp: 40,
  },
  "how-it-works": {
    id: "loop",
    glyph: "◈",
    title: "+50 XP",
    detail: "The loop, understood",
    xp: 50,
  },
  experience: {
    id: "arena-unlock",
    glyph: "▲",
    title: "Level 2 unlocked",
    detail: "Market Arena is now open",
    xp: 75,
    kind: "unlock",
  },
  "research-lab": {
    id: "research",
    glyph: "◇",
    title: "+60 XP",
    detail: "Research literacy",
    xp: 60,
  },
  "for-learners": {
    id: "streak",
    glyph: "✦",
    title: "Streak ×4",
    detail: "Four sections, no skipping",
    xp: 30,
    kind: "streak",
  },
  why: {
    id: "why",
    glyph: "◩",
    title: "+70 XP",
    detail: "Compared both routes",
    xp: 70,
  },
  trust: {
    id: "trust",
    glyph: "▣",
    title: "Verified",
    detail: "No guaranteed returns — and that is the point",
    xp: 25,
  },
  waitlist: {
    id: "final",
    glyph: "★",
    title: "Final level reached",
    detail: "Early access is one step away",
    xp: 100,
    kind: "unlock",
  },
};

/** How long a toast holds the corner before it leaves. */
const DISPLAY_MS = 3200;
/** The leave animation, matched to the CSS. */
const LEAVE_MS = 420;
/**
 * The floor between rewards. Long enough that each one lands on its own — this
 * is what makes the feed feel like a rhythm rather than a ticker.
 */
const MIN_GAP_MS = 5200;

export function QRARewardFeed() {
  // What is painted. Empty on the server and on first client render alike, so
  // there is nothing for hydration to disagree about.
  const [current, setCurrent] = useState<Reward | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [total, setTotal] = useState(0);

  const queue = useRef<Reward[]>([]);
  const showing = useRef(false);
  const lastShown = useRef(0);
  const holdTimer = useRef<number | null>(null);
  const gapTimer = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion and touch get no feed at all — and the gate lives in the
    // effect, not in the render, so the server and the client paint the same
    // empty container and hydration stays clean.
    if (prefersReducedMotion() || isTouchDevice()) return;

    const show = () => {
      const next = queue.current.shift();
      if (!next) {
        showing.current = false;
        return;
      }

      showing.current = true;
      lastShown.current = Date.now();
      setLeaving(false);
      setCurrent(next);
      setTotal((value) => value + next.xp);

      holdTimer.current = window.setTimeout(() => {
        setLeaving(true);
        holdTimer.current = window.setTimeout(() => {
          // Clear the flag *before* pumping: the queue is only ever drained by
          // a pump that believes nothing is on screen, so leaving this set
          // would strand every remaining reward in the queue for good.
          showing.current = false;
          setCurrent(null);
          setLeaving(false);
          pump();
        }, LEAVE_MS);
      }, DISPLAY_MS);
    };

    /** Take the next reward, but never sooner than the floor allows. */
    const pump = () => {
      if (showing.current || queue.current.length === 0) return;
      const wait = MIN_GAP_MS - (Date.now() - lastShown.current);
      if (wait > 0) {
        if (gapTimer.current) window.clearTimeout(gapTimer.current);
        gapTimer.current = window.setTimeout(show, wait);
        return;
      }
      show();
    };

    const observer = sharedRevealObserver();
    const cleanups: Array<() => void> = [];

    for (const id of HOME_SECTIONS) {
      const reward = REWARDS[id];
      const element = reward ? document.getElementById(id) : null;
      if (!reward || !element) continue;
      cleanups.push(
        observer.observe(element, () => {
          queue.current.push(reward);
          pump();
        }),
      );
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
      if (gapTimer.current) window.clearTimeout(gapTimer.current);
    };
  }, []);

  return (
    <div className="qra-feed" aria-live="polite" aria-atomic="true">
      {current ? (
        <div
          className="qra-toast"
          data-testid="qra-toast"
          data-kind={current.kind ?? "xp"}
          data-leaving={leaving}
        >
          <span className="qra-toast__glyph" aria-hidden="true">
            {current.glyph}
          </span>
          <span className="qra-toast__body">
            <span className="qra-toast__title">{current.title}</span>
            <span className="qra-toast__detail">{current.detail}</span>
          </span>
          <span className="qra-toast__total">
            <span className="qra-toast__totalvalue">{total}</span>
            <span className="qra-toast__totallabel">session xp</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
