import type { Metadata } from "next";
import { CalculatorPage } from "@/components/calculator-page";

export const metadata: Metadata = {
  title: "Calculadora de inversión e interés compuesto",
  description:
    "Proyecta tu inversión con tasa fija, aportes mensuales y reinversión. Explora rendimientos brutos, evolución mensual y anual y un reporte PDF gratis.",
  alternates: { canonical: "/inversion/" },
};
export default function InvestmentPage() {
  return <CalculatorPage kind="investment" />;
}
