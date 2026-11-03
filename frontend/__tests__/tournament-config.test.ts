/** Tournament configuration: prize reconciliation, formatting and the
 * "nothing unconfirmed is invented" rule. */

import {
  DEFAULT_TOURNAMENT_CONFIG,
  countdownParts,
  formatINR,
  shortRegistrationId,
  validatePrizeConfig,
} from "@/lib/tournament";

describe("prize pool", () => {
  it("declares the confirmed ₹1,00,000 pool", () => {
    expect(DEFAULT_TOURNAMENT_CONFIG.prize_pool_total).toBe(100_000);
    expect(DEFAULT_TOURNAMENT_CONFIG.cash_prize_pool).toBe(60_000);
    expect(DEFAULT_TOURNAMENT_CONFIG.goodies_and_merchandise).toBe(40_000);
  });

  it("splits the cash pool into 25k / 15k / 10k / 10×1k", () => {
    const config = DEFAULT_TOURNAMENT_CONFIG;
    expect(config.champion_prize).toBe(25_000);
    expect(config.first_runner_up_prize).toBe(15_000);
    expect(config.second_runner_up_prize).toBe(10_000);
    expect(config.merit_prize_count).toBe(10);
    expect(config.merit_prize_amount).toBe(1_000);
    expect(config.merit_prize_total).toBe(10_000);
  });

  it("reconciles by default", () => {
    expect(validatePrizeConfig(DEFAULT_TOURNAMENT_CONFIG)).toEqual([]);
  });

  it("flags a cash pool that does not add up", () => {
    const errors = validatePrizeConfig({
      ...DEFAULT_TOURNAMENT_CONFIG,
      champion_prize: 30_000,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Cash prizes must sum/);
  });

  it("flags a merit block that does not add up", () => {
    const errors = validatePrizeConfig({
      ...DEFAULT_TOURNAMENT_CONFIG,
      merit_prize_total: 9_000,
    });
    expect(errors[0]).toMatch(/Merit prizes must reconcile/);
  });

  it("flags a total that does not equal cash + goodies", () => {
    const errors = validatePrizeConfig({
      ...DEFAULT_TOURNAMENT_CONFIG,
      prize_pool_total: 90_000,
    });
    expect(errors[0]).toMatch(/total prize pool/);
  });
});

describe("unconfirmed facts stay empty", () => {
  it("never invents dates, venue, eligibility or quotas", () => {
    expect(DEFAULT_TOURNAMENT_CONFIG.event_starts_at).toBeNull();
    expect(DEFAULT_TOURNAMENT_CONFIG.registration_closes_at).toBeNull();
    expect(DEFAULT_TOURNAMENT_CONFIG.venue).toBeNull();
    expect(DEFAULT_TOURNAMENT_CONFIG.eligibility).toBeNull();
    expect(DEFAULT_TOURNAMENT_CONFIG.competition_format).toBeNull();
    expect(DEFAULT_TOURNAMENT_CONFIG.final_round_info).toBeNull();
  });

  it("states that qualifying-round guidelines are pending", () => {
    expect(DEFAULT_TOURNAMENT_CONFIG.qualifying_round_info).toMatch(/announced soon/i);
  });

  it("records the confirmed participation model", () => {
    expect(DEFAULT_TOURNAMENT_CONFIG.participation_type).toBe("Individual");
    expect(DEFAULT_TOURNAMENT_CONFIG.qualifying_format).toBe("College-level qualifying rounds");
    expect(DEFAULT_TOURNAMENT_CONFIG.location_context).toBe("Mumbai");
  });
});

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(100_000)).toBe("₹1,00,000");
    expect(formatINR(1_000)).toBe("₹1,000");
    expect(formatINR(500)).toBe("₹500");
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(12_34_567)).toBe("₹12,34,567");
  });

  it("handles null safely", () => {
    expect(formatINR(null)).toBe("—");
  });
});

describe("registration ids", () => {
  it("compacts a UUID into a readable badge id", () => {
    const compacted = shortRegistrationId("01a1a1d4-1111-2222-3333-444455556666");
    expect(compacted).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{6}$/);
  });

  it("passes through an already-short id", () => {
    expect(shortRegistrationId("MTT-4KQ8ZP")).toBe("MTT-4KQ8ZP");
  });
});

describe("countdown", () => {
  it("is null when no date is configured", () => {
    expect(countdownParts(null)).toBeNull();
  });

  it("counts down to a configured future date", () => {
    const future = new Date(Date.now() + 2 * 86_400_000 + 3_600_000).toISOString();
    const parts = countdownParts(future);
    expect(parts).not.toBeNull();
    expect(parts?.days).toBe(2);
    expect(parts?.elapsed).toBe(false);
  });

  it("marks an elapsed date instead of counting into negatives", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const parts = countdownParts(past);
    expect(parts?.elapsed).toBe(true);
    expect(parts?.days).toBe(0);
  });
});
