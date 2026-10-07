/* The progression HUD: the level map on the edge, and the reward feed.
 *
 * The behaviour worth pinning is the *pacing*. A reward feed that fires every
 * reward at once is worse than no feed at all — it reads as a bug and trains
 * the reader to ignore it. So these tests advance a fake clock and assert that
 * rewards arrive one at a time, spaced, with nothing dropped and the session
 * total only ever climbing. */

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QRAProgressRail } from "@/components/motion/QRAProgressRail";
import { QRARewardFeed } from "@/components/motion/QRARewardFeed";
import { HOME_SECTIONS, SECTION_LABELS } from "@/lib/constants";

/* The rail only mounts on the homepage, so the pathname has to be controllable. */
let pathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

/** The feed finds its triggers by id, so the sections have to exist. */
function renderSections() {
  render(
    <div>
      {HOME_SECTIONS.map((id) => (
        <section key={id} id={id} data-section={id} />
      ))}
    </div>,
  );
}

describe("QRAProgressRail", () => {
  beforeEach(() => {
    pathname = "/";
  });

  it("maps every homepage section to a node that links to it", () => {
    render(<QRAProgressRail />);

    const nodes = screen.getAllByRole("link");
    expect(nodes).toHaveLength(HOME_SECTIONS.length);

    HOME_SECTIONS.forEach((id, index) => {
      expect(nodes[index]).toHaveAttribute("href", `#${id}`);
      expect(nodes[index]).toHaveTextContent(SECTION_LABELS[id]);
    });
  });

  it("numbers the nodes in reading order", () => {
    render(<QRAProgressRail />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText(String(HOME_SECTIONS.length).padStart(2, "0"))).toBeInTheDocument();
  });

  it("is not mounted on a page with nothing to descend", () => {
    pathname = "/about";
    const { container } = render(<QRAProgressRail />);
    expect(container.querySelector(".qra-rail")).toBeNull();
  });
});

describe("QRARewardFeed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    renderSections();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** One full cycle: the hold, the leave animation, then the gap floor. */
  const CYCLE_MS = 5200;

  it("pays for the first section straight away", () => {
    render(<QRARewardFeed />);
    expect(screen.getByText("+40 XP")).toBeInTheDocument();
    expect(screen.getByText("Read the problem")).toBeInTheDocument();
  });

  it("never stacks two rewards, and leaves quiet between them", () => {
    render(<QRARewardFeed />);

    // Everything was queued at once, but only one reward is on screen.
    expect(screen.getAllByTestId("qra-toast")).toHaveLength(1);

    // It holds, then leaves — and the floor is not up yet, so the corner is
    // deliberately empty. That silence is the "time to process" half of the
    // loop; a feed that never goes quiet stops being a rhythm.
    act(() => {
      vi.advanceTimersByTime(4400);
    });
    expect(screen.queryAllByTestId("qra-toast")).toHaveLength(0);

    // Past the floor the next one arrives — alone, never overlapping the last.
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.getAllByTestId("qra-toast")).toHaveLength(1);
    expect(screen.getByText("+50 XP")).toBeInTheDocument();
  });

  it("delivers every reward, with a session total that only climbs", () => {
    render(<QRARewardFeed />);

    // The first reward lands immediately, and its XP is already on the total.
    expect(screen.getByText("40")).toBeInTheDocument();

    // Seven more, each exactly one floor apart — nothing dropped, none merged.
    for (let index = 0; index < 7; index += 1) {
      expect(screen.getAllByTestId("qra-toast")).toHaveLength(1);
      act(() => {
        vi.advanceTimersByTime(CYCLE_MS);
      });
    }

    // The eighth is up, and the total is the sum of all eight:
    // 40 + 50 + 75 + 60 + 30 + 70 + 25 + 100.
    expect(screen.getAllByTestId("qra-toast")).toHaveLength(1);
    expect(screen.getByText("450")).toBeInTheDocument();
  });

  it("marks an unlock differently from a plain XP gain", () => {
    render(<QRARewardFeed />);

    // Problem (xp) → loop (xp) → experience (unlock).
    act(() => {
      vi.advanceTimersByTime(CYCLE_MS * 2);
    });
    const toast = screen.getByTestId("qra-toast");
    expect(toast).toHaveAttribute("data-kind", "unlock");
    expect(screen.getByText("Level 2 unlocked")).toBeInTheDocument();
  });
});
