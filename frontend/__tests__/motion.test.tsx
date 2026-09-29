/* The motion system: the opening sequence, the data field, and typographic
 * reveals. These run in jsdom, which has no canvas and no layout — which is
 * exactly the point: none of these components may throw or trap the page when
 * their drawing surface or their observer is unavailable. */

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Loader, INTRO_ATTRIBUTE } from "@/components/Loader";
import { QRADataField } from "@/components/QRADataField";
import { TextReveal } from "@/components/TextReveal";
import { LOADER } from "@/lib/content";

const root = () => document.documentElement;

beforeEach(() => {
  sessionStorage.clear();
  root().removeAttribute(INTRO_ATTRIBUTE);
});

afterEach(() => {
  root().removeAttribute(INTRO_ATTRIBUTE);
});

describe("Loader", () => {
  it("plays for a first visit and announces itself to assistive tech", () => {
    root().setAttribute(INTRO_ATTRIBUTE, "play");
    render(<Loader />);

    expect(screen.getByTestId("qra-loader")).toHaveAttribute("data-mode", "play");
    // The brand, character by character, as the sequence requires.
    expect(screen.getByText(LOADER.tagline)).toBeInTheDocument();
    expect(LOADER.name).toBe("QUANTRELIC");
    for (const character of LOADER.name) {
      expect(screen.getAllByText(character).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(LOADER.announcement)).toHaveClass("sr-only");
  });

  it("does not play again in the same session", () => {
    root().setAttribute(INTRO_ATTRIBUTE, "skip");
    sessionStorage.setItem("qra-loader-seen", "1");
    const { container } = render(<Loader />);
    expect(container).toBeEmptyDOMElement();
  });

  it("uses the quiet version when motion is reduced", () => {
    root().setAttribute(INTRO_ATTRIBUTE, "reduce");
    render(<Loader />);
    const overlay = screen.getByTestId("qra-loader");
    expect(overlay).toHaveAttribute("data-mode", "reduce");
    // The mark and wordmark carry the reduced path; nothing else is required.
    expect(overlay.querySelector(".qra-loader__mark")).toBeInTheDocument();
  });

  it("removes itself and records the visit", async () => {
    root().setAttribute(INTRO_ATTRIBUTE, "play");
    render(<Loader />);
    expect(root().getAttribute(INTRO_ATTRIBUTE)).toBe("play");

    // The hard ceiling is 3.8s; the sequence timer fires well before it.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2600));
    });
    expect(sessionStorage.getItem("qra-loader-seen")).toBe("1");
    expect(root().getAttribute(INTRO_ATTRIBUTE)).toBeNull();
  }, 6000);
});

describe("QRADataField", () => {
  it("renders its surface, and survives a context without canvas support", () => {
    const { container } = render(<QRADataField variant="scatter" />);
    const wrapper = container.querySelector(".qra-data-field");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute("data-variant", "scatter");
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("pins the canvas when the field spans a taller section", () => {
    const { container } = render(<QRADataField variant="converge" stickyCanvas />);
    expect(container.querySelector(".sticky")).not.toBeNull();
  });
});

describe("TextReveal", () => {
  it("keeps every word in the markup, reachable without motion", () => {
    render(<TextReveal text="Make sense of your investments." />);
    // Each word is its own clipped element, and all of them are present.
    for (const word of ["Make", "sense", "of", "your", "investments."]) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });
});
