/** The startup sequence must be skippable, session-scoped and silent under
 * prefers-reduced-motion (Journey J). */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArenaLoader } from "@/components/tournament/ArenaLoader";

function mockMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
}

describe("ArenaLoader", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockMatchMedia(false);
  });

  afterEach(() => {
    document.body.style.removeProperty("overflow");
  });

  it("plays once per session and not again", async () => {
    const first = render(<ArenaLoader />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /skip intro|enter now/i })).toBeInTheDocument();
    first.unmount();

    window.sessionStorage.setItem("mtt:arena-intro-played", "1");
    render(<ArenaLoader />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is skipped entirely when the visitor prefers reduced motion", async () => {
    mockMatchMedia(true);
    render(<ArenaLoader />);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(window.sessionStorage.getItem("mtt:arena-intro-played")).toBe("1");
  });

  it("can be dismissed with the skip control", async () => {
    render(<ArenaLoader />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    const skip = screen.getByRole("button", { name: /skip intro|enter now/i });
    await userEvent.click(skip);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), { timeout: 3000 });
  });

  it("announces the brand and the powered-by line", async () => {
    render(<ArenaLoader />);
    await waitFor(() => expect(screen.getByText(/Mumbai Trading/)).toBeInTheDocument());
    expect(screen.getByText(/POWERED BY QUANT RELIC/)).toBeInTheDocument();
  });
});
