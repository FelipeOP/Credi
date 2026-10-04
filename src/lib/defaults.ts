import type {
  InvestmentInput,
  LoanInput,
  PrepaymentInput,
} from "./finance/types";

export const defaultLoan: LoanInput = {
  principal: 29300000,
  annualRate: 26.7,
  monthlyRate: 2,
  rateKind: "effective",
  compoundingPeriods: 12,
  months: 24,
};
export const defaultPrepayment: PrepaymentInput = {
  ...defaultLoan,
  monthsPaid: 0,
  bankPayment: 1565535,
  rateSource: "annual",
  extraPayment: 1000000,
  startMonth: 1,
  endMonth: 24,
  mode: "term",
  timing: "end",
};
export const defaultInvestment: InvestmentInput = {
  principal: 10000000,
  annualRate: 10,
  months: 24,
  monthlyContribution: 200000,
  reinvest: true,
};
