/* The motion system: the opening sequence, the data field, and typographic
 * reveals. These run in jsdom, which has no canvas and no layout — which is
 * exactly the point: none of these components may throw or trap the page when
 * their drawing surface or their observer is unavailable. */

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  QRALoader,
  INTRO_ATTRIBUTE,
  INTRO_BOOTSTRAP,
  INTRO_HERO_DELAY,
} from "@/components/motion/QRALoader";
import { ProductPreview } from "@/components/ProductPreview";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAArchitecture } from "@/components/motion/QRAArchitecture";
import { QRASourceTicker } from "@/components/motion/QRASourceTicker";
import { QRATilt } from "@/components/motion/QRATilt";
import { QRAProcessDiagram } from "@/components/motion/QRAProcessDiagram";
import { QRAReveal } from "@/components/motion/QRAReveal";
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

describe("QRAAtmosphere environments", () => {
  it("ships a poster for every looping position", () => {
    const { container } = render(<QRAAtmosphere variant="hero" />);
    const image = container.querySelector(".qra-atmosphere__image");
    // The poster is what reduced motion, slow connections and autoplay refusal
    // all land on, so it must be in the markup from the start.
    expect(image).toHaveAttribute("src", "/motion/hero-poster.webp");
  });

  it("falls back to the still for positions that do not carry a loop", () => {
    const { container } = render(<QRAAtmosphere variant="trust" />);
    expect(container.querySelector(".qra-atmosphere__image")).toHaveAttribute(
      "src",
      "/images/qra-trust.webp",
    );
    expect(container.querySelector("video")).toBeNull();
  });

  it("does not mount the loop until its section is close", () => {
    const { container } = render(<QRAAtmosphere variant="waitlist" />);
    // jsdom has no IntersectionObserver here, so this is the load-time shape:
    // a poster, and no decoder until the section approaches.
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector(".qra-atmosphere__image")).toHaveAttribute(
      "src",
      "/motion/waitlist-poster.webp",
    );
  });

  it("never mounts a video under reduced motion", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    try {
      const { container } = render(<QRAAtmosphere variant="hero" />);
      expect(container.querySelector("video")).toBeNull();
      expect(container.querySelector(".qra-atmosphere__image")).not.toBeNull();
    } finally {
      window.matchMedia = original;
    }
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
    expect(image).toHaveAttribute("src", "/motion/hero-poster.webp");
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

describe("reveal paths without an observer", () => {
  it("shows block reveals immediately when IntersectionObserver is unavailable", () => {
    // jsdom has no observer: the safe path is to show the content, never to
    // leave it hidden behind an animation that will not run.
    const { container } = render(<QRAReveal>Content</QRAReveal>);
    expect(container.firstElementChild).toHaveClass("is-visible");
  });

  it("keeps the environment visible when it cannot be observed", () => {
    const { container } = render(<QRAAtmosphere variant="problem" />);
    // The gating attribute is only ever written to pause motion; a page that
    // cannot observe keeps its image.
    expect(container.querySelector(".qra-atmosphere__image")).not.toBeNull();
  });
});

describe("opening sequence across navigation", () => {
  it("does not replay when the session has already seen it", () => {
    // Soft navigation re-renders the layout without the bootstrap having run
    // again: no attribute, no sequence.
    sessionStorage.setItem("qra-loader-seen", "1");
    const { container } = render(<QRALoader />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("intro bootstrap (runs before first paint)", () => {
  const run = () => new Function(INTRO_BOOTSTRAP)();
  const withReducedMotion = (run: () => void) => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    try {
      run();
    } finally {
      window.matchMedia = original;
    }
  };

  it("plays for a first visit, and delays the hero by the same amount", () => {
    sessionStorage.clear();
    root().removeAttribute(INTRO_ATTRIBUTE);
    root().style.removeProperty("--intro-delay");

    run();

    expect(root().getAttribute(INTRO_ATTRIBUTE)).toBe("play");
    // The hero waits for the sequence rather than being paused by it.
    expect(root().style.getPropertyValue("--intro-delay")).toBe(`${INTRO_HERO_DELAY}ms`);
  });

  it("skips on a later visit in the same session", () => {
    sessionStorage.setItem("qra-loader-seen", "1");
    root().removeAttribute(INTRO_ATTRIBUTE);
    run();
    expect(root().getAttribute(INTRO_ATTRIBUTE)).toBe("skip");
  });

  it("uses the quiet path when motion is not wanted", () => {
    sessionStorage.clear();
    root().removeAttribute(INTRO_ATTRIBUTE);
    withReducedMotion(run);
    expect(root().getAttribute(INTRO_ATTRIBUTE)).toBe("reduce");
  });
});

describe("product figures", () => {
  it("shows real values, formatted as the interface reads them", async () => {
    render(<ProductPreview />);
    await userEvent.click(screen.getByRole("tab", { name: /Financials/ }));

    // Indian-digit grouping, crore scale, and a margin with its decimal.
    expect(screen.getByText("₹1,24,300 Cr")).toBeInTheDocument();
    expect(screen.getByText("15.1%")).toBeInTheDocument();
  });

  it("changes the figures when the question changes", async () => {
    render(<ProductPreview />);
    await userEvent.click(screen.getByRole("tab", { name: /Financials/ }));
    expect(within(screen.getByRole("tabpanel")).getByText("₹1,24,300 Cr")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /Growth/ }));
    const panel = within(screen.getByRole("tabpanel"));
    expect(panel.getByText("6.2%")).toBeInTheDocument();
    // The outgoing answer is still leaving the frame, but it is not the live
    // one: the panel you read from carries only the current question's figures.
    expect(panel.queryByText("₹1,24,300 Cr")).not.toBeInTheDocument();
  });
});

describe("pre-rendered graphics", () => {
  it("names the three stages of the process route", () => {
    render(<QRAProcessDiagram />);
    for (const stage of ["Find", "Explain", "Understand"]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });

  it("draws the process route as one normalised path", () => {
    const { container } = render(<QRAProcessDiagram />);
    const route = container.querySelector("[data-route]");
    // pathLength=1 means progress is one number, and the plan underneath keeps
    // the whole route readable even before it is drawn.
    expect(route).toHaveAttribute("pathLength", "1");
    expect(container.querySelector(".qra-process__plan")).not.toBeNull();
  });

  it("draws the architecture as geometry rather than a simulation", () => {
    const { container } = render(<QRAArchitecture />);
    const svg = container.querySelector(".qra-architecture");
    expect(svg).toHaveAttribute("data-ready", "false");
    expect(container.querySelectorAll(".qra-architecture__spines line").length).toBe(6);
    expect(container.querySelector(".qra-architecture__pathway")).not.toBeNull();
  });
});

describe("the motion layer", () => {
  it("cascades children when asked, and stays a single reveal when not", () => {
    const { container: cascaded } = render(
      <QRAReveal stagger step={50}>
        <span>one</span>
        <span>two</span>
      </QRAReveal>,
    );
    const wrapper = cascaded.querySelector(".qra-reveal--stagger");
    expect(wrapper).not.toBeNull();
    expect((wrapper as HTMLElement).style.getPropertyValue("--step")).toBe("50ms");

    const { container: plain } = render(<QRAReveal>alone</QRAReveal>);
    expect(plain.querySelector(".qra-reveal--stagger")).toBeNull();
  });

  it("runs the sources band twice, so the loop has no seam", () => {
    const { container } = render(<QRASourceTicker />);
    const runs = container.querySelectorAll(".source-ticker__run");
    expect(runs).toHaveLength(2);
    expect(runs[0].children.length).toBe(runs[1].children.length);
    // Decorative here: the same sources are named in full further down the page.
    expect(container.querySelector(".source-ticker__track")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the tilt wrapper transparent to its content", () => {
    const { container } = render(
      <QRATilt>
        <div data-testid="panel">panel</div>
      </QRATilt>,
    );
    expect(container.querySelector(".qra-tilt__surface")).not.toBeNull();
    expect(container.querySelector("[data-testid='panel']")).not.toBeNull();
  });
});
