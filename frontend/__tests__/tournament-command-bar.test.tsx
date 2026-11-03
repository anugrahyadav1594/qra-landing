/** MTT COMMAND BAR — structure, destinations, menu behaviour and a11y. */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { TOURNAMENT_LINKS, TournamentNavbar } from "@/components/tournament/TournamentNavbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/tournament",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

/** The command bar renders the real account control, so it needs the provider. */
function renderBar() {
  return render(
    <AuthProvider>
      <TournamentNavbar />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "{}",
      json: async () => ({}),
    }),
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      onchange: null,
      dispatchEvent: () => false,
    })),
  );
});

describe("TournamentNavbar — structure", () => {
  it("renders every navigation destination", () => {
    renderBar();
    for (const link of TOURNAMENT_LINKS) {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    }
  });

  it("keeps the existing link destinations", () => {
    const { container } = renderBar();
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/tournament");
    expect(hrefs).toContain("/tournament#prize-pool");
    expect(hrefs).toContain("/tournament/rules");
    expect(hrefs).toContain("/tournament/faq");
  });

  it("exposes the brand as a link to the tournament home", () => {
    renderBar();
    expect(screen.getByLabelText(/mumbai trading tournament — home/i)).toHaveAttribute(
      "href",
      "/tournament",
    );
  });

  it("keeps Register now as the primary action with its real destination", () => {
    renderBar();
    const cta = screen.getByRole("link", { name: /register now/i });
    expect(cta).toHaveAttribute("href", "/tournament/register");
  });

  it("keeps Sign in as a secondary action", () => {
    renderBar();
    expect(screen.getAllByRole("link", { name: /sign in/i }).length).toBeGreaterThan(0);
  });

  it("reserves fixed space so the compact scrolled state cannot shift the page", () => {
    const { container } = renderBar();
    const spacer = container.querySelector('[aria-hidden="true"]');
    expect((spacer as HTMLElement).style.height).toBe("80px");
  });
});

describe("TournamentNavbar — mobile menu", () => {
  it("is closed by default and labelled for assistive technology", () => {
    renderBar();
    const toggle = screen.getByRole("button", { name: /open tournament menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mtt-mobile-menu");
  });

  it("opens with a labelled dialog listing every destination", async () => {
    renderBar();
    await userEvent.click(screen.getByRole("button", { name: /open tournament menu/i }));
    const menu = await screen.findByRole("dialog", { name: /tournament navigation/i });
    expect(menu).toBeInTheDocument();
    for (const link of TOURNAMENT_LINKS) {
      expect(menu.textContent).toContain(link.label);
    }
  });

  it("closes when Escape is pressed", async () => {
    renderBar();
    const toggle = screen.getByRole("button", { name: /open tournament menu/i });
    await userEvent.click(toggle);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
