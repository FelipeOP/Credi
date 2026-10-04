import type { Metadata } from "next";
import { CalculatorPage } from "@/components/calculator-page";

export const metadata: Metadata = { alternates: { canonical: "/credito/" } };
export default function HomePage() {
  return <CalculatorPage kind="credit" />;
}
