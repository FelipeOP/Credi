import Decimal from "decimal.js";
import { calculateInvestment, monthlyRate } from "./calculations";
import type { IncomeInput, IncomeResult } from "./types";

const D = Decimal.clone({ precision: 32, rounding: Decimal.ROUND_HALF_UP });

export function calculateIncome(input: IncomeInput): IncomeResult {
  if (
    !Number.isFinite(input.desiredMonthlyIncome) ||
    input.desiredMonthlyIncome < 0.01 ||
    input.desiredMonthlyIncome > 1e12
  )
    throw new Error(
      "El ingreso mensual debe estar entre $0,01 y $1.000.000.000.000.",
    );
  if (
    !Number.isFinite(input.annualRate) ||
    input.annualRate < 0.01 ||
    input.annualRate > 200
  )
    throw new Error("La rentabilidad debe estar entre 0,01 % y 200 % E.A.");
  if (!["cdt", "savings", "etf"].includes(input.assetKind))
    throw new Error("Selecciona un tipo de inversión válido.");
  const rate = monthlyRate(input.annualRate);
  const requiredCapital = new D(input.desiredMonthlyIncome)
    .div(rate)
    .toDecimalPlaces(2, Decimal.ROUND_CEIL)
    .toNumber();
  const investmentInput = {
    principal: input.initialCapital,
    annualRate: input.annualRate,
    months: input.maximumMonths,
    monthlyContribution: input.monthlyContribution,
    reinvest: true,
  };
  // Validate every input even if the initial capital already meets the goal.
  const fullProjection = calculateInvestment(investmentInput);
  const monthsToGoal =
    input.initialCapital >= requiredCapital
      ? 0
      : (fullProjection.rows.find((row) => row.balance >= requiredCapital)
          ?.month ?? null);
  const projection =
    monthsToGoal === 0
      ? {
          rows: [],
          annualRows: [],
          monthlyRate: rate.toNumber(),
          finalBalance: input.initialCapital,
          totalContributions: input.initialCapital,
          totalInterest: 0,
          totalValue: input.initialCapital,
        }
      : monthsToGoal === null
        ? fullProjection
        : calculateInvestment({ ...investmentInput, months: monthsToGoal });
  return {
    requiredCapital,
    monthsToGoal,
    projection,
    projectedMonthlyIncome: new D(projection.finalBalance)
      .times(rate)
      .toDecimalPlaces(2)
      .toNumber(),
    shortfall: D.max(0, new D(requiredCapital).minus(projection.finalBalance))
      .toDecimalPlaces(2)
      .toNumber(),
    milestones: [25, 50, 75, 100].map((percentage) => {
      const capital = new D(requiredCapital)
        .times(percentage)
        .div(100)
        .toDecimalPlaces(2, Decimal.ROUND_CEIL)
        .toNumber();
      return {
        percentage,
        capital,
        month:
          input.initialCapital >= capital
            ? 0
            : (projection.rows.find((row) => row.balance >= capital)?.month ??
              null),
      };
    }),
  };
}
