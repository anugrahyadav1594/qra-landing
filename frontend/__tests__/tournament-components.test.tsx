/** Component-level tests for the tournament surfaces. */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollegeWall } from "@/components/tournament/CollegeWall";
import { Leaderboard } from "@/components/tournament/Leaderboard";
import { PrizePool } from "@/components/tournament/PrizePool";
import { EventDetails } from "@/components/tournament/EventDetails";
import { SponsorWall } from "@/components/tournament/SponsorWall";
import { TournamentFAQ } from "@/components/tournament/TournamentFAQ";
import { TournamentTimeline } from "@/components/tournament/TournamentTimeline";
import {
  DEFAULT_TOURNAMENT_CONFIG,
  type College,
  type Sponsor,
  type TournamentConfig,
} from "@/lib/tournament";

const config: TournamentConfig = { ...DEFAULT_TOURNAMENT_CONFIG };

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
  if (!("IntersectionObserver" in window)) {
    // @ts-expect-error minimal test double
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe("PrizePool", () => {
  it("shows the champion prize as the centrepiece of a ₹1,00,000 pool", () => {
    render(<PrizePool config={config} />);
    expect(screen.getByText("₹25,000")).toBeInTheDocument();
    expect(screen.getByText("₹15,000")).toBeInTheDocument();
    // ₹10,000 appears twice by design: second runner-up and the merit block.
    expect(screen.getAllByText("₹10,000").length).toBeGreaterThanOrEqual(2);
    // The total appears in the header and again in the reconciliation line.
    expect(screen.getAllByText("₹1,00,000").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Champion")).toBeInTheDocument();
    expect(screen.getByText("First Runner-up")).toBeInTheDocument();
    expect(screen.getByText("Second Runner-up")).toBeInTheDocument();
  });

  it("shows the merit block as 10 × ₹1,000", () => {
    render(<PrizePool config={config} />);
    expect(screen.getByText("10 winners × ₹1,000")).toBeInTheDocument();
  });

  it("reflects a reconfigured prize pool", () => {
    render(<PrizePool config={{ ...config, champion_prize: 40_000, cash_prize_pool: 75_000, prize_pool_total: 115_000 }} />);
    expect(screen.getAllByText("₹40,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹1,15,000").length).toBeGreaterThanOrEqual(1);
  });
});

describe("TournamentTimeline", () => {
  it("states the confirmed individual + college-qualifier structure", () => {
    render(<TournamentTimeline config={config} />);
    expect(screen.getByText("Register individually")).toBeInTheDocument();
    expect(screen.getByText("Select your onboarded college")).toBeInTheDocument();
    expect(screen.getByText("College-level qualifying rounds")).toBeInTheDocument();
  });

  it("marks unconfirmed steps as to be announced instead of inventing rules", () => {
    render(<TournamentTimeline config={config} />);
    const pending = screen.getAllByText("To be announced");
    expect(pending.length).toBeGreaterThan(0);
    expect(screen.queryByText(/trading capital/i)).toBeNull();
  });
});

describe("CollegeWall", () => {
  it("renders a real empty state when no college is onboarded", () => {
    render(<CollegeWall colleges={[]} />);
    expect(screen.getByText(/College onboarding is in progress/i)).toBeInTheDocument();
  });

  it("lists onboarded colleges with their location", () => {
    const colleges: College[] = [
      {
        id: "c1",
        name: "Institute of Chemical Technology",
        location: "Mumbai",
        logo_url: null,
        description: null,
        is_active: true,
        accepts_registrations: true,
      },
    ];
    render(<CollegeWall colleges={colleges} />);
    expect(screen.getByText("Institute of Chemical Technology")).toBeInTheDocument();
    expect(screen.getByText("1 college onboarded")).toBeInTheDocument();
  });
});

describe("Leaderboard", () => {
  it("shows the pre-event state until results exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ enabled: false, updated_at: null, entries: [] }),
        json: async () => ({ enabled: false, updated_at: null, entries: [] }),
      }),
    );
    render(<Leaderboard />);
    await waitFor(() => expect(screen.getByText(/The arena is waiting/i)).toBeInTheDocument());
    expect(screen.getByText(/once the competition begins/i)).toBeInTheDocument();
  });

  it("renders real standings when the backend publishes them", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            enabled: true,
            updated_at: null,
            entries: [
              {
                id: "l1",
                rank: 1,
                display_name: "A. Sharma",
                college_name: "VJTI",
                score: 87.5,
                qualification_status: "qualified",
              },
            ],
          }),
        json: async () => ({
          enabled: true,
          updated_at: null,
          entries: [
            {
              id: "l1",
              rank: 1,
              display_name: "A. Sharma",
              college_name: "VJTI",
              score: 87.5,
              qualification_status: "qualified",
            },
          ],
        }),
      }),
    );
    render(<Leaderboard />);
    await waitFor(() => expect(screen.getByText("A. Sharma")).toBeInTheDocument());
    expect(screen.getByText("VJTI")).toBeInTheDocument();
  });
});

describe("TournamentFAQ", () => {
  it("answers the individual-participation question", async () => {
    render(<TournamentFAQ config={config} />);
    const question = screen.getByText("Do I register as a team or as an individual?");
    expect(question).toBeInTheDocument();
    await userEvent.click(question);
    expect(screen.getByText(/Individually\./)).toBeInTheDocument();
  });

  it("states that no fee has been announced", async () => {
    render(<TournamentFAQ config={config} />);
    const question = screen.getByText("Is there a registration fee?");
    await userEvent.click(question);
    expect(screen.getByText(/No registration fee has been announced/)).toBeInTheDocument();
  });

  it("does not claim a date or venue before they are confirmed", async () => {
    render(<TournamentFAQ config={config} />);
    const question = screen.getByText("When and where is the tournament?");
    await userEvent.click(question);
    expect(screen.getByText(/have not been announced yet/)).toBeInTheDocument();
  });
});

/* ── Phase 1 redesign: the redesigned sections keep the same facts ────── */

describe("PrizePool — allocation", () => {
  it("shows the derived 60 / 40 cash-to-goodies split", () => {
    render(<PrizePool config={config} />);
    expect(screen.getByText(/^60\s*%$/)).toBeInTheDocument();
    expect(screen.getByText(/^40\s*%$/)).toBeInTheDocument();
    expect(screen.getByText("Cash prizes")).toBeInTheDocument();
    expect(screen.getByText("Goodies")).toBeInTheDocument();
  });

  it("reconciles cash + goodies back to the declared total", () => {
    render(<PrizePool config={config} />);
    expect(screen.getByText(/₹60,000 cash \+ ₹40,000 goodies =/)).toBeInTheDocument();
  });

  it("renders the merit block as ten markers", () => {
    const { container } = render(<PrizePool config={config} />);
    const markers = container.querySelectorAll(".mtt-bar, span[style*='height']");
    expect(markers.length).toBeGreaterThanOrEqual(10);
  });
});

describe("TournamentTimeline — journey", () => {
  it("renders all seven stages with their index", () => {
    render(<TournamentTimeline config={config} />);
    for (const index of ["01", "02", "03", "04", "05", "06", "07"]) {
      expect(screen.getAllByText(index).length).toBeGreaterThan(0);
    }
  });

  it("reports how much of the structure is confirmed", () => {
    render(<TournamentTimeline config={config} />);
    expect(screen.getAllByText("04").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("/07")).toBeInTheDocument();
  });

  it("marks the qualifying, progression and final rounds as pending", () => {
    render(<TournamentTimeline config={config} />);
    // 3 of the 7 stages are still awaiting announcement (+ the legend key).
    expect(screen.getAllByText("To be announced").length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText("Confirmed").length).toBeGreaterThanOrEqual(4);
  });
});

describe("CollegeWall — campus network", () => {
  it("offers an institution enquiry action in the empty state", () => {
    render(<CollegeWall colleges={[]} />);
    expect(screen.getByRole("link", { name: /are you a college\? talk to us/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("never invents an institution name or a college count", () => {
    render(<CollegeWall colleges={[]} />);
    expect(screen.getByText("The arena is expanding")).toBeInTheDocument();
    expect(screen.queryByText(/colleges onboarded/i)).toBeNull();
  });

  it("lists real colleges with an onboarded marker", () => {
    const colleges: College[] = [
      { id: "a1", name: "VJTI", location: "Mumbai", logo_url: null, description: null, is_active: true, accepts_registrations: true },
      { id: "b2", name: "SPIT", location: "Mumbai", logo_url: null, description: null, is_active: true, accepts_registrations: true },
    ];
    render(<CollegeWall colleges={colleges} />);
    expect(screen.getByText("VJTI")).toBeInTheDocument();
    expect(screen.getByText("SPIT")).toBeInTheDocument();
    // One marker per tile, plus the network status label.
    expect(screen.getAllByText("Onboarded").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("2 colleges onboarded")).toBeInTheDocument();
  });
});

describe("EventDetails — briefing board", () => {
  it("states that the date is not set instead of running a fake countdown", () => {
    render(<EventDetails config={config} />);
    expect(screen.getByText(/The date is not set yet/)).toBeInTheDocument();
    expect(screen.getByText("Date not set")).toBeInTheDocument();
  });

  it("lists every briefing field and marks the unconfirmed ones", () => {
    render(<EventDetails config={config} />);
    for (const label of [
      "Event date",
      "Registrations open",
      "Registrations close",
      "Venue",
      "Eligibility",
      "Competition format",
      "Qualifying rounds",
      "Final round",
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    }
    // Every field the organisers have not filled in is marked, none is guessed.
    const unannounced = [
      "event_starts_at",
      "registration_opens_at",
      "registration_closes_at",
      "venue",
      "eligibility",
      "competition_format",
      "qualifying_round_info",
      "final_round_info",
    ].filter((field) => !(config as unknown as Record<string, unknown>)[field]);
    expect(screen.getAllByText("To be announced")).toHaveLength(unannounced.length);
  });

  it("shows a real countdown only when a date exists", async () => {
    const future = new Date(Date.now() + 3 * 86_400_000).toISOString();
    render(<EventDetails config={{ ...config, event_starts_at: future }} />);
    expect(screen.getByText("Countdown to the arena")).toBeInTheDocument();
    expect(screen.getByText("Days")).toBeInTheDocument();
    expect(screen.getByText("Seconds")).toBeInTheDocument();
  });
});

describe("TournamentFAQ — editorial accordion", () => {
  it("groups questions into categories", () => {
    render(<TournamentFAQ config={config} />);
    for (const category of ["Registration", "Participation", "Colleges", "Competition", "Prizes", "Event information"]) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it("keeps every original question", () => {
    render(<TournamentFAQ config={config} />);
    for (const question of [
      "Who can participate?",
      "Do I register as a team or as an individual?",
      "Which colleges can I select?",
      "What if my college is not on the list yet?",
      "Is there a registration fee?",
      "How does the qualifying round work?",
      "What is the prize pool?",
      "When and where is the tournament?",
      "Does registering guarantee me a slot?",
    ]) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it("exposes expanded state and panel association for assistive tech", async () => {
    render(<TournamentFAQ config={config} />);
    const trigger = screen.getByRole("button", {
      name: /do i register as a team or as an individual\?/i,
    });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("data-open", "true");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("data-open", "false");
  });

  it("opens a question by keyboard activation", async () => {
    render(<TournamentFAQ config={config} />);
    const trigger = screen.getByRole("button", { name: /what is the prize pool\?/i });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("supports a stacked layout for the dedicated FAQ route", () => {
    const { container } = render(<TournamentFAQ config={config} layout="stacked" />);
    expect(container.querySelector(".lg\\:grid-cols-12")).toBeNull();
  });
});

describe("SponsorWall — partner exhibition", () => {
  it("shows a designed empty state with a partnership enquiry", () => {
    render(<SponsorWall sponsors={[]} />);
    expect(screen.getByText("Partnerships are being finalised")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /partnership enquiries/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("never invents a partner name", () => {
    const { container } = render(<SponsorWall sponsors={[]} />);
    expect(container.textContent).not.toMatch(/presented by|official partner of|title sponsor:/i);
  });

  it("groups confirmed partners by their configured tier", () => {
    const sponsors: Sponsor[] = [
      { id: "s1", name: "Alpha Capital", logo_url: null, website_url: "https://example.com", category: "title_sponsor", display_order: 0, is_active: true },
      { id: "s2", name: "Beta Systems", logo_url: null, website_url: null, category: "associate_sponsor", display_order: 1, is_active: true },
    ];
    render(<SponsorWall sponsors={sponsors} />);
    // The name appears in the frame and again in the tile caption.
    expect(screen.getAllByText("Alpha Capital").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Beta Systems").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Title Sponsor")).toBeInTheDocument();
    expect(screen.getByText("Associate Sponsor")).toBeInTheDocument();
  });
});
