/** Client validation mirrors the backend contract (shared source of truth
 * discipline — §18.1). */

import { applySchema, emailSchema, feedbackSchema, waitlistSchema } from "@/lib/schemas";

describe("emailSchema", () => {
  it("accepts valid emails and trims whitespace", () => {
    expect(emailSchema.parse("  Ada@Example.com ")).toBe("Ada@Example.com");
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("").success).toBe(false);
  });
});

describe("waitlistSchema", () => {
  const valid = { email: "a@example.com", consentWaitlistContact: true };

  it("accepts a valid payload", () => {
    expect(waitlistSchema.safeParse(valid).success).toBe(true);
  });

  it("requires waitlist-contact consent", () => {
    const result = waitlistSchema.safeParse({ ...valid, consentWaitlistContact: false });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/consent/i);
  });
});

describe("feedbackSchema", () => {
  it("enforces the 10-character minimum", () => {
    const result = feedbackSchema.safeParse({ message: "short" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/10/);
  });

  it("rejects bad contact emails", () => {
    const result = feedbackSchema.safeParse({
      message: "long enough message here",
      contactEmail: "nope",
    });
    expect(result.success).toBe(false);
  });
});

describe("applySchema", () => {
  const valid = { name: "Ada", email: "ada@example.com", consent: true };

  it("accepts a valid payload", () => {
    expect(applySchema.safeParse(valid).success).toBe(true);
  });

  it("requires consent", () => {
    const result = applySchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });
});
