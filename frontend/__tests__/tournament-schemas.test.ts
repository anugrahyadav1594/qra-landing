/** Registration validation mirrors the backend Pydantic contract. */

import { mobileSchema, tournamentRegistrationSchema } from "@/lib/schemas";

const valid = {
  full_name: "Aarav Sharma",
  email: "student@example.edu",
  mobile: "9876543210",
  college_id: "college-uuid",
};

describe("mobileSchema", () => {
  it("accepts a 10-digit Indian mobile", () => {
    expect(mobileSchema.parse("9876543210")).toBe("9876543210");
  });

  it("strips spaces, dashes and the +91 country code", () => {
    expect(mobileSchema.parse("+91 98765 43210")).toBe("9876543210");
    expect(mobileSchema.parse("98765-43210")).toBe("9876543210");
  });

  it("rejects numbers that are too short", () => {
    expect(mobileSchema.safeParse("12345").success).toBe(false);
  });
});

describe("tournamentRegistrationSchema", () => {
  it("accepts a complete entry", () => {
    const result = tournamentRegistrationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("requires a full name", () => {
    const result = tournamentRegistrationSchema.safeParse({ ...valid, full_name: " A " });
    expect(result.success).toBe(false);
  });

  it("requires a college from the onboarded list", () => {
    const result = tournamentRegistrationSchema.safeParse({ ...valid, college_id: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/onboarded list/i);
    }
  });

  it("rejects an invalid email", () => {
    const result = tournamentRegistrationSchema.safeParse({ ...valid, email: "nope" });
    expect(result.success).toBe(false);
  });

  it("normalises the mobile number it forwards to the API", () => {
    const parsed = tournamentRegistrationSchema.parse({ ...valid, mobile: "+91 98765 43210" });
    expect(parsed.mobile).toBe("9876543210");
  });

  it("treats course, year and city as optional", () => {
    const result = tournamentRegistrationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
