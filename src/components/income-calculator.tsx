"use client";

import { useMemo, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, LockSimple } from "@/components/icons";
import { defaultIncome } from "@/lib/defaults";
import { calculatorContent } from "@/lib/content";
import { calculateIncome } from "@/lib/finance/income";
import type { IncomeInput } from "@/lib/finance/types";
import { currency, percent } from "@/lib/format";
import { assetLabels, buildIncomeReport, goalTime } from "@/lib/income-report";
import { NumberField, SelectField } from "./field";
import { ExportButton } from "./export-button";
import { ScheduleTable } from "./schedule-table";
import { useSession } from "./session-provider";
import { trackEvent, useConsent } from "./privacy-provider";

const IncomeChart = dynamic(() => import("./income-chart"), {
  ssr: false,
  loading: () => (
    <div className="chart-placeholder" aria-label="Cargando gráfica" />
  ),
});

export function IncomeCalculator() {
  const { state, setState } = useSession();
  const { analytics } = useConsent();
  const input = state.income;
  const [snapshot, setSnapshot] = useState(() => {
    try {
      return { input, result: calculateIncome(input) };
    } catch {
      return { input: defaultIncome, result: calculateIncome(defaultIncome) };
    }
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const { result } = snapshot;
  const dirty = JSON.stringify(input) !== JSON.stringify(snapshot.input);
  const report = useMemo(
    () => buildIncomeReport(snapshot.input, result),
    [snapshot, result],
  );
  const content = calculatorContent.income;
  function update<K extends keyof IncomeInput>(key: K, value: IncomeInput[K]) {
    setState((previous) => ({
      ...previous,
      income: { ...previous.income, [key]: value },
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSnapshot({ input, result: calculateIncome(input) });
      setError("");
      setStatus(
        "Meta actualizada. Revisa el capital necesario y tu línea del tiempo.",
      );
      if (analytics) trackEvent("simulation_calculated", "income");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Revisa los datos de tu meta.",
      );
    }
  }
  return (
    <>
      <section className="intro">
        <div>
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>
            {content.title} <span>{content.emphasis}</span>
          </h1>
          <p>{content.description}</p>
        </div>
      </section>
      <div className="calculator-grid">
        <aside>
          <form className="form-panel" onSubmit={submit}>
            <div className="form-heading">
              <span className="step-marker">04</span>
              <div>
                <h2>{content.formTitle}</h2>
                <p>{content.formDescription}</p>
              </div>
            </div>
            <NumberField
              label="¿Cuánto quieres recibir al mes?"
              prefix="$"
              min={0.01}
              step={0.01}
              value={input.desiredMonthlyIncome}
              onChange={(value) => update("desiredMonthlyIncome", value)}
            />
            <SelectField
              label="Tipo de inversión"
              value={input.assetKind}
              onChange={(value) =>
                update("assetKind", value as IncomeInput["assetKind"])
              }
            >
              {Object.entries(assetLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <NumberField
              label="Rentabilidad estimada efectiva anual"
              suffix="% E.A."
              min={0.01}
              max={200}
              step={0.01}
              value={input.annualRate}
              onChange={(value) => update("annualRate", value)}
              hint="9 % es un ejemplo editable; no una oferta ni una tasa garantizada."
            />
            <div className="form-divider">
              <span>Tu plan de acumulación</span>
            </div>
            <NumberField
              label="Capital que ya tienes"
              prefix="$"
              value={input.initialCapital}
              onChange={(value) => update("initialCapital", value)}
            />
            <NumberField
              label="Aporte mensual"
              prefix="$"
              value={input.monthlyContribution}
              onChange={(value) => update("monthlyContribution", value)}
            />
            <NumberField
              label="Horizonte máximo de la proyección"
              suffix="meses"
              min={1}
              max={600}
              value={input.maximumMonths}
              onChange={(value) => update("maximumMonths", value)}
            />
            <p className="form-note">
              Reinvertimos todos los rendimientos hasta alcanzar la meta. Los
              aportes se suman al final del mes.
            </p>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <button className="primary-button calculate-button" type="submit">
              Calcular mi meta <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="text-button example-button"
              onClick={() => {
                setState((previous) => ({
                  ...previous,
                  income: defaultIncome,
                }));
                setSnapshot({
                  input: defaultIncome,
                  result: calculateIncome(defaultIncome),
                });
                setError("");
                setStatus("Ejemplo cargado con rentabilidad de 9 % E.A.");
              }}
            >
              Cargar ejemplo
            </button>
            <div className="form-privacy">
              <LockSimple size={13} /> Los cálculos se realizan en tu
              dispositivo.
            </div>
          </form>
        </aside>
        <div className="results-column">
          <div className="results-toolbar">
            <span className={dirty ? "result-state pending" : "result-state"}>
              <span />
              {dirty ? "Cambios sin calcular" : "SIMULACIÓN LISTA"}
            </span>
            <ExportButton report={report} disabled={dirty} />
          </div>
          <section className="summary-panel" aria-labelledby="summary-title">
            <div className="summary-top">
              <div>
                <span className="eyebrow">CAPITAL NECESARIO PARA TU META</span>
                <h2 id="summary-title" className="summary-value">
                  {currency(result.requiredCapital)}
                  <span>COP</span>
                </h2>
                <p>
                  Para generar aproximadamente{" "}
                  {currency(snapshot.input.desiredMonthlyIncome)} brutos al mes,
                  con {percent(snapshot.input.annualRate)} E.A. constante.
                </p>
              </div>
            </div>
            <div className="summary-stats income-summary-stats">
              <div>
                <span>Tiempo estimado</span>
                <strong>
                  {result.monthsToGoal === 0
                    ? "Hoy"
                    : result.monthsToGoal === null
                      ? "Fuera del horizonte"
                      : `${result.monthsToGoal} meses`}
                </strong>
              </div>
              <div>
                <span>Tasa mensual equivalente</span>
                <strong>
                  {percent(result.projection.monthlyRate * 100, 4)}
                </strong>
              </div>
              <div>
                <span>Capital al cierre</span>
                <strong>{currency(result.projection.finalBalance)}</strong>
              </div>
            </div>
          </section>
          <p className="income-insight">
            {result.monthsToGoal === null
              ? `Con este plan no alcanzas la meta en ${snapshot.input.maximumMonths} meses. Faltarían ${currency(result.shortfall)}. El saldo final generaría aproximadamente ${currency(result.projectedMonthlyIncome)} brutos al mes.`
              : result.monthsToGoal === 0
                ? "Tu capital inicial ya alcanza la meta bajo la tasa asumida. No necesitas una etapa adicional de acumulación."
                : `Alcanzarías la meta en ${goalTime(result.monthsToGoal, snapshot.input.maximumMonths)}. Hasta entonces, los rendimientos se reinvierten; no son ingresos disponibles para retirar.`}
          </p>
          <section className="income-timeline" aria-labelledby="timeline-title">
            <div className="panel-heading">
              <span className="eyebrow">PASO A PASO</span>
              <h2 id="timeline-title">Tu línea del tiempo</h2>
            </div>
            <ol>
              {result.milestones.map((milestone) => (
                <li
                  key={milestone.percentage}
                  className={milestone.month === null ? "unreached" : ""}
                >
                  <span className="timeline-dot" aria-hidden="true" />
                  <span className="eyebrow">
                    {milestone.percentage} % DE LA META
                  </span>
                  <strong>{currency(milestone.capital)}</strong>
                  <p>
                    {milestone.month === null
                      ? "Fuera del horizonte"
                      : milestone.month === 0
                        ? "Hoy"
                        : `Mes ${milestone.month}`}
                  </p>
                </li>
              ))}
            </ol>
          </section>
          <section className="chart-panel">
            <div className="panel-heading">
              <span className="eyebrow">EL CAMINO HACIA TU META</span>
              <h2>{content.chartTitle}</h2>
            </div>
            <div className="chart-legend">
              <span>
                <i style={{ background: "#cc9166" }} /> Capital acumulado
              </span>
              <span>
                <i style={{ background: "#8c8985" }} /> Meta de capital
              </span>
            </div>
            <IncomeChart
              result={result}
              initialCapital={snapshot.input.initialCapital}
            />
            <p className="chart-description">{content.chartDescription}</p>
          </section>
          <div className="income-assumptions">
            <h3>Cómo interpretar esta proyección</h3>
            <p>
              Capital objetivo = ingreso mensual ÷ tasa mensual equivalente. Los
              rendimientos son brutos: excluyen impuestos, comisiones e
              inflación.
            </p>
            <p>
              {snapshot.input.assetKind === "etf"
                ? "En un ETF, la rentabilidad total y los dividendos son distintos. El precio fluctúa y no hay un pago mensual garantizado; vender participaciones puede consumir capital."
                : "El ingreso es un equivalente mensual. Un CDT puede pagar al vencimiento y no admitir aportes; una cajita puede cambiar su tasa. Revisa las condiciones del producto."}
            </p>
            <p>
              Una vez alcanzada la meta, retirar solo rendimientos conservaría
              el capital nominal bajo este supuesto constante. El modelo no
              garantiza que la rentabilidad real se mantenga.
            </p>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status">
        {status}
      </p>
      {result.projection.rows.length > 0 && (
        <ScheduleTable investment={result.projection} />
      )}
    </>
  );
}
