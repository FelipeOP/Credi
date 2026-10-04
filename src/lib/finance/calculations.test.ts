import { describe, expect, it } from "vitest";
import {
  calculateInvestment,
  calculateLoan,
  calculatePrepayment,
  inferMonthlyRate,
  monthlyRate,
} from "./calculations";
import { defaultLoan, defaultPrepayment } from "../defaults";

const centsClose = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThan(0.1);

describe("loan schedules", () => {
  it("handles zero-rate loans and the final rounding residue", () => {
    const result = calculateLoan({
      ...defaultLoan,
      principal: 100,
      annualRate: 0,
      months: 3,
    });
    expect(result.rows.map((row) => row.payment)).toEqual([
      33.33, 33.33, 33.34,
    ]);
    expect(result.totalPaid).toBe(100);
    expect(result.totalInterest).toBe(0);
    expect(result.rows.at(-1)?.balance).toBe(0);
  });
  it("matches an independent one-month nominal loan", () => {
    const result = calculateLoan({
      ...defaultLoan,
      principal: 1000,
      annualRate: 12,
      rateKind: "nominal",
      compoundingPeriods: 12,
      months: 1,
    });
    expect(result.rows[0]).toMatchObject({
      interest: 10,
      principal: 1000,
      payment: 1010,
      balance: 0,
    });
  });
  it("uses compound equivalence for effective annual rates", () => {
    expect(monthlyRate(12).toNumber()).toBeCloseTo(
      Math.pow(1.12, 1 / 12) - 1,
      12,
    );
    expect(monthlyRate(12, "nominal", 12).toNumber()).toBeCloseTo(0.01, 12);
  });
  it("uses monthly arrears directly and reconciles all equivalent rate units", () => {
    const input = {
      ...defaultLoan,
      principal: 1000,
      rateKind: "monthly" as const,
      monthlyRate: 2,
      months: 1,
    };
    expect(calculateLoan(input).rows[0]).toMatchObject({
      interest: 20,
      payment: 1020,
      balance: 0,
    });
    const monthly = calculateLoan({ ...input, months: 24 });
    const nominal = calculateLoan({
      ...input,
      rateKind: "nominal",
      annualRate: 24,
      months: 24,
    });
    const effective = calculateLoan({
      ...input,
      rateKind: "effective",
      annualRate: (1.02 ** 12 - 1) * 100,
      months: 24,
    });
    expect(monthly.rows).toEqual(nominal.rows);
    expect(monthly.rows).toEqual(effective.rows);
    expect(calculateLoan({ ...input, monthlyRate: 0 }).totalInterest).toBe(0);
    expect(() => calculateLoan({ ...input, monthlyRate: undefined })).toThrow();
    expect(() => calculateLoan({ ...input, monthlyRate: 21 })).toThrow();
  });
  it("reconciles capital, payments, interest and annual closing balances", () => {
    const result = calculateLoan({ ...defaultLoan, months: 25 });
    centsClose(result.totalPrincipal, defaultLoan.principal);
    centsClose(result.totalPaid, result.totalPrincipal + result.totalInterest);
    expect(result.annualRows).toHaveLength(3);
    expect(result.annualRows[0].balance).toBe(result.rows[11].balance);
    expect(result.annualRows[2].balance).toBe(0);
  });
  it("rejects invalid and missing inputs", () => {
    expect(() => calculateLoan({ ...defaultLoan, principal: NaN })).toThrow();
    expect(() => calculateLoan({ ...defaultLoan, months: 1.5 })).toThrow();
    expect(() => calculateLoan({ ...defaultLoan, annualRate: -1 })).toThrow();
  });
});

describe("prepayment comparisons", () => {
  it("uses monthly arrears in both future scenarios of an active loan", () => {
    const input = {
      ...defaultPrepayment,
      monthsPaid: 8,
      endMonth: 16,
      monthlyRate: 2,
    };
    const monthly = calculatePrepayment({ ...input, rateKind: "monthly" });
    const annual = calculatePrepayment({
      ...input,
      rateKind: "nominal",
      annualRate: 24,
    });
    expect(monthly.baseline.rows).toEqual(annual.baseline.rows);
    expect(monthly.adjusted.rows).toEqual(annual.adjusted.rows);
    expect(monthly.baseline.rows[0].month).toBe(9);
  });
  it("matches the reference with its implied rate and beginning-of-period convention", () => {
    const result = calculatePrepayment({
      ...defaultPrepayment,
      rateSource: "bankPayment",
      timing: "start",
    });
    expect(inferMonthlyRate(29300000, 1565535, 24).toNumber()).toBeCloseTo(
      0.02093247,
      7,
    );
    centsClose(result.baseline.totalInterest, 8272840);
    centsClose(result.adjusted.totalInterest, 4218727.88);
    centsClose(result.interestSaved, 4054112.12);
    expect(result.adjusted.rows).toHaveLength(14);
    expect(result.monthsSaved).toBe(10);
    centsClose(result.adjusted.rows[0].interest, 592388.96);
    expect(result.adjusted.rows.at(-1)?.payment).toBe(0);
  });
  it("produces identical scenarios without extra payments", () => {
    const result = calculatePrepayment({
      ...defaultPrepayment,
      extraPayment: 0,
    });
    expect(result.adjusted.rows).toEqual(result.baseline.rows);
    expect(result.interestSaved).toBe(0);
  });
  it("keeps the term and recalculates installments in payment mode", () => {
    const result = calculatePrepayment({
      ...defaultPrepayment,
      mode: "payment",
      startMonth: 3,
      endMonth: 8,
    });
    expect(result.adjusted.rows.length).toBe(result.baseline.rows.length);
    expect(result.adjusted.rows[3].payment).toBeLessThan(
      result.baseline.payment,
    );
    expect(result.adjusted.rows[9].payment).toBe(
      result.adjusted.rows[8].payment,
    );
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.adjusted.rows.at(-1)?.balance).toBe(0);
  });
  it("caps oversized extras and preserves money conservation", () => {
    const result = calculatePrepayment({
      ...defaultPrepayment,
      extraPayment: 1e10,
      timing: "start",
    });
    expect(result.adjusted.rows).toHaveLength(1);
    expect(result.adjusted.totalInterest).toBe(0);
    expect(result.adjusted.totalExtra).toBe(defaultPrepayment.principal);
  });
  it("compares only future payments of an active loan", () => {
    const result = calculatePrepayment({
      ...defaultPrepayment,
      monthsPaid: 8,
      endMonth: 16,
      currentBalance: 20000000,
    });
    expect(result.baseline.startingBalance).toBe(20000000);
    expect(result.baseline.rows[0].month).toBe(9);
    expect(result.baseline.rows).toHaveLength(16);
    centsClose(
      result.adjusted.totalPrincipal + result.adjusted.totalExtra,
      20000000,
    );
    expect(result.interestSaved).toBeGreaterThan(0);
  });
  it("makes timing observable and treats the abono window as inclusive", () => {
    const end = calculatePrepayment({
      ...defaultPrepayment,
      startMonth: 2,
      endMonth: 3,
      timing: "end",
    });
    const start = calculatePrepayment({
      ...defaultPrepayment,
      startMonth: 2,
      endMonth: 3,
      timing: "start",
    });
    expect(end.adjusted.rows[0].extraPayment).toBe(0);
    expect(end.adjusted.rows[1].extraPayment).toBe(1000000);
    expect(end.adjusted.rows[2].extraPayment).toBe(1000000);
    expect(end.adjusted.rows[3].extraPayment).toBe(0);
    expect(start.adjusted.totalInterest).toBeLessThan(
      end.adjusted.totalInterest,
    );
  });
  it("rejects impossible installments and invalid abono windows", () => {
    expect(() =>
      calculatePrepayment({
        ...defaultPrepayment,
        rateSource: "bankPayment",
        bankPayment: 1,
      }),
    ).toThrow();
    expect(() =>
      calculatePrepayment({ ...defaultPrepayment, startMonth: 5, endMonth: 4 }),
    ).toThrow();
  });
});

describe("investment projections", () => {
  const input = {
    principal: 1000,
    annualRate: (Math.pow(1.01, 12) - 1) * 100,
    months: 2,
    monthlyContribution: 100,
    reinvest: true,
  };
  it("matches independent monthly cash flows", () => {
    const result = calculateInvestment(input);
    expect(result.rows[0].balance).toBe(1110);
    expect(result.finalBalance).toBe(1221.1);
    expect(result.totalInterest).toBe(21.1);
    expect(result.totalContributions).toBe(1200);
  });
  it("separates withdrawn interest from invested balance", () => {
    const result = calculateInvestment({ ...input, reinvest: false });
    expect(result.finalBalance).toBe(1200);
    expect(result.totalInterest).toBe(21);
    expect(result.totalValue).toBe(1221);
  });
  it("supports zero interest and partial years", () => {
    const result = calculateInvestment({ ...input, annualRate: 0, months: 25 });
    expect(result.finalBalance).toBe(3500);
    expect(result.totalInterest).toBe(0);
    expect(result.annualRows).toHaveLength(3);
    expect(result.annualRows[0].contribution).toBe(1200);
    expect(result.annualRows[2].contribution).toBe(100);
  });
});
