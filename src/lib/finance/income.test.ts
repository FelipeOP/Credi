import { describe, expect, it } from "vitest";
import { calculateIncome } from "./income";
import type { IncomeInput } from "./types";

const input: IncomeInput = {
  desiredMonthlyIncome: 10,
  annualRate: (1.01 ** 12 - 1) * 100,
  initialCapital: 0,
  monthlyContribution: 100,
  maximumMonths: 24,
  assetKind: "savings",
};

describe("monthly income goals", () => {
  it("targets capital from the monthly equivalent rather than annual / 12", () => {
    const result = calculateIncome(input);
    expect(result.requiredCapital).toBeCloseTo(1000, 1);
    expect(result.monthsToGoal).toBe(10);
    // Independent cash flows: B1=100, B2=201, B3=303.01; ten end-month deposits.
    expect(
      result.projection.rows.slice(0, 3).map((row) => row.balance),
    ).toEqual([100, 201, 303.01]);
    expect(result.projection.finalBalance).toBeCloseTo(
      100 * ((1.01 ** 10 - 1) / 0.01),
      1,
    );
    expect(result.milestones.map((value) => value.month)).toEqual([
      3, 5, 8, 10,
    ]);
    expect(result.projectedMonthlyIncome).toBeGreaterThanOrEqual(10);
    expect(result.shortfall).toBe(0);
  });
  it("reports an already reached goal today without fictitious future deposits", () => {
    const result = calculateIncome({ ...input, initialCapital: 2000 });
    expect(result.monthsToGoal).toBe(0);
    expect(result.projection.rows).toEqual([]);
    expect(result.projection.finalBalance).toBe(2000);
    expect(result.projectedMonthlyIncome).toBe(20);
    expect(result.milestones.every((value) => value.month === 0)).toBe(true);
  });
  it("keeps unmet goals explicit and aggregates partial-year flows correctly", () => {
    const result = calculateIncome({
      ...input,
      initialCapital: 100,
      monthlyContribution: 0,
      maximumMonths: 2,
    });
    expect(result.monthsToGoal).toBeNull();
    expect(result.projection.finalBalance).toBe(102.01);
    expect(result.projection.totalInterest).toBe(2.01);
    expect(result.projection.annualRows[0].balance).toBe(102.01);
    expect(result.projectedMonthlyIncome).toBe(1.02);
    expect(result.shortfall).toBeCloseTo(897.99, 1);
    expect(result.milestones.every((value) => value.month === null)).toBe(true);
  });
  it("does not manufacture growth with no capital and no deposits", () => {
    const result = calculateIncome({ ...input, monthlyContribution: 0 });
    expect(result.monthsToGoal).toBeNull();
    expect(result.projectedMonthlyIncome).toBe(0);
    expect(result.projection.finalBalance).toBe(0);
  });
  it.each([
    { annualRate: 0 },
    { annualRate: NaN },
    { desiredMonthlyIncome: 0 },
    { initialCapital: -1 },
    { monthlyContribution: -1 },
    { maximumMonths: 2.5 },
    { maximumMonths: 601 },
    { assetKind: "unknown" },
  ])(
    "rejects invalid inputs even when the goal is already met: %o",
    (invalid) => {
      expect(() =>
        calculateIncome({
          ...input,
          initialCapital: 100000,
          ...invalid,
        } as IncomeInput),
      ).toThrow();
    },
  );
  it("uses the same assumed scenario for each product without promising product cash flows", () => {
    for (const assetKind of ["cdt", "savings", "etf"] as const) {
      expect(calculateIncome({ ...input, assetKind }).monthsToGoal).toBe(10);
    }
  });
});
