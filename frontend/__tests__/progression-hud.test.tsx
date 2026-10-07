/* The progression HUD: the level map on the right edge.
 *
 * What is worth pinning is that it maps the real sections, that each node goes
 * somewhere, and that it stays off pages with nothing to descend. */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QRAProgressRail } from "@/components/motion/QRAProgressRail";
import { HOME_SECTIONS, SECTION_LABELS } from "@/lib/constants";

/* The rail only mounts on the homepage, so the pathname has to be controllable. */
let pathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

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
