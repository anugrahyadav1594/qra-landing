/** The Markdown renderer is the §15.1 XSS tripwire for authored content:
 * it must render text, never inject raw HTML. */

import { render, screen } from "@testing-library/react";

import { Markdown } from "@/components/Markdown";

describe("Markdown", () => {
  it("renders headings, emphasis, lists and links", () => {
    render(
      <Markdown
        source={
          "Intro paragraph.\n\n### Heading\n- **bold item**\n- [a link](https://example.com)"
        }
      />,
    );
    expect(screen.getByText("Intro paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("bold item")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "a link" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  it("escapes raw HTML instead of rendering it", () => {
    const { container } = render(
      <Markdown source={'<script>alert("xss")</script> <img src=x onerror=alert(1)>'} />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    // the literal text is visible (escaped), not executed
    expect(container.textContent).toContain('<script>alert("xss")</script>');
  });

  it("renders nothing for empty input", () => {
    const { container } = render(<Markdown source="" />);
    expect(container.textContent).toBe("");
  });
});
