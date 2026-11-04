/**
 * The Championship Prize Arena: layered environment, replaceable artwork
 * configuration and the exact allocation values.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrizePool } from "@/components/tournament/PrizePool";
import { DEFAULT_TOURNAMENT_CONFIG } from "@/lib/tournament";

const ROOT = resolve(__dirname, "..");

describe("Prize arena — layered environment", () => {
  it("renders the five background layers in front-to-back DOM order", () => {
    const { container } = render(<PrizePool config={DEFAULT_TOURNAMENT_CONFIG} />);
    const section = container.querySelector("#prize-pool");
    expect(section).toBeTruthy();

    const layers = ["fallback", "artwork", "veil", "light", "grid"].map((name) => {
      const node = container.querySelector(`.mtt-prize-${name}`);
      expect(node, `layer .mtt-prize-${name}`).toBeTruthy();
      return node as Element;
    });

    const order = [...layers].map((node) =>
      Array.prototype.indexOf.call(
        (section as Element).querySelectorAll("*"),
        node,
      ),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));

    // Content sits above every atmospheric layer.
    const content = container.querySelector(".mtt-prize .relative.z-10");
    expect(content).toBeTruthy();
    const contentIndex = Array.prototype.indexOf.call(
      (section as Element).querySelectorAll("*"),
      content,
    );
    expect(contentIndex).toBeGreaterThan(order[order.length - 1]);
  });

  it("keeps the artwork path in a single configuration location", () => {
    const css = readFileSync(resolve(ROOT, "app/globals.css"), "utf8");
    // Exactly one declaration consumes the asset; the other mention is a comment.
    const declarations = css.match(/url\("[^"]*mtt-prize-background\.png"\)/g) ?? [];
    expect(declarations).toHaveLength(1);
    expect(css).toContain("--mtt-prize-artwork:");

    // Components reference the layer, never the filename.
    const component = readFileSync(
      resolve(ROOT, "components/tournament/PrizePool.tsx"),
      "utf8",
    );
    expect(component).not.toMatch(/mtt-prize-background/);
  });

  it("documents the asset location for the person dropping the file in", () => {
    const readme = readFileSync(resolve(ROOT, "public/images/README.md"), "utf8");
    expect(readme).toContain("mtt-prize-background.png");
    expect(readme).toMatch(/webp|avif/i);
  });
});

describe("Prize arena — allocation accuracy", () => {
  it("renders the exact split and every statutory amount", () => {
    const config = DEFAULT_TOURNAMENT_CONFIG;
    const { container } = render(<PrizePool config={config} />);
    const text = container.textContent ?? "";

    expect(text).toContain("₹1,00,000");
    expect(text).toContain("₹60,000");
    expect(text).toContain("₹40,000");
    expect(text).toContain("₹25,000");
    expect(text).toContain("₹15,000");
    expect(text).toContain("₹10,000");
    expect(text).toContain(`${config.merit_prize_count} winners × ₹1,000`);

    // Exact reconciliation line, with the total in the same statement.
    expect(text).toContain("₹60,000 cash + ₹40,000 goodies = ");
    expect(text).toContain("Verified");
  });

  it("derives the allocation bar from the configured figures", () => {
    const { container } = render(<PrizePool config={DEFAULT_TOURNAMENT_CONFIG} />);
    const cash = container.querySelector<HTMLElement>('[data-prize-bar="cash"]');
    const goodies = container.querySelector<HTMLElement>('[data-prize-bar="goodies"]');
    expect(cash?.style.width).toBe("60%");
    expect(goodies?.style.width).toBe("40%");
  });

  it("gives the champion the tallest plinth and the centre place", () => {
    const { container } = render(<PrizePool config={DEFAULT_TOURNAMENT_CONFIG} />);
    const plinths = Array.from(container.querySelectorAll<HTMLElement>("[data-podium-block]"));
    expect(plinths).toHaveLength(3);
    const champion = plinths.find((node) => node.dataset.podiumBlock === "1");
    expect(champion?.className).toContain("sm:h-24");
    expect(container.querySelector('[data-podium-card="1"]')?.className).toContain("sm:order-2");
  });

  it("labels all ten merit markers and never ranks them", () => {
    const { container } = render(<PrizePool config={DEFAULT_TOURNAMENT_CONFIG} />);
    const markers = container.querySelectorAll("[data-merit-marker]");
    expect(markers).toHaveLength(10);
    const labels = Array.from(markers).map((marker) => marker.textContent?.trim());
    expect(labels).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
  });
});
