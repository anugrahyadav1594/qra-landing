/* ProductPreview: the interactive product experience. The tab interface must
 * behave accessibly (roles, keyboard) and the source marker must attach to
 * whichever explanation is on screen. */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProductPreview } from "@/components/ProductPreview";
import { PRODUCT } from "@/lib/content";

describe("ProductPreview", () => {
  it("shows the first question with its explanation and an illustrative note", () => {
    render(<ProductPreview />);
    expect(screen.getByRole("tab", { name: /Business/ })).toHaveAttribute("aria-selected", "true");
    const panel = within(screen.getByRole("tabpanel"));
    expect(panel.getByText(PRODUCT.tabs[0].question)).toBeInTheDocument();
    expect(panel.getByText(PRODUCT.tabs[0].summary[0])).toBeInTheDocument();
    expect(screen.getByText(/Illustrative example/i)).toBeInTheDocument();
  });

  it("switches the explanation when another question is selected", async () => {
    render(<ProductPreview />);
    const financials = screen.getByRole("tab", { name: /Financials/ });
    await userEvent.click(financials);

    expect(financials).toHaveAttribute("aria-selected", "true");
    const panel = within(screen.getByRole("tabpanel"));
    expect(panel.getByText(PRODUCT.tabs[1].question)).toBeInTheDocument();
    // the financials view is the one that carries example metrics
    expect(panel.getByText("Revenue")).toBeInTheDocument();
  });

  it("opens and closes the source behind the current explanation", async () => {
    render(<ProductPreview />);
    const sourceToggle = screen.getByRole("button", { name: /See the source/i });
    expect(sourceToggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(sourceToggle);
    expect(screen.getByRole("button", { name: /Hide source/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText(PRODUCT.tabs[0].source.detail)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Hide source/i }));
    expect(screen.queryByText(PRODUCT.tabs[0].source.detail)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /See the source/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("moves between questions with the arrow keys", async () => {
    render(<ProductPreview />);
    const business = screen.getByRole("tab", { name: /Business/ });
    business.focus();
    await userEvent.keyboard("{ArrowDown}");

    const financials = screen.getByRole("tab", { name: /Financials/ });
    expect(financials).toHaveAttribute("aria-selected", "true");
    expect(financials).toHaveFocus();
  });
});
