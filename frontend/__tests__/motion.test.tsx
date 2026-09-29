/* The motion system: the opening sequence, the data field, and typographic
 * reveals. These run in jsdom, which has no canvas and no layout — which is
 * exactly the point: none of these components may throw or trap the page when
 * their drawing surface or their observer is unavailable. */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { QRALoader, INTRO_ATTRIBUTE } from "@/components/motion/QRALoader";
import { ProductPreview } from "@/components/ProductPreview";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRADataField } from "@/components/motion/QRADataField";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { TextReveal } from "@/components/motion/TextReveal";
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
    render(<QRALoader />);

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
    const { container } = render(<QRALoader />);
    expect(container).toBeEmptyDOMElement();
  });

  it("uses the quiet version when motion is reduced", () => {
    root().setAttribute(INTRO_ATTRIBUTE, "reduce");
    render(<QRALoader />);
    const overlay = screen.getByTestId("qra-loader");
    expect(overlay).toHaveAttribute("data-mode", "reduce");
    // The mark and wordmark carry the reduced path; nothing else is required.
    expect(overlay.querySelector(".qra-loader__mark")).toBeInTheDocument();
  });

  it("removes itself and records the visit", async () => {
    root().setAttribute(INTRO_ATTRIBUTE, "play");
    render(<QRALoader />);
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

describe("QRAAtmosphere", () => {
  it("renders the environment as a decorative layer behind the section", () => {
    const { container } = render(<QRAAtmosphere variant="hero" />);
    const layer = container.querySelector(".qra-atmosphere");
    expect(layer).not.toBeNull();
    expect(layer).toHaveAttribute("data-variant", "hero");
    // Decorative: it must never be announced, and never catch a pointer.
    expect(layer).toHaveAttribute("aria-hidden", "true");
    const image = container.querySelector(".qra-atmosphere__image");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("src", "/images/qra-hero.webp");
    // The wash is what keeps it subordinate to the content.
    expect(container.querySelector(".qra-atmosphere__wash")).not.toBeNull();
  });

  it("accepts the calibrated per-section controls", () => {
    const { container } = render(<QRAAtmosphere variant="trust" intensity={0.5} speed={2} />);
    const layer = container.querySelector(".qra-atmosphere") as HTMLElement;
    // Trust is the quietest environment on the site.
    expect(Number(layer.style.getPropertyValue("--atmosphere-opacity"))).toBeLessThan(0.2);
  });
});

describe("QRASectionTransition", () => {
  it("draws the thread and names the state the next section arrives in", () => {
    const { container } = render(<QRASectionTransition label="Organized" />);
    expect(container.querySelector("[data-transition-line]")).not.toBeNull();
    expect(container.querySelector("[data-transition-node]")).not.toBeNull();
    expect(screen.getByText("Organized")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("ProductPreview exchange", () => {
  it("exchanges answers rather than swapping them, keeping one tabpanel", async () => {
    render(<ProductPreview />);
    await userEvent.click(screen.getByRole("tab", { name: /Growth/ }));

    // One panel is live; the outgoing answer is stacked behind it and hidden.
    const panels = screen.getAllByRole("tabpanel");
    expect(panels).toHaveLength(1);
    const leaving = document.querySelector(".product-panel--leave");
    expect(leaving).not.toBeNull();
    expect(leaving).toHaveAttribute("aria-hidden", "true");
  });

  it("reveals the readings along the chart", async () => {
    const { container } = render(<ProductPreview />);
    await userEvent.click(screen.getByRole("tab", { name: /Financials/ }));
    expect(container.querySelectorAll(".chart-point").length).toBeGreaterThan(3);
  });
});
