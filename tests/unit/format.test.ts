import { describe, expect, it } from "vitest";
import { formatPHP, formatSalaryRange, formatRating, formatVerificationStatus, formatMonthsRange } from "@/lib/utils/format";

describe("formatPHP", () => {
  it("formats an integer amount with the peso sign and thousands separators", () => {
    expect(formatPHP(25000)).toBe("₱25,000");
  });
});

describe("formatSalaryRange", () => {
  it("formats a full range", () => {
    expect(formatSalaryRange(20000, 35000)).toBe("₱20,000 – ₱35,000 / month");
  });

  it("handles missing values gracefully", () => {
    expect(formatSalaryRange(null, null)).toBe("Not yet estimated");
  });
});

describe("formatRating", () => {
  it("maps enum values to readable labels", () => {
    expect(formatRating("VERY_HIGH")).toBe("Very high");
    expect(formatRating(null)).toBe("Not yet rated");
  });
});

describe("formatVerificationStatus", () => {
  it("labels POC_SEED distinctly from VERIFIED", () => {
    expect(formatVerificationStatus("POC_SEED")).toBe("POC seed data");
    expect(formatVerificationStatus("VERIFIED")).toBe("Verified");
  });
});

describe("formatMonthsRange", () => {
  it("formats months under a year as months", () => {
    expect(formatMonthsRange(3, 6)).toBe("3 mo – 6 mo");
  });

  it("formats a single value range without a dash", () => {
    expect(formatMonthsRange(6, 6)).toBe("6 mo");
  });
});
