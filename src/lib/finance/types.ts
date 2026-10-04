export type CalculatorKind = "credit" | "prepayment" | "investment" | "income";
export type StandardCalculatorKind = Exclude<CalculatorKind, "income">;
export type RateKind = "effective" | "nominal" | "monthly";

export interface LoanInput {
  principal: number;
  annualRate: number;
  monthlyRate?: number;
  rateKind: RateKind;
  compoundingPeriods: number;
  months: number;
}

export interface PrepaymentInput extends LoanInput {
  monthsPaid: number;
  currentBalance?: number;
  bankPayment: number;
  rateSource: "annual" | "bankPayment";
  extraPayment: number;
  startMonth: number;
  endMonth: number;
  mode: "term" | "payment";
  timing: "start" | "end";
}

export interface LoanRow {
  month: number;
  year: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  extraPayment: number;
  totalPayment: number;
  balance: number;
}

export interface AnnualLoanRow {
  year: number;
  payment: number;
  interest: number;
  principal: number;
  extraPayment: number;
  balance: number;
}

export interface LoanResult {
  rows: LoanRow[];
  annualRows: AnnualLoanRow[];
  monthlyRate: number;
  payment: number;
  totalInterest: number;
  totalPaid: number;
  totalPrincipal: number;
  totalExtra: number;
  startingBalance: number;
}

export interface PrepaymentResult {
  baseline: LoanResult;
  adjusted: LoanResult;
  interestSaved: number;
  savedPercentage: number;
  monthsSaved: number;
  finalPayment: number;
  impliedAnnualRate: number;
}

export interface InvestmentInput {
  principal: number;
  annualRate: number;
  months: number;
  monthlyContribution: number;
  reinvest: boolean;
}

export interface InvestmentRow {
  month: number;
  year: number;
  contribution: number;
  interest: number;
  totalContributions: number;
  totalInterest: number;
  balance: number;
}

export interface AnnualInvestmentRow {
  year: number;
  contribution: number;
  interest: number;
  totalContributions: number;
  totalInterest: number;
  balance: number;
}

export interface InvestmentResult {
  rows: InvestmentRow[];
  annualRows: AnnualInvestmentRow[];
  monthlyRate: number;
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  totalValue: number;
}

export interface IncomeInput {
  desiredMonthlyIncome: number;
  annualRate: number;
  initialCapital: number;
  monthlyContribution: number;
  maximumMonths: number;
  assetKind: "cdt" | "savings" | "etf";
}

export interface IncomeResult {
  requiredCapital: number;
  monthsToGoal: number | null;
  projectedMonthlyIncome: number;
  shortfall: number;
  projection: InvestmentResult;
  milestones: Array<{ percentage: number; capital: number; month: number | null }>;
}
