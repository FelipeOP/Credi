import { Calculator } from "./calculator";
import { IncomeCalculator } from "./income-calculator";
import { FAQ } from "./faq";
import { AdSlot } from "./ad-slot";
import type { CalculatorKind } from "@/lib/finance/types";

export function CalculatorPage({ kind }: { kind: CalculatorKind }) {
  return (
    <main id="main-content" className="page-container">
      {kind === "income" ? (
        <IncomeCalculator />
      ) : (
        <Calculator key={kind} kind={kind} />
      )}
      <AdSlot />
      <FAQ kind={kind} />
    </main>
  );
}
