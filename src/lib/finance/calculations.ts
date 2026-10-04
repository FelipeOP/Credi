import Decimal from "decimal.js";
import type {
  AnnualInvestmentRow,
  AnnualLoanRow,
  InvestmentInput,
  InvestmentResult,
  LoanInput,
  LoanResult,
  LoanRow,
  PrepaymentInput,
  PrepaymentResult,
} from "./types";

const D = Decimal.clone({ precision: 32, rounding: Decimal.ROUND_HALF_UP });
const money = (value: Decimal.Value) => new D(value).toDecimalPlaces(2);
const sum = (values: number[]) =>
  values.reduce((total, value) => total.plus(value), new D(0)).toNumber();

function requireNumber(value: number, name: string, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max)
    throw new Error(
      `${name} debe estar entre ${min.toLocaleString("es-CO")} y ${max.toLocaleString("es-CO")}.`,
    );
}

function validateLoan(input: LoanInput) {
  requireNumber(input.principal, "El monto", 1, 1e12);
  if (input.rateKind === "monthly")
    requireNumber(input.monthlyRate ?? NaN, "La tasa mensual", 0, 20);
  else requireNumber(input.annualRate, "La tasa anual", 0, 200);
  requireNumber(input.months, "El plazo", 1, 600);
  if (!Number.isInteger(input.months))
    throw new Error("El plazo debe ser un número entero de meses.");
  if (![1, 2, 4, 12, 365].includes(input.compoundingPeriods))
    throw new Error("Selecciona una periodicidad válida.");
  if (!["effective", "nominal", "monthly"].includes(input.rateKind))
    throw new Error("Selecciona un tipo de tasa válido.");
}

export function monthlyRate(
  ratePercent: number,
  rateKind: LoanInput["rateKind"] = "effective",
  periods = 12,
) {
  const rate = new D(ratePercent).div(100);
  if (rateKind === "monthly") return rate;
  return rateKind === "nominal"
    ? rate.div(periods).plus(1).pow(new D(periods).div(12)).minus(1)
    : rate.plus(1).pow(new D(1).div(12)).minus(1);
}

export function installment(
  principal: Decimal.Value,
  rate: Decimal,
  months: number,
) {
  const amount = new D(principal);
  if (rate.isZero()) return amount.div(months);
  return amount.times(rate).div(new D(1).minus(rate.plus(1).pow(-months)));
}

export function inferMonthlyRate(
  principal: number,
  payment: number,
  months: number,
) {
  requireNumber(payment, "La cuota bancaria", 0.01, 1e12);
  const zeroPayment = new D(principal).div(months);
  if (new D(payment).lt(zeroPayment.minus(0.01)))
    throw new Error(
      "La cuota bancaria no alcanza para pagar el capital en el plazo indicado, incluso con tasa cero.",
    );
  if (new D(payment).minus(zeroPayment).abs().lte(0.01)) return new D(0);
  let lower = new D(0);
  let upper = new D(10);
  for (let index = 0; index < 110; index += 1) {
    const middle = lower.plus(upper).div(2);
    if (installment(principal, middle, months).gt(payment)) upper = middle;
    else lower = middle;
  }
  return lower.plus(upper).div(2);
}

interface ScheduleOptions {
  balance: Decimal;
  rate: Decimal;
  months: number;
  payment: Decimal;
  monthOffset?: number;
  extra?: Pick<
    PrepaymentInput,
    "extraPayment" | "startMonth" | "endMonth" | "mode" | "timing"
  >;
}

function schedule({
  balance: initialBalance,
  rate,
  months,
  payment: initialPayment,
  monthOffset = 0,
  extra,
}: ScheduleOptions): LoanResult {
  let balance = money(initialBalance);
  let payment = money(initialPayment);
  const rows: LoanRow[] = [];
  for (let period = 1; period <= months && balance.gt(0); period += 1) {
    const openingBalance = balance;
    const requestedExtra =
      extra && period >= extra.startMonth && period <= extra.endMonth
        ? money(extra.extraPayment)
        : new D(0);
    let extraAmount = new D(0);
    if (extra?.timing === "start") {
      extraAmount = D.min(balance, requestedExtra);
      balance = balance.minus(extraAmount);
      if (extra.mode === "payment" && extraAmount.gt(0) && balance.gt(0))
        payment = money(installment(balance, rate, months - period + 1));
    }
    const interest = money(balance.times(rate));
    let regularPayment = D.min(payment, balance.plus(interest));
    // The last contractual installment absorbs cent-level rounding residue.
    if (period === months) regularPayment = balance.plus(interest);
    if (regularPayment.lt(interest))
      throw new Error("La cuota no cubre el interés del período.");
    const principal = regularPayment.minus(interest);
    balance = money(D.max(0, balance.minus(principal)));
    if (extra?.timing === "end") {
      extraAmount = D.min(balance, requestedExtra);
      balance = money(balance.minus(extraAmount));
      if (
        extra.mode === "payment" &&
        extraAmount.gt(0) &&
        balance.gt(0) &&
        period < months
      )
        payment = money(installment(balance, rate, months - period));
    }
    const month = period + monthOffset;
    rows.push({
      month,
      year: Math.ceil(month / 12),
      openingBalance: openingBalance.toNumber(),
      payment: regularPayment.toNumber(),
      interest: interest.toNumber(),
      principal: principal.toNumber(),
      extraPayment: extraAmount.toNumber(),
      totalPayment: regularPayment.plus(extraAmount).toNumber(),
      balance: balance.toNumber(),
    });
  }
  const annualRows: AnnualLoanRow[] = [];
  for (const row of rows) {
    let annual = annualRows.find((value) => value.year === row.year);
    if (!annual) {
      annual = {
        year: row.year,
        payment: 0,
        interest: 0,
        principal: 0,
        extraPayment: 0,
        balance: 0,
      };
      annualRows.push(annual);
    }
    annual.payment = sum([annual.payment, row.totalPayment]);
    annual.interest = sum([annual.interest, row.interest]);
    annual.principal = sum([annual.principal, row.principal]);
    annual.extraPayment = sum([annual.extraPayment, row.extraPayment]);
    annual.balance = row.balance;
  }
  return {
    rows,
    annualRows,
    monthlyRate: rate.toNumber(),
    payment: money(initialPayment).toNumber(),
    totalInterest: sum(rows.map((row) => row.interest)),
    totalPaid: sum(rows.map((row) => row.totalPayment)),
    totalPrincipal: sum(rows.map((row) => row.principal)),
    totalExtra: sum(rows.map((row) => row.extraPayment)),
    startingBalance: initialBalance.toNumber(),
  };
}

export function calculateLoan(input: LoanInput): LoanResult {
  validateLoan(input);
  const rate = monthlyRate(
    input.rateKind === "monthly" ? input.monthlyRate! : input.annualRate,
    input.rateKind,
    input.compoundingPeriods,
  );
  return schedule({
    balance: money(input.principal),
    rate,
    months: input.months,
    payment: installment(input.principal, rate, input.months),
  });
}

export function calculatePrepayment(input: PrepaymentInput): PrepaymentResult {
  validateLoan(input);
  requireNumber(input.monthsPaid, "Las cuotas pagadas", 0, input.months - 1);
  requireNumber(input.extraPayment, "El abono", 0, 1e12);
  const remaining = input.months - input.monthsPaid;
  requireNumber(input.startMonth, "El mes inicial", 1, remaining);
  requireNumber(input.endMonth, "El mes final", input.startMonth, remaining);
  if (
    ![input.monthsPaid, input.startMonth, input.endMonth].every(
      Number.isInteger,
    )
  )
    throw new Error("Los meses deben ser números enteros.");
  if (
    !["term", "payment"].includes(input.mode) ||
    !["start", "end"].includes(input.timing) ||
    !["annual", "bankPayment"].includes(input.rateSource)
  )
    throw new Error("Selecciona opciones de abono válidas.");
  const rate =
    input.rateSource === "bankPayment"
      ? inferMonthlyRate(input.principal, input.bankPayment, input.months)
      : monthlyRate(
          input.rateKind === "monthly" ? input.monthlyRate! : input.annualRate,
          input.rateKind,
          input.compoundingPeriods,
        );
  const payment =
    input.rateSource === "bankPayment"
      ? money(input.bankPayment)
      : money(installment(input.principal, rate, input.months));
  const original = schedule({
    balance: money(input.principal),
    rate,
    payment,
    months: input.months,
  });
  if (input.currentBalance !== undefined)
    requireNumber(
      input.currentBalance,
      "El saldo actual",
      0.01,
      input.principal,
    );
  const balance = money(
    input.currentBalance ??
      (input.monthsPaid === 0
        ? input.principal
        : original.rows[input.monthsPaid - 1].balance),
  );
  const baseline = schedule({
    balance,
    rate,
    payment,
    months: remaining,
    monthOffset: input.monthsPaid,
  });
  const adjusted = schedule({
    balance,
    rate,
    payment,
    months: remaining,
    monthOffset: input.monthsPaid,
    extra: input,
  });
  const interestSaved = money(
    new D(baseline.totalInterest).minus(adjusted.totalInterest),
  ).toNumber();
  return {
    baseline,
    adjusted,
    interestSaved,
    savedPercentage: baseline.totalInterest
      ? (interestSaved / baseline.totalInterest) * 100
      : 0,
    monthsSaved: baseline.rows.length - adjusted.rows.length,
    finalPayment:
      adjusted.rows.filter((row) => row.payment > 0).at(-1)?.payment ?? 0,
    impliedAnnualRate: rate.plus(1).pow(12).minus(1).times(100).toNumber(),
  };
}

export function calculateInvestment(input: InvestmentInput): InvestmentResult {
  requireNumber(input.principal, "El capital inicial", 1, 1e12);
  requireNumber(input.annualRate, "La tasa anual", 0, 200);
  requireNumber(input.months, "El plazo", 1, 600);
  requireNumber(input.monthlyContribution, "El aporte mensual", 0, 1e12);
  if (!Number.isInteger(input.months))
    throw new Error("El plazo debe ser un número entero de meses.");
  const rate = monthlyRate(input.annualRate);
  let balance = money(input.principal);
  let contributions = balance;
  let interestTotal = new D(0);
  const rows: InvestmentResult["rows"] = [];
  for (let month = 1; month <= input.months; month += 1) {
    const interest = money(balance.times(rate));
    const contribution = money(input.monthlyContribution);
    interestTotal = interestTotal.plus(interest);
    contributions = contributions.plus(contribution);
    balance = balance.plus(contribution).plus(input.reinvest ? interest : 0);
    rows.push({
      month,
      year: Math.ceil(month / 12),
      contribution: contribution.toNumber(),
      interest: interest.toNumber(),
      totalContributions: contributions.toNumber(),
      totalInterest: interestTotal.toNumber(),
      balance: balance.toNumber(),
    });
  }
  const annualRows: AnnualInvestmentRow[] = [];
  for (const row of rows) {
    let annual = annualRows.find((value) => value.year === row.year);
    if (!annual) {
      annual = {
        year: row.year,
        contribution: 0,
        interest: 0,
        totalContributions: 0,
        totalInterest: 0,
        balance: 0,
      };
      annualRows.push(annual);
    }
    annual.contribution = sum([annual.contribution, row.contribution]);
    annual.interest = sum([annual.interest, row.interest]);
    annual.totalContributions = row.totalContributions;
    annual.totalInterest = row.totalInterest;
    annual.balance = row.balance;
  }
  return {
    rows,
    annualRows,
    monthlyRate: rate.toNumber(),
    finalBalance: balance.toNumber(),
    totalContributions: contributions.toNumber(),
    totalInterest: interestTotal.toNumber(),
    totalValue: contributions.plus(interestTotal).toNumber(),
  };
}
