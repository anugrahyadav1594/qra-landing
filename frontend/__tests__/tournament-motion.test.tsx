/**
 * Motion wiring for the prize arena and the command bar.
 *
 * These tests run the real GSAP code paths in jsdom (no mocks of GSAP
 * itself) to prove two things: the timelines are created without throwing,
 * and `prefers-reduced-motion` bypasses them so content is never left in a
 * pre-animation state.
 */

import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PrizePool } from "@/components/tournament/PrizePool";
import { DEFAULT_TOURNAMENT_CONFIG } from "@/lib/tournament";

function stubMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => {
      let matches = false;
      if (query.includes("prefers-reduced-motion: reduce")) matches = reducedMotion;
      else if (query.includes("prefers-reduced-motion: no-preference")) matches = !reducedMotion;
      else if (query.includes("min-width: 768px")) matches = true;
      return {
        matches,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        onchange: null,
        dispatchEvent: () => false,
      };
    }),
  );
}

beforeEach(() => {
  if (!("IntersectionObserver" in window)) {
    // @ts-expect-error minimal test double
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!("ResizeObserver" in window)) {
    // @ts-expect-error minimal test double
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Prize pool motion", () => {
  it("builds the entrance timelines when motion is allowed", async () => {
    stubMatchMedia(false);
    const { container, unmount } = render(<PrizePool config={DEFAULT_TOURNAMENT_CONFIG} />);
    const champion = container.querySelector<HTMLElement>('[data-podium-card="1"]');

    await waitFor(() => {
      expect(champion?.style.opacity).not.toBe("");
    });

    // Merit markers are targeted individually by the staggered timeline
    // (GSAP writes a transform; the marker's own opacity is static styling).
    await waitFor(() => {
      const marker = container.querySelector<HTMLElement>("[data-merit-marker]");
      expect(marker?.style.transform).not.toBe("");
    });

    expect(() => unmount()).not.toThrow();
  });

  it("leaves every prize value in its final state under reduced motion", async () => {
    stubMatchMedia(true);
    const { container } = render(<PrizePool config={DEFAULT_TOURNAMENT_CONFIG} />);
    const champion = container.querySelector<HTMLElement>('[data-podium-card="1"]');

    await waitFor(() => expect(champion).toBeTruthy());
    // No GSAP "from" state was applied — nothing is hidden waiting for motion.
    expect(champion?.style.opacity).toBe("");
    const marker = container.querySelector<HTMLElement>("[data-merit-marker]");
    expect(marker?.style.transform).toBe("");
    // The exact declared amount is rendered server-side and stays unchanged.
    expect(container.textContent).toContain("₹1,00,000");
  });

  it("renders the declared allocation even before any animation runs", () => {
    stubMatchMedia(false);
    const { container } = render(<PrizePool config={DEFAULT_TOURNAMENT_CONFIG} />);
    const text = container.textContent ?? "";
    expect(text).toContain("₹1,00,000");
    expect(text).toContain("₹25,000");
    expect(text).toContain("₹15,000");
    expect(text).toContain("₹10,000");
    expect(text).toContain("₹40,000");
  });
});
