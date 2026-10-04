import type { Metadata } from "next";
import { CalculatorPage } from "@/components/calculator-page";

export const metadata: Metadata = {
  title: "Calculadora de crédito y tabla de amortización",
  description:
    "Calcula la cuota de un crédito con tasa efectiva o nominal anual. Consulta capital, intereses, tablas mensuales y anuales y exporta un PDF gratis.",
  alternates: { canonical: "/credito/" },
};
export default function CreditPage() {
  return <CalculatorPage kind="credit" />;
}
