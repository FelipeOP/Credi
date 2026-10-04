import type { Metadata } from "next";
import { CalculatorPage } from "@/components/calculator-page";

export const metadata: Metadata = {
  title: "Simulador de abonos a capital",
  description:
    "Compara tu crédito con y sin abonos a capital. Calcula intereses ahorrados, reducción de plazo o cuota y exporta un reporte detallado.",
  alternates: { canonical: "/abonos/" },
};
export default function PrepaymentPage() {
  return <CalculatorPage kind="prepayment" />;
}
