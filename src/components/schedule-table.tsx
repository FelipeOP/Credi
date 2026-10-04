"use client";

import { useState } from "react";
import { CaretLeft, CaretRight } from "@/components/icons";
import { currency } from "@/lib/format";
import type { InvestmentResult, LoanResult } from "@/lib/finance/types";

export function ScheduleTable({
  loan,
  baseline,
  investment,
}: {
  loan?: LoanResult;
  baseline?: LoanResult;
  investment?: InvestmentResult;
}) {
  const [frequency, setFrequency] = useState<"monthly" | "annual">("monthly");
  const [scenario, setScenario] = useState<"adjusted" | "baseline">("adjusted");
  const [page, setPage] = useState(0);
  const selectedLoan = scenario === "baseline" && baseline ? baseline : loan;
  const source = investment
    ? frequency === "monthly"
      ? investment.rows
      : investment.annualRows
    : frequency === "monthly"
      ? selectedLoan?.rows
      : selectedLoan?.annualRows;
  const rows = source ?? [];
  const pageCount = Math.max(1, Math.ceil(rows.length / 12));
  const safePage = Math.min(page, pageCount - 1);
  return (
    <section className="table-panel" aria-labelledby="table-title">
      <div className="panel-heading table-heading">
        <div>
          <span className="eyebrow">EL DETALLE COMPLETO</span>
          <h2 id="table-title">Tus números, período a período</h2>
        </div>
        <div className="segmented-control" aria-label="Frecuencia de la tabla">
          {(["monthly", "annual"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={frequency === value}
              onClick={() => {
                setFrequency(value);
                setPage(0);
              }}
            >
              {value === "monthly" ? "Mensual" : "Anual"}
            </button>
          ))}
        </div>
      </div>
      {baseline && (
        <div className="scenario-control" aria-label="Escenario de la tabla">
          <button
            aria-pressed={scenario === "adjusted"}
            onClick={() => {
              setScenario("adjusted");
              setPage(0);
            }}
          >
            Con abonos
          </button>
          <button
            aria-pressed={scenario === "baseline"}
            onClick={() => {
              setScenario("baseline");
              setPage(0);
            }}
          >
            Sin abonos
          </button>
        </div>
      )}
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Tabla de resultados, desplázate horizontalmente para ver todas las columnas"
      >
        <table>
          <caption className="sr-only">
            {investment
              ? "Evolución de la inversión"
              : `Amortización ${baseline ? (scenario === "adjusted" ? "con abonos" : "sin abonos") : "del crédito"}`}
            , {frequency === "monthly" ? "mensual" : "anual"}. Valores en pesos
            colombianos.
          </caption>
          <thead>
            <tr>
              <th scope="col">{frequency === "monthly" ? "Mes" : "Año"}</th>
              {investment ? (
                <>
                  <th scope="col">Aporte</th>
                  <th scope="col">Rendimiento</th>
                  <th scope="col">Aportes acumulados</th>
                  <th scope="col">Rendimiento acumulado</th>
                  <th scope="col">Saldo invertido</th>
                </>
              ) : (
                <>
                  <th scope="col">
                    {frequency === "monthly"
                      ? "Cuota ordinaria"
                      : "Total pagado"}
                  </th>
                  <th scope="col">Intereses</th>
                  <th scope="col">Capital de la cuota</th>
                  <th scope="col">Abono adicional</th>
                  <th scope="col">Saldo</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.slice(safePage * 12, safePage * 12 + 12).map((row) => (
              <tr key={Number("month" in row ? row.month : row.year)}>
                <th scope="row">
                  {String("month" in row ? row.month : row.year).padStart(
                    2,
                    "0",
                  )}
                </th>
                {"totalContributions" in row ? (
                  <>
                    <td>{currency(row.contribution)}</td>
                    <td className="accent-text">{currency(row.interest)}</td>
                    <td>{currency(row.totalContributions)}</td>
                    <td>{currency(row.totalInterest)}</td>
                    <td>{currency(row.balance)}</td>
                  </>
                ) : (
                  <>
                    <td>{currency(row.payment)}</td>
                    <td>{currency(row.interest)}</td>
                    <td className="accent-text">{currency(row.principal)}</td>
                    <td>{currency(row.extraPayment)}</td>
                    <td>{currency(row.balance)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          {rows.length ? safePage * 12 + 1 : 0}–
          {Math.min(rows.length, (safePage + 1) * 12)} de {rows.length} períodos
          · COP, valores redondeados para lectura
        </span>
        <div>
          <button
            className="icon-button"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            aria-label="Página anterior"
          >
            <CaretLeft size={16} />
          </button>
          <span>
            {safePage + 1} / {pageCount}
          </span>
          <button
            className="icon-button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            aria-label="Página siguiente"
          >
            <CaretRight size={16} />
          </button>
        </div>
      </div>
      <p className="table-explanation">
        {investment
          ? "El saldo invertido excluye intereses retirados. Los aportes se realizan al final de cada mes."
          : "Capital de la cuota = cuota ordinaria − intereses. Si pagas $500.000 y $100.000 son intereses, los $400.000 restantes reducen tu deuda. Los intereses no reducen el saldo. Un abono adicional se suma a ese capital y aparece por separado. El saldo anual es el cierre del último mes del grupo."}{" "}
        El PDF conserva dos decimales.
      </p>
    </section>
  );
}
