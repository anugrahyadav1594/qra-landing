/* The homepage sections that carry the new product story.
 *
 * These tests pin the structure the story depends on: the problem still pairs
 * its ordered list with a counter-image, the loop still reads as a route, the
 * level progression still carries per-level state and a working detail panel,
 * and the arena still states plainly that the future is hidden. If a future
 * "simplification" quietly deletes one of those, these fail. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArenaSection } from "@/components/home/ArenaSection";
import { ClassroomSection } from "@/components/home/ClassroomSection";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { LeaderboardSection } from "@/components/home/LeaderboardSection";
import { LevelModeSection } from "@/components/home/LevelModeSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { ScoreSection } from "@/components/home/ScoreSection";
import { WhySection } from "@/components/home/WhySection";
import {
  ARENA_PREVIEW,
  CLASSROOM,
  EXPERIENCE,
  LEADERBOARD,
  LEVEL_MODE,
  MARKET_ARENA,
  PROBLEM,
  SCORE,
  WHY,
} from "@/lib/content";

describe("ProblemSection", () => {
  it("pairs the ordered list with a scatter of the same material", () => {
    const { container } = render(<ProblemSection />);

    const rows = container.querySelectorAll(".problem-row");
    expect(rows).toHaveLength(PROBLEM.fragments.length);

    const scatter = container.querySelector(".problem-scatter");
    expect(scatter).not.toBeNull();
    expect(scatter).toHaveAttribute("aria-hidden", "true");

    const chips = scatter!.querySelectorAll(".problem-scatter__chip");
    expect(chips).toHaveLength(PROBLEM.fragments.length);

    const first = chips[0] as HTMLElement;
    expect(first.style.getPropertyValue("--fx")).toBe(PROBLEM.fragments[0].fx);
    expect(first.style.getPropertyValue("--fr")).toBe(PROBLEM.fragments[0].fr);
  });

  it("makes the argument about practising, not about information", () => {
    render(<ProblemSection />);
    expect(screen.getByText(PROBLEM.overload)).toBeInTheDocument();
    expect(screen.getByText(PROBLEM.clarity)).toBeInTheDocument();
  });
});

describe("ClassroomSection", () => {
  it("sets the five-step loop as stations on a route", () => {
    const { container } = render(<ClassroomSection />);

    expect(container.querySelectorAll(".loop-step")).toHaveLength(CLASSROOM.steps.length);
    expect(container.querySelectorAll(".loop-step__num")).toHaveLength(CLASSROOM.steps.length);
    expect(container.querySelectorAll(".loop-rule")).toHaveLength(CLASSROOM.steps.length);

    const flow = container.querySelector(".loop-flow");
    expect(flow).not.toBeNull();
    expect(flow).toHaveAttribute("aria-hidden", "true");
    expect(flow!.querySelector(".loop-flow__line")).not.toBeNull();
    expect(flow!.querySelector(".loop-flow__packet")).not.toBeNull();
  });

  it("reads as the five written steps, ending on level up", () => {
    render(<ClassroomSection />);
    for (const step of CLASSROOM.steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    }
    expect(CLASSROOM.steps[CLASSROOM.steps.length - 1].title).toBe("Level up");
  });
});

describe("LevelModeSection", () => {
  it("shows the progression with per-level state", () => {
    const { container } = render(<LevelModeSection />);

    const cards = container.querySelectorAll(".level-card");
    expect(cards).toHaveLength(LEVEL_MODE.levels.length);
    expect(container.querySelectorAll(".level-status")).toHaveLength(
      // One badge per card, plus the one in the detail panel.
      LEVEL_MODE.levels.length + 1,
    );
    // A locked level must read as locked, not merely be dimmed.
    expect(container.querySelectorAll(".level-card--locked").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".level-card--active")).toHaveLength(1);
  });

  it("opens on the furthest level reached, and follows selection", () => {
    render(<LevelModeSection />);

    // The default selection is the last non-locked level: Moving Averages is
    // locked, so Support & Resistance is where a player actually is.
    const expected = LEVEL_MODE.levels[2];
    expect(screen.getByText(expected.title, { selector: ".level-detail *" })).toBeInTheDocument();
    expect(screen.getByText(expected.learn)).toBeInTheDocument();

    // Selecting another level moves the detail with it.
    const target = LEVEL_MODE.levels[0];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`Level ${target.n}`) }));
    expect(screen.getByText(target.learn)).toBeInTheDocument();
    expect(screen.queryByText(expected.learn)).not.toBeInTheDocument();
  });
});

describe("ArenaSection", () => {
  it("states that the future is withheld, and offers only three decisions", () => {
    const { container } = render(<ArenaSection />);

    // The withheld future is stated twice on purpose: as a label on the
    // interface, and as a marker on the chart itself.
    const hidden = container.querySelector(".arena-hidden");
    expect(hidden).not.toBeNull();
    expect(hidden!.textContent).toContain(MARKET_ARENA.hiddenValue);
    expect(container.querySelector(".candle-chart__hidden")).not.toBeNull();

    expect(screen.getByText(MARKET_ARENA.note)).toBeInTheDocument();

    const decisions = container.querySelectorAll(".arena-decision");
    expect(decisions).toHaveLength(MARKET_ARENA.decisions.length);
    for (const decision of MARKET_ARENA.decisions) {
      expect(screen.getByText(decision)).toBeInTheDocument();
    }
  });

  it("lets the visitor choose an asset", () => {
    render(<ArenaSection />);

    const second = screen.getByRole("button", { name: MARKET_ARENA.assets[1] });
    expect(second).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: MARKET_ARENA.assets[0] })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

describe("ScoreSection", () => {
  it("scores four things, none of them money", () => {
    const { container } = render(<ScoreSection />);

    const bars = container.querySelectorAll(".score-bar__fill");
    // Four categories, plus the XP bar in the progress panel.
    expect(bars).toHaveLength(SCORE.categories.length + 1);

    for (const category of SCORE.categories) {
      expect(screen.getByText(category.label)).toBeInTheDocument();
      expect(screen.getByText(category.detail)).toBeInTheDocument();
    }

    // The claim the section exists to make.
    expect(screen.getByText(SCORE.note)).toBeInTheDocument();
  });
});

describe("LeaderboardSection", () => {
  it("ranks on decision quality and marks the player's own row", () => {
    const { container } = render(<LeaderboardSection />);

    for (const row of LEADERBOARD.rows) {
      expect(screen.getByText(row.name)).toBeInTheDocument();
    }
    const you = container.querySelector(".board-row--you");
    expect(you).not.toBeNull();
    expect(you!.textContent).toContain(LEADERBOARD.you.name);
    expect(you!.textContent).toContain(LEADERBOARD.you.xp);

    // The philosophy line, which is why the ranking is not denominated in money.
    for (const line of LEADERBOARD.closing) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });
});

describe("WhySection", () => {
  it("contrasts the two routes and names the system", () => {
    const { container } = render(<WhySection />);

    for (const step of WHY.traditional.steps) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    for (const step of WHY.qra.steps) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }

    const nodes = container.querySelectorAll(".why-node");
    expect(nodes).toHaveLength(WHY.system.nodes.length);
    for (const node of WHY.system.nodes) {
      expect(screen.getByText(node.label)).toBeInTheDocument();
    }

    // The one step that belongs to the visitor.
    expect(screen.getByText("you")).toBeInTheDocument();
  });
});

describe("ExperienceSection", () => {
  it("shows the whole product once: a screen, two doors, four facts", () => {
    const { container } = render(<ExperienceSection />);

    // The generated concept screen is the centrepiece, and it is labelled as a
    // concept rather than passed off as the real interface.
    const screenImg = container.querySelector("img[src='/images/screen-replay.jpg']");
    expect(screenImg).not.toBeNull();
    expect(screenImg!.getAttribute("alt")).toMatch(/decision/i);

    // Exactly two doors into the product, each linking into the product page.
    const doors = container.querySelectorAll(".exp-mode");
    expect(doors).toHaveLength(EXPERIENCE.modes.length);
    for (const mode of EXPERIENCE.modes) {
      expect(container.querySelector(`a[href="${mode.href}"]`)).not.toBeNull();
    }

    // Four facts that settle the shape of it, none denominated in money.
    expect(container.querySelectorAll(".exp-fact")).toHaveLength(EXPERIENCE.facts.length);
  });

  it("sends the visitor to the product page for the full tour", () => {
    render(<ExperienceSection />);
    const cta = screen.getByRole("link", { name: new RegExp(EXPERIENCE.cta) });
    expect(cta).toHaveAttribute("href", "/product");
  });
});

describe("Market arena preview", () => {
  it("never implies real money is at risk", () => {
    render(<ArenaSection />);
    expect(screen.getByText(MARKET_ARENA.disclaimer)).toBeInTheDocument();
    expect(ARENA_PREVIEW.disclaimer).toMatch(/not real market data/);
    expect(MARKET_ARENA.disclaimer).toMatch(/no real money/i);
  });
});
