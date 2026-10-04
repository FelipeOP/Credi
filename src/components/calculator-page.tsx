import { Calculator } from "./calculator";
import { FAQ } from "./faq";
import { AdSlot } from "./ad-slot";
import type { CalculatorKind } from "@/lib/finance/types";

export function CalculatorPage({ kind }: { kind: CalculatorKind }) {
  return (
    <main id="main-content" className="page-container">
      <Calculator key={kind} kind={kind} />
      <AdSlot />
      <FAQ kind={kind} />
    </main>
  );
}
