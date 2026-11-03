/** Component-level tests for the tournament surfaces. */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CollegeWall } from "@/components/tournament/CollegeWall";
import { Leaderboard } from "@/components/tournament/Leaderboard";
import { PrizePool } from "@/components/tournament/PrizePool";
import { TournamentFAQ } from "@/components/tournament/TournamentFAQ";
import { TournamentTimeline } from "@/components/tournament/TournamentTimeline";
import {
  DEFAULT_TOURNAMENT_CONFIG,
  type College,
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
