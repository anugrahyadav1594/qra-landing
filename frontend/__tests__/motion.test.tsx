/* The motion system: the opening sequence, the data field, and typographic
 * reveals. These run in jsdom, which has no canvas and no layout — which is
 * exactly the point: none of these components may throw or trap the page when
 * their drawing surface or their observer is unavailable. */

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  QRALoader,
  INTRO_ATTRIBUTE,
  INTRO_BOOTSTRAP,
  INTRO_HERO_DELAY,
  INTRO_MARK_DELAY,
  INTRO_STAGGER,
  INTRO_TIMING,
} from "@/components/motion/QRALoader";
import { Cursor, toneFor, type CursorTone } from "@/components/motion/Cursor";
import { ProductPreview } from "@/components/ProductPreview";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAArchitecture } from "@/components/motion/QRAArchitecture";
import { AudienceSection } from "@/components/home/AudienceSection";
import { QRASourceTicker } from "@/components/motion/QRASourceTicker";
import { QRATilt } from "@/components/motion/QRATilt";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { TextReveal } from "@/components/motion/TextReveal";
import { LOADER } from "@/lib/content";

const root = () => document.documentElement;

/* Resolved rather than assumed: the suite is normally run from `frontend`, but
   the repo root has a Makefile that could plausibly be pointed here too. */
const GLOBAL_CSS = ["app/globals.css", "frontend/app/globals.css"]
  .map((candidate) => path.resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));

/** The shipped stylesheet, as text. */
const stylesheet = () => readFileSync(GLOBAL_CSS ?? "", "utf8");

/**
 * The layer classes the stylesheet switches off on the reduced path.
 *
 * Read from the shipped CSS rather than restated here, so the assertion is
 * about what the site actually does.
 */
function reducedMotionHiddenLayers(): Set<string> {
  const css = stylesheet().replace(/\/\*[\s\S]*?\*\//g, "");
  const hidden = new Set<string>();
  // `replace` rather than `matchAll`: the suite is compiled at a target where
  // the string iterator is not iterable, and this reads the same either way.
  css.replace(/([^{}]+)\{([^{}]*)\}/g, (rule, selector: string, body: string) => {
    if (selector.includes('[data-mode="reduce"]') && /display:\s*none/.test(body)) {
      const names = selector.match(/\.qra-loader__[\w-]+/g) ?? [];
      for (const name of names) hidden.add(name.slice(1));
    }
    return rule;
  });
  return hidden;
}

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

    // The sequence timer fires at the end of the opening, well inside the hard
    // ceiling that exists only for a throttled tab.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, INTRO_TIMING.full + 120));
    });
    expect(sessionStorage.getItem("qra-loader-seen")).toBe("1");
    expect(root().getAttribute(INTRO_ATTRIBUTE)).toBeNull();
  }, 9000);

  it("stages the whole opening: light, structure, wordmark, then the parting", () => {
    root().setAttribute(INTRO_ATTRIBUTE, "play");
    const { container } = render(<QRALoader />);

    // The seam that splits, the bloom the mark comes out of, the sky behind it.
    expect(container.querySelectorAll(".qra-loader__beam")).toHaveLength(2);
    expect(container.querySelector(".qra-loader__bloom")).not.toBeNull();
    expect(container.querySelectorAll(".qra-loader__mote").length).toBeGreaterThan(10);

    // The structure: a shockwave, both rings, the turning dial, its graduations,
    // the axes, and a reading wherever the guides cross them.
    expect(container.querySelector(".qra-loader__shock")).not.toBeNull();
    expect(container.querySelectorAll(".qra-loader__ring")).toHaveLength(2);
    expect(container.querySelector(".qra-loader__dial")).not.toBeNull();
    expect(container.querySelectorAll(".qra-loader__tick").length).toBe(12);
    expect(container.querySelectorAll(".qra-loader__axis")).toHaveLength(2);
    expect(container.querySelectorAll(".qra-loader__point").length).toBe(8);

    // The mark is uncovered by an iris and crossed by one pass of light, and it
    // leaves for the navbar rather than dissolving.
    expect(container.querySelector(".qra-loader__logo-frame")).not.toBeNull();
    expect(container.querySelector(".qra-loader__sheen")).not.toBeNull();
    expect(container.querySelector(".qra-loader__handoff")).not.toBeNull();

    // The name is written through a bar of light, ruled, and supported by the
    // line the company is built on.
    expect(container.querySelector(".qra-loader__sweep")).not.toBeNull();
    expect(container.querySelector(".qra-loader__rule")).not.toBeNull();

    // And the ending is an opening: two halves, left and right.
    const curtains = container.querySelectorAll(".qra-loader__curtain");
    expect(curtains).toHaveLength(2);
  });

  it("hides every layer of the full sequence on the reduced path", () => {
    root().setAttribute(INTRO_ATTRIBUTE, "reduce");
    const { container } = render(<QRALoader />);

    // The layers are still in the markup — the reduced path is a stylesheet
    // decision, not a different tree. So the thing worth proving is that the
    // stylesheet accounts for all of them: every layer this component renders
    // is either part of the mark or switched off. A layer added later and not
    // added there would animate for someone who asked for no motion.
    const hidden = reducedMotionHiddenLayers();
    const isHidden = (element: Element) => {
      for (let node: Element | null = element; node; node = node.parentElement) {
        for (const name of Array.from(node.classList)) {
          // A modifier is switched off with its base class; a descendant is
          // switched off with its ancestor.
          if (hidden.has(name) || hidden.has(name.split("--")[0])) return true;
        }
      }
      return false;
    };

    const survivors = new Set(
      Array.from(container.querySelectorAll("[class*='qra-loader__']"))
        .filter((element) => !isHidden(element))
        .flatMap((element) => Array.from(element.classList))
        .map((name) => name.split("--")[0]),
    );

    expect(survivors).toEqual(
      // The stage is the wrapper the mark sits in, so it cannot be hidden too.
      new Set([
        "qra-loader__stage",
        "qra-loader__mark",
        "qra-loader__handoff",
        "qra-loader__logo-frame",
        "qra-loader__logo",
      ]),
    );
  });

  it("has the hero already rising when the screen starts to part", () => {
    // The ending reveals the hero, so the hero has to be mid-entrance across
    // the whole parting: started before the curtains move, and not finished
    // before they do. `.rise` is 900ms (var(--dur-cinematic)).
    const curtains = INTRO_TIMING.full * 0.82;
    const rise = 900;
    expect(INTRO_HERO_DELAY).toBeLessThan(curtains);
    expect(INTRO_HERO_DELAY).toBeGreaterThan(curtains - rise);
  });

  it("never leaves the overlay up past its own hard ceiling", () => {
    expect(INTRO_TIMING.timeout).toBeGreaterThan(INTRO_TIMING.full);
  });

  it("aims the handoff at the navbar mark it is going to become", () => {
    // jsdom has no layout, so give both ends of the flight a box: the navbar's
    // logo up and to the left, the loader's mark in the middle of the screen.
    const nav = document.createElement("a");
    nav.setAttribute("data-nav-logo", "");
    const navLogo = document.createElement("img");
    nav.appendChild(navLogo);
    document.body.appendChild(nav);

    const boxes = new Map<Element, { left: number; top: number; w: number; h: number }>();
    const spy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        const box = boxes.get(this) ?? { left: 0, top: 0, w: 0, h: 0 };
        return {
          left: box.left,
          top: box.top,
          width: box.w,
          height: box.h,
          right: box.left + box.w,
          bottom: box.top + box.h,
          x: box.left,
          y: box.top,
          toJSON: () => ({}),
        } as DOMRect;
      });

    vi.useFakeTimers();
    try {
      root().setAttribute(INTRO_ATTRIBUTE, "play");
      const { container } = render(<QRALoader />);
      const handoff = container.querySelector(".qra-loader__handoff") as HTMLElement;

      boxes.set(navLogo, { left: 24, top: 20, w: 88, h: 24 });
      boxes.set(handoff, { left: 678, top: 378, w: 44, h: 44 });

      // Measured at 40% of the sequence, before the flight begins at 72%.
      act(() => {
        vi.advanceTimersByTime(INTRO_TIMING.full * 0.4 + 10);
      });

      // Centre of the navbar logo (68, 32) minus centre of the mark (700, 400),
      // and the navbar's 24px against the loader's 44px.
      expect(handoff.style.getPropertyValue("--handoff-x")).toBe("-632px");
      expect(handoff.style.getPropertyValue("--handoff-y")).toBe("-368px");
      expect(handoff.style.getPropertyValue("--handoff-scale")).toBe("0.545");
    } finally {
      vi.useRealTimers();
      spy.mockRestore();
      nav.remove();
    }
  });

  it("leaves the handoff to the stylesheet when there is nothing to measure", () => {
    vi.useFakeTimers();
    try {
      root().setAttribute(INTRO_ATTRIBUTE, "play");
      const { container } = render(<QRALoader />);
      act(() => {
        vi.advanceTimersByTime(INTRO_TIMING.full * 0.4 + 10);
      });
      // No navbar mark on this page: no variables written, and the fallback
      // coordinates in the keyframe still land the mark somewhere sane.
      const handoff = container.querySelector(".qra-loader__handoff") as HTMLElement;
      expect(handoff.style.getPropertyValue("--handoff-x")).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Cursor", () => {
  beforeEach(() => {
    root().removeAttribute("data-cursor");
  });

  afterEach(() => {
    root().removeAttribute("data-cursor");
  });

  it("outranks every other layer, including the opening sequence", () => {
    // The bug this guards: the pointer sat at z-index 95, above the page and
    // below anything that portals into <body>. Over Clerk's sign-in, sign-up
    // and profile cards it was hidden by the modal while `cursor: none` still
    // applied inside it, which left those screens with no pointer at all.
    const css = stylesheet();
    const zIndexOf = (selector: string) => {
      // Matched at the start of a line, so a descendant selector that mentions
      // the same class cannot be mistaken for the rule itself.
      const at = css.search(new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"));
      expect(at).toBeGreaterThan(-1);
      const block = css.slice(at, css.indexOf("}", at));
      return Number(/z-index:\s*(\d+)/.exec(block)?.[1]);
    };

    const cursor = zIndexOf(".qra-cursor {");
    expect(cursor).toBeGreaterThan(zIndexOf(".qra-loader {"));
    // High enough that a library's own modal z-index cannot win by being
    // merely large.
    expect(cursor).toBeGreaterThan(100000);
  });

  it("renders the two parts the pointer is made of", () => {
    const { container } = render(<Cursor />);
    const layer = container.querySelector(".qra-cursor") as HTMLElement;
    expect(layer).not.toBeNull();
    // Decorative by definition: it must never be announced or clicked.
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer.querySelector(".qra-cursor__core")).not.toBeNull();
    expect(layer.querySelector(".qra-cursor__ring")).not.toBeNull();
  });

  it("does not take the arrow away when motion is reduced", () => {
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
      render(<Cursor />);
      // `cursor: none` hangs off this attribute, so with no attribute the
      // browser still draws its own arrow.
      expect(root().hasAttribute("data-cursor")).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });

  it("takes over the pointer, and gives it back when it unmounts", () => {
    const { unmount } = render(<Cursor />);
    // The site has one pointer from here, and `cursor: none` is what says so.
    expect(root().getAttribute("data-cursor")).toBe("custom");
    unmount();
    // And the arrow comes back. Without this the site would be left with no
    // pointer at all on any route that unmounts the layout.
    expect(root().hasAttribute("data-cursor")).toBe(false);
  });

  describe("tone", () => {
    const surface = (css: string, attrs: Record<string, string> = {}) => {
      const element = document.createElement("div");
      for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
      element.setAttribute("style", css);
      document.body.appendChild(element);
      return element;
    };

    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("inverts against the surface it is over", () => {
      const cache = new WeakMap<Element, CursorTone>();
      // This site is ink, so the default pointer is paper...
      expect(toneFor(surface("background-color: rgb(7, 10, 15)"), cache)).toBe("light");
      // ...and over a white panel the same pointer draws in ink.
      expect(toneFor(surface("background-color: rgb(255, 255, 255)"), cache)).toBe("dark");
      // Mid-grey sits on the dark side of the cut, which is where an uncertain
      // surface belongs: a light pointer survives it, a dark one does not.
      expect(toneFor(surface("background-color: rgb(120, 120, 120)"), cache)).toBe("light");
    });

    it("takes an explicit tone where a colour cannot describe the surface", () => {
      const cache = new WeakMap<Element, CursorTone>();
      // An image, a gradient or a video has no readable background colour, so
      // the surface names itself — and the pointer takes the opposite.
      expect(toneFor(surface("", { "data-cursor-tone": "light" }), cache)).toBe("dark");
      expect(toneFor(surface("", { "data-cursor-tone": "dark" }), cache)).toBe("light");
    });

    it("reads the surface through a transparent child", () => {
      const cache = new WeakMap<Element, CursorTone>();
      const parent = surface("background-color: rgb(255, 255, 255)");
      const child = document.createElement("span");
      parent.appendChild(child);
      // Most of what the pointer sits on has no background of its own; the
      // answer has to come from the surface behind it.
      expect(toneFor(child, cache)).toBe("dark");
    });

    it("falls back to a light pointer when there is nothing to read", () => {
      const cache = new WeakMap<Element, CursorTone>();
      expect(toneFor(null, cache)).toBe("light");
      expect(toneFor(surface("background-color: rgba(255, 255, 255, 0.2)"), cache)).toBe("light");
    });
  });
});

describe("QRAAtmosphere environments", () => {
  it("ships a poster for every looping position", () => {
    const { container } = render(<QRAAtmosphere variant="hero" />);
    const image = container.querySelector(".qra-atmosphere__image");
    // The poster is what reduced motion, slow connections and autoplay refusal
    // all land on, so it must be in the markup from the start.
    expect(image).toHaveAttribute("src", "/motion/hero-poster.webp");
  });

  it("falls back to a generated still for positions that do not carry a loop", () => {
    const { container } = render(<QRAAtmosphere variant="trust" />);
    expect(container.querySelector(".qra-atmosphere__image")).toHaveAttribute(
      "src",
      "/images/ai-trust.webp",
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

  it("scales its strength from the section it sits in", () => {
    const { container } = render(<QRAAtmosphere variant="trust" intensity={0.5} />);
    const layer = container.querySelector(".qra-atmosphere") as HTMLElement;
    // Half strength: subtle enough to sit behind copy, present enough to read as
    // texture rather than as a flat panel.
    const opacity = Number(layer.style.getPropertyValue("--atmosphere-opacity"));
    expect(opacity).toBeGreaterThan(0.15);
    expect(opacity).toBeLessThan(0.35);
  });
});

describe("QRASectionTransition", () => {
  it("names the state the next section arrives in", () => {
    render(<QRASectionTransition label="Organized" />);
    expect(screen.getByText("Organized")).toBeInTheDocument();
  });

  it("plays the rule from CSS, not from a scroll scene", () => {
    const { container } = render(<QRASectionTransition label="Organized" />);
    const root = container.querySelector(".qra-transition") as HTMLElement;
    // The attribute the stylesheet's draw animation hangs off. Where there is no
    // observer to wait for (as here), it is set straight away — the rule is
    // drawn rather than left at scaleX(0).
    expect(root).toHaveAttribute("data-drawn", "true");
    expect(container.querySelector(".qra-transition__line")).not.toBeNull();
    expect(container.querySelector(".qra-transition__node")).not.toBeNull();
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

  it("sets the page's three clocks so nothing arrives twice", () => {
    sessionStorage.clear();
    root().removeAttribute(INTRO_ATTRIBUTE);
    run();

    // The hero's cascade is compressed, or its last element would still be
    // invisible when the screen had finished opening.
    expect(root().style.getPropertyValue("--intro-stagger")).toBe(`${INTRO_STAGGER}`);
    expect(INTRO_STAGGER).toBeLessThan(1);

    // The navbar mark waits for the mark flying towards it. On the hero's clock
    // it would be fully visible before that mark arrived: two logos at once.
    expect(root().style.getPropertyValue("--intro-mark-delay")).toBe(`${INTRO_MARK_DELAY}ms`);
    expect(INTRO_MARK_DELAY).toBeGreaterThan(INTRO_HERO_DELAY);
    // ...and it is in place by the time the flight ends.
    expect(INTRO_MARK_DELAY).toBeLessThanOrEqual(INTRO_TIMING.full);
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

  it("replays on demand, even in a session that has already seen it", () => {
    // The opening is gated to one play per session, so anyone refining it needs
    // a way to see it again. Still never ahead of reduced motion.
    sessionStorage.setItem("qra-loader-seen", "1");
    root().removeAttribute(INTRO_ATTRIBUTE);
    window.history.replaceState({}, "", "/?intro");
    try {
      run();
      expect(root().getAttribute(INTRO_ATTRIBUTE)).toBe("play");
    } finally {
      window.history.replaceState({}, "", "/");
    }
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

describe("the architecture drawing", () => {
  it("draws structure as geometry rather than a simulation", () => {
    const { container } = render(<QRAArchitecture />);
    const svg = container.querySelector(".qra-architecture");
    expect(svg).toHaveAttribute("data-ready", "false");
    expect(container.querySelectorAll(".qra-architecture__spines line").length).toBe(6);
    expect(container.querySelector(".qra-architecture__pathway")).not.toBeNull();
  });
});

describe("the three paths", () => {
  it("stacks one pre-rendered layer per investor over the structure", () => {
    const { container } = render(<AudienceSection />);
    const layers = container.querySelectorAll(".qra-paths__layer--route");
    expect(layers).toHaveLength(3);
    expect(Array.from(layers).map((layer) => layer.getAttribute("src"))).toEqual([
      "/graphics/investor-beginner.svg",
      "/graphics/investor-curious.svg",
      "/graphics/investor-busy.svg",
    ]);
    expect(container.querySelector(".qra-paths__layer--structure")).toHaveAttribute(
      "src",
      "/graphics/investors-structure.svg",
    );
  });

  it("lights exactly one route at a time, and keeps only that one described", () => {
    const { container } = render(<AudienceSection />);
    const active = container.querySelectorAll(".qra-paths__layer--route[data-active='true']");
    expect(active).toHaveLength(1);
    // Only the lit route carries a description; the others are decorative.
    expect(active[0].getAttribute("alt")).toBeTruthy();
    const rest = container.querySelectorAll(".qra-paths__layer--route[data-active='false']");
    for (const layer of Array.from(rest)) {
      expect(layer).toHaveAttribute("alt", "");
    }
  });

  it("names the four nodes in HTML, not in the image", () => {
    const { container } = render(<AudienceSection />);
    const labels = container.querySelectorAll(".qra-paths__label");
    expect(labels).toHaveLength(4);
    expect(container.textContent).toContain("Plain language");
  });
});
