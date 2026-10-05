/* The two sections that carry the argument. They used to be copy and a quiet
 * list; now each pairs its ordered content with a counter-image of the same
 * material — scatter for the problem, a route for the idea. These tests pin
 * the structure so a future "simplification" cannot quietly delete the visuals
 * again, and so the environments stay attached to their images. */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IdeaSection } from "@/components/home/IdeaSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { PROBLEM, IDEA } from "@/lib/content";

describe("ProblemSection", () => {
  it("pairs the ordered list with a scatter of the same sources", () => {
    const { container } = render(<ProblemSection />);

    // The ordered truth.
    const rows = container.querySelectorAll(".problem-row");
    expect(rows).toHaveLength(PROBLEM.fragments.length);

    // The unordered reality behind it: one decorative chip per source.
    const scatter = container.querySelector(".problem-scatter");
    expect(scatter).not.toBeNull();
    expect(scatter).toHaveAttribute("aria-hidden", "true");
    const chips = scatter!.querySelectorAll(".problem-scatter__chip");
    expect(chips).toHaveLength(PROBLEM.fragments.length);

    // The scatter carries each source's own offsets and rotation from content.
    const first = chips[0] as HTMLElement;
    expect(first.style.getPropertyValue("--fx")).toBe(PROBLEM.fragments[0].fx);
    expect(first.style.getPropertyValue("--fr")).toBe(PROBLEM.fragments[0].fr);
  });

  it("reads the argument in order above the texture", () => {
    render(<ProblemSection />);
    expect(screen.getByText(PROBLEM.overload)).toBeInTheDocument();
    expect(screen.getByText(PROBLEM.clarity)).toBeInTheDocument();
  });
});

describe("IdeaSection", () => {
  it("sets the three moves as stations on a route", () => {
    const { container } = render(<IdeaSection />);

    const steps = container.querySelectorAll(".idea-step");
    expect(steps).toHaveLength(IDEA.steps.length);
    // Each station ghosts its number.
    expect(container.querySelectorAll(".idea-step__num")).toHaveLength(IDEA.steps.length);
    // Each draws its hairline on arrival.
    expect(container.querySelectorAll(".idea-rule")).toHaveLength(IDEA.steps.length);

    // The route behind them: a line and a travelling packet, decorative.
    const flow = container.querySelector(".idea-flow");
    expect(flow).not.toBeNull();
    expect(flow).toHaveAttribute("aria-hidden", "true");
    expect(flow!.querySelector(".idea-flow__line")).not.toBeNull();
    expect(flow!.querySelector(".idea-flow__packet")).not.toBeNull();
  });

  it("still reads as the three written steps", () => {
    render(<IdeaSection />);
    for (const step of IDEA.steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    }
  });
});
