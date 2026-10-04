import type { Metadata } from "next";
import { CalculatorPage } from "@/components/calculator-page";

export const metadata: Metadata = {
  title: "Cuánto invertir para generar ingresos mensuales",
  description:
    "Calcula el capital necesario para tu ingreso mensual deseado y una línea del tiempo con aportes y reinversión. Proyección en COP y reporte PDF gratis.",
  alternates: { canonical: "/ingresos/" },
};

export default function IncomePage() {
  return <CalculatorPage kind="income" />;
}
