"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Info,
  LockSimple,
  Sparkle,
} from "@phosphor-icons/react";
import { calculatorContent } from "@/lib/content";
import {
  defaultInvestment,
  defaultLoan,
  defaultPrepayment,
} from "@/lib/defaults";
import {
  calculateInvestment,
  calculateLoan,
  calculatePrepayment,
} from "@/lib/finance/calculations";
import type {
  CalculatorKind,
  InvestmentInput,
  LoanInput,
  LoanResult,
  PrepaymentInput,
  PrepaymentResult,
  InvestmentResult,
} from "@/lib/finance/types";
import { currency, percent } from "@/lib/format";
import { buildReport } from "@/lib/report";
import { NumberField, SelectField } from "./field";
import { useSession, type SimulationState } from "./session-provider";
import { ScheduleTable } from "./schedule-table";
import { ExportButton } from "./export-button";
import { trackEvent, useConsent } from "./privacy-provider";

const ResultChart = dynamic(() => import("./result-chart"), {
  ssr: false,
  loading: () => (
    <div className="chart-placeholder" aria-label="Cargando gráfica">
      <span />
    </div>
  ),
});
interface Results {
  loan?: LoanResult;
  prepayment?: PrepaymentResult;
  investment?: InvestmentResult;
}
const inputFor = (state: SimulationState, kind: CalculatorKind) =>
  kind === "credit"
    ? state.loan
    : kind === "prepayment"
      ? state.prepayment
      : state.investment;
function compute(state: SimulationState, kind: CalculatorKind): Results {
  return kind === "credit"
    ? { loan: calculateLoan(state.loan) }
    : kind === "prepayment"
      ? { prepayment: calculatePrepayment(state.prepayment) }
      : { investment: calculateInvestment(state.investment) };
}

export function Calculator({ kind }: { kind: CalculatorKind }) {
  const content = calculatorContent[kind];
  const { state, setState } = useSession();
  const { analytics } = useConsent();
  const [snapshot, setSnapshot] = useState(() => {
    try {
      return { inputs: state, results: compute(state, kind) };
    } catch {
      const defaults = {
        loan: defaultLoan,
        prepayment: defaultPrepayment,
        investment: defaultInvestment,
      };
      return { inputs: defaults, results: compute(defaults, kind) };
    }
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const dirty =
    JSON.stringify(inputFor(state, kind)) !==
    JSON.stringify(inputFor(snapshot.inputs, kind));
  const { loan, prepayment, investment } = snapshot.results;
  const draftLoan = kind === "prepayment" ? state.prepayment : state.loan;
  const report = buildReport({
    kind,
    loanInput: snapshot.inputs.loan,
    prepaymentInput: snapshot.inputs.prepayment,
    investmentInput: snapshot.inputs.investment,
    ...snapshot.results,
  });
  const remainingMonths = state.prepayment.months - state.prepayment.monthsPaid;
  function updateLoan<K extends keyof LoanInput>(key: K, value: LoanInput[K]) {
    setState((previous) => {
      if (kind !== "prepayment")
        return {
          ...previous,
          loan: {
            ...previous.loan,
            [key]: value,
            ...(key === "rateKind" && value === "monthly"
              ? { monthlyRate: previous.loan.monthlyRate ?? 2 }
              : {}),
          },
        };
      const next = { ...previous.prepayment, [key]: value };
      if (key === "rateKind" && value === "monthly") next.monthlyRate ??= 2;
      if (key === "months" && Number.isFinite(next.months)) {
        next.monthsPaid = Math.min(
          next.monthsPaid,
          Math.max(0, next.months - 1),
        );
        next.endMonth = Math.min(next.endMonth, next.months - next.monthsPaid);
        next.startMonth = Math.min(next.startMonth, next.endMonth);
      }
      return { ...previous, prepayment: next };
    });
  }
  function updatePrepayment<K extends keyof PrepaymentInput>(
    key: K,
    value: PrepaymentInput[K],
  ) {
    setState((previous) => {
      const next = { ...previous.prepayment, [key]: value };
      if (key === "monthsPaid" && Number.isFinite(next.monthsPaid)) {
        next.endMonth = Math.min(next.endMonth, next.months - next.monthsPaid);
        next.startMonth = Math.min(next.startMonth, next.endMonth);
      }
      return { ...previous, prepayment: next };
    });
  }
  function updateInvestment<K extends keyof InvestmentInput>(
    key: K,
    value: InvestmentInput[K],
  ) {
    setState((previous) => ({
      ...previous,
      investment: { ...previous.investment, [key]: value },
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const results = compute(state, kind);
      setSnapshot({ inputs: state, results });
      setError("");
      setStatus(
        "Resultados actualizados. Puedes revisar las tablas y exportar tu reporte.",
      );
      if (analytics) trackEvent("simulation_calculated", kind);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Revisa los datos de la simulación.",
      );
    }
  }
  function loadExample() {
    const next = {
      ...state,
      ...(kind === "credit"
        ? { loan: defaultLoan }
        : kind === "prepayment"
          ? {
              prepayment: {
                ...defaultPrepayment,
                rateSource: "bankPayment" as const,
                timing: "start" as const,
              },
            }
          : { investment: defaultInvestment }),
    };
    setState(next);
    setSnapshot({ inputs: next, results: compute(next, kind) });
    setError("");
    setStatus(
      kind === "prepayment"
        ? "Ejemplo cargado: tasa implícita de la cuota bancaria y abono al inicio del período."
        : "Ejemplo cargado. Puedes cambiar los datos.",
    );
  }
  const totalPayment =
    loan?.totalPaid ??
    prepayment?.adjusted.totalPaid ??
    investment?.totalValue ??
    0;
  const heroValue =
    kind === "prepayment"
      ? prepayment!.interestSaved
      : kind === "investment"
        ? investment!.totalValue
        : loan!.payment;
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
        <div className="intro-stamp">
          <span className="stamp-dot" />
          <span>
            Claridad para
            <br />
            decidir mejor.
          </span>
        </div>
      </section>
      <div className="calculator-grid">
        <aside className="form-column">
          <form className="form-panel" onSubmit={submit}>
            <div className="form-heading">
              <span className="step-marker">01</span>
              <div>
                <h2>{content.formTitle}</h2>
                <p>{content.formDescription}</p>
              </div>
            </div>
            {kind === "investment" ? (
              <>
                <NumberField
                  label="Capital inicial"
                  value={state.investment.principal}
                  onChange={(value) => updateInvestment("principal", value)}
                  prefix="$"
                  suffix="COP"
                  min={1}
                  hint={currency(
                    Number.isFinite(state.investment.principal)
                      ? state.investment.principal
                      : 0,
                  )}
                />
                <div className="field-grid">
                  <NumberField
                    label="Tasa efectiva anual"
                    value={state.investment.annualRate}
                    onChange={(value) => updateInvestment("annualRate", value)}
                    suffix="% E. A."
                    max={200}
                    step={0.01}
                  />
                  <NumberField
                    label="Duración"
                    value={state.investment.months}
                    onChange={(value) => updateInvestment("months", value)}
                    suffix="meses"
                    min={1}
                    max={600}
                  />
                </div>
                <NumberField
                  label="Aporte mensual adicional"
                  value={state.investment.monthlyContribution}
                  onChange={(value) =>
                    updateInvestment("monthlyContribution", value)
                  }
                  prefix="$"
                  suffix="COP"
                  hint="Se realiza al final de cada mes. Usa 0 si no harás aportes."
                />
                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={state.investment.reinvest}
                    onChange={(event) =>
                      updateInvestment("reinvest", event.target.checked)
                    }
                  />
                  <span>
                    <strong>Reinvertir rendimientos</strong>
                    <small>Los intereses también generan intereses.</small>
                  </span>
                </label>
                <p className="form-note">
                  Proyección mensual bruta a tasa fija. Para explorar un CDT sin
                  aportes, ingresa un aporte mensual de $0.
                </p>
              </>
            ) : (
              <>
                <NumberField
                  label="Monto original del crédito"
                  value={draftLoan.principal}
                  onChange={(value) => updateLoan("principal", value)}
                  prefix="$"
                  suffix="COP"
                  min={1}
                  hint={currency(
                    Number.isFinite(draftLoan.principal)
                      ? draftLoan.principal
                      : 0,
                  )}
                />
                <div className="rate-selector" aria-label="Tipo de tasa">
                  <button
                    type="button"
                    aria-pressed={draftLoan.rateKind === "effective"}
                    onClick={() => updateLoan("rateKind", "effective")}
                  >
                    Efectiva anual
                  </button>
                  <button
                    type="button"
                    aria-pressed={draftLoan.rateKind === "nominal"}
                    onClick={() => updateLoan("rateKind", "nominal")}
                  >
                    Nominal anual
                  </button>
                  <button
                    type="button"
                    aria-pressed={draftLoan.rateKind === "monthly"}
                    onClick={() => updateLoan("rateKind", "monthly")}
                  >
                    Mensual M.V.
                  </button>
                </div>
                <div className="field-grid">
                  <NumberField
                    label={
                      draftLoan.rateKind === "effective"
                        ? "Tasa efectiva anual"
                        : draftLoan.rateKind === "monthly"
                          ? "Tasa mensual mes vencido (M.V.)"
                          : draftLoan.compoundingPeriods === 12
                            ? "Tasa nominal anual mes vencido (N.A.M.V.)"
                            : "Tasa nominal anual"
                    }
                    value={
                      draftLoan.rateKind === "monthly"
                        ? (draftLoan.monthlyRate ?? 2)
                        : draftLoan.annualRate
                    }
                    onChange={(value) =>
                      draftLoan.rateKind === "monthly"
                        ? updateLoan("monthlyRate", value)
                        : updateLoan("annualRate", value)
                    }
                    suffix="%"
                    max={draftLoan.rateKind === "monthly" ? 20 : 200}
                    step={0.01}
                  />
                  <NumberField
                    label="Plazo original"
                    value={draftLoan.months}
                    onChange={(value) => updateLoan("months", value)}
                    suffix="meses"
                    min={1}
                    max={600}
                  />
                </div>
                {draftLoan.rateKind === "nominal" && (
                  <SelectField
                    label="Periodicidad de la tasa vencida"
                    value={String(draftLoan.compoundingPeriods)}
                    onChange={(value) =>
                      updateLoan("compoundingPeriods", Number(value))
                    }
                  >
                    <option value="12">Mes vencido (12 períodos/año)</option>
                    <option value="4">Trimestral (4 períodos/año)</option>
                    <option value="2">Semestral (2 períodos/año)</option>
                    <option value="1">Anual (1 período/año)</option>
                    <option value="365">Diaria (365 períodos/año)</option>
                  </SelectField>
                )}
                {draftLoan.rateKind === "monthly" && (
                  <p className="form-note">
                    Ingresa el porcentaje por mes de tu extracto, por ejemplo 2
                    % M.V. Se aplica al final de cada mes y no se divide entre
                    12.
                  </p>
                )}
                {draftLoan.rateKind === "nominal" &&
                  draftLoan.compoundingPeriods === 12 && (
                    <p className="form-note">
                      Ingresa la tasa nominal anual, por ejemplo 24 % N.A.M.V.
                      La tasa de cada mes será 24 % ÷ 12 = 2 %.
                    </p>
                  )}
                {kind === "prepayment" ? (
                  <>
                    <div className="form-divider">
                      <span>Tu abono recurrente</span>
                    </div>
                    <div className="mode-options">
                      <button
                        type="button"
                        aria-pressed={state.prepayment.mode === "term"}
                        onClick={() => updatePrepayment("mode", "term")}
                      >
                        <strong>Reducir plazo</strong>
                        <small>Mantener la cuota</small>
                      </button>
                      <button
                        type="button"
                        aria-pressed={state.prepayment.mode === "payment"}
                        onClick={() => updatePrepayment("mode", "payment")}
                      >
                        <strong>Reducir cuota</strong>
                        <small>Mantener el plazo</small>
                      </button>
                    </div>
                    <NumberField
                      label="Abono adicional cada mes"
                      value={state.prepayment.extraPayment}
                      onChange={(value) =>
                        updatePrepayment("extraPayment", value)
                      }
                      prefix="$"
                      suffix="COP"
                    />
                    <div className="field-grid">
                      <NumberField
                        label="Desde el mes"
                        value={state.prepayment.startMonth}
                        onChange={(value) =>
                          updatePrepayment("startMonth", value)
                        }
                        min={1}
                        max={Math.max(1, remainingMonths)}
                      />
                      <NumberField
                        label="Hasta el mes"
                        value={state.prepayment.endMonth}
                        onChange={(value) =>
                          updatePrepayment("endMonth", value)
                        }
                        min={state.prepayment.startMonth}
                        max={Math.max(1, remainingMonths)}
                      />
                    </div>
                    <p className="form-note">
                      Mes 1 es el siguiente mes pendiente. Incluimos ambos
                      extremos.
                    </p>
                    <details className="advanced-options">
                      <summary>Crédito activo y opciones avanzadas</summary>
                      <NumberField
                        label="Cuotas ya pagadas"
                        value={state.prepayment.monthsPaid}
                        onChange={(value) =>
                          updatePrepayment("monthsPaid", value)
                        }
                        max={Math.max(0, state.prepayment.months - 1)}
                      />
                      <label className="checkbox-card">
                        <input
                          type="checkbox"
                          checked={
                            state.prepayment.currentBalance !== undefined
                          }
                          onChange={(event) =>
                            updatePrepayment(
                              "currentBalance",
                              event.target.checked
                                ? state.prepayment.principal
                                : undefined,
                            )
                          }
                        />
                        <span>Ingresar el saldo actual de mi banco</span>
                      </label>
                      {state.prepayment.currentBalance !== undefined && (
                        <NumberField
                          label="Saldo actual de capital"
                          value={state.prepayment.currentBalance}
                          onChange={(value) =>
                            updatePrepayment("currentBalance", value)
                          }
                          prefix="$"
                          min={0.01}
                          max={state.prepayment.principal}
                          step={0.01}
                        />
                      )}
                      <SelectField
                        label="Base para calcular la tasa"
                        value={state.prepayment.rateSource}
                        onChange={(value) =>
                          updatePrepayment(
                            "rateSource",
                            value as PrepaymentInput["rateSource"],
                          )
                        }
                        hint="La tasa implícita supone que la cuota no incluye seguros ni comisiones."
                      >
                        <option value="annual">Usar la tasa ingresada</option>
                        <option value="bankPayment">
                          Inferir de la cuota bancaria original
                        </option>
                      </SelectField>
                      {state.prepayment.rateSource === "bankPayment" && (
                        <NumberField
                          label="Cuota bancaria original"
                          value={state.prepayment.bankPayment}
                          onChange={(value) =>
                            updatePrepayment("bankPayment", value)
                          }
                          prefix="$"
                          min={0.01}
                          step={0.01}
                        />
                      )}
                      <SelectField
                        label="Momento del abono"
                        value={state.prepayment.timing}
                        onChange={(value) =>
                          updatePrepayment(
                            "timing",
                            value as PrepaymentInput["timing"],
                          )
                        }
                      >
                        <option value="end">
                          Al final, después de la cuota
                        </option>
                        <option value="start">
                          Al inicio, antes de los intereses
                        </option>
                      </SelectField>
                    </details>
                  </>
                ) : (
                  <p className="form-note">
                    <Info size={15} /> Cuota fija mensual. La tasa permanece
                    constante.
                  </p>
                )}
              </>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <button className="primary-button calculate-button" type="submit">
              {kind === "prepayment"
                ? "Comparar escenarios"
                : kind === "investment"
                  ? "Proyectar inversión"
                  : "Calcular crédito"}
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="text-button example-button"
              onClick={loadExample}
            >
              Cargar ejemplo{kind === "prepayment" ? " del reporte" : ""}
            </button>
            <div className="form-privacy">
              <LockSimple size={13} /> Los cálculos se realizan en tu
              dispositivo.
            </div>
          </form>
          <div className="small-guide">
            <span className="guide-icon">
              <Sparkle size={20} />
            </span>
            <div>
              <h3>
                {kind === "investment"
                  ? "La constancia suma"
                  : kind === "prepayment"
                    ? "Un abono, un nuevo escenario"
                    : "Primero entiende, luego decide"}
              </h3>
              <p>
                {kind === "investment"
                  ? "Prueba distintos aportes y plazos para encontrar una meta que puedas sostener."
                  : kind === "prepayment"
                    ? "Cambiar el momento del abono también puede cambiar el ahorro. Revisa los supuestos."
                    : "Mira el total de intereses además de la cuota. Los dos cuentan al elegir un crédito."}
              </p>
            </div>
          </div>
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
                <span className="eyebrow">
                  {kind === "credit"
                    ? "TU CUOTA MENSUAL"
                    : kind === "prepayment"
                      ? "LO QUE AHORRARÍAS EN INTERESES"
                      : "VALOR TOTAL PROYECTADO"}
                </span>
                <h2 id="summary-title" className="summary-value">
                  {currency(heroValue)}
                  <span>COP</span>
                </h2>
                <p>
                  {kind === "credit"
                    ? `Durante ${loan!.rows.length} meses. La última cuota puede variar por redondeo.`
                    : kind === "prepayment"
                      ? `${percent(prepayment!.savedPercentage, 1)} menos intereses futuros con tu plan de abonos.`
                      : `Al finalizar ${investment!.rows.length} meses, bajo los supuestos elegidos.`}
                </p>
              </div>
              <div className="summary-art" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="summary-stats">
              {kind === "credit" ? (
                <>
                  <Stat
                    label="Total de intereses"
                    value={currency(loan!.totalInterest)}
                  />
                  <Stat label="Total a pagar" value={currency(totalPayment)} />
                  <Stat
                    label="Tasa mensual"
                    value={percent(loan!.monthlyRate * 100)}
                  />
                </>
              ) : kind === "prepayment" ? (
                <>
                  <Stat
                    label="Meses ahorrados"
                    value={`${prepayment!.monthsSaved} meses`}
                  />
                  <Stat
                    label="Plazo con abonos"
                    value={`${prepayment!.adjusted.rows.length} meses`}
                  />
                  <Stat
                    label="Total de abonos"
                    value={currency(prepayment!.adjusted.totalExtra)}
                  />
                </>
              ) : (
                <>
                  <Stat
                    label="Capital aportado"
                    value={currency(investment!.totalContributions)}
                  />
                  <Stat
                    label="Rendimientos brutos"
                    value={currency(investment!.totalInterest)}
                  />
                  <Stat
                    label="Saldo invertido"
                    value={currency(investment!.finalBalance)}
                  />
                </>
              )}
            </div>
          </section>
          <p role="status" className="sr-only">
            {status}
          </p>
          {prepayment && (
            <section
              className="comparison-panel"
              aria-label="Comparativo ejecutivo"
            >
              <div className="comparison-row comparison-header">
                <span>Resumen ejecutivo</span>
                <span>Sin abonos</span>
                <span>Con abonos</span>
              </div>
              {[
                [
                  "Intereses futuros",
                  currency(prepayment.baseline.totalInterest),
                  currency(prepayment.adjusted.totalInterest),
                ],
                [
                  "Total de pagos futuros",
                  currency(prepayment.baseline.totalPaid),
                  currency(prepayment.adjusted.totalPaid),
                ],
                [
                  "Meses pendientes",
                  `${prepayment.baseline.rows.length} meses`,
                  `${prepayment.adjusted.rows.length} meses`,
                ],
              ].map(([label, before, after]) => (
                <div className="comparison-row" key={label}>
                  <span>{label}</span>
                  <span>{before}</span>
                  <strong>{after}</strong>
                </div>
              ))}
              <p className="comparison-footnote">
                Saldo inicial: {currency(prepayment.baseline.startingBalance)} ·
                E. A. utilizada: {percent(prepayment.impliedAnnualRate, 4)} ·
                Abono al{" "}
                {snapshot.inputs.prepayment.timing === "start"
                  ? "inicio"
                  : "final"}{" "}
                del período.
              </p>
            </section>
          )}
          <section className="chart-panel" aria-labelledby="chart-title">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  {kind === "credit"
                    ? "CAPITAL VS. INTERESES"
                    : kind === "prepayment"
                      ? "DOS ESCENARIOS, UNA DECISIÓN"
                      : "CRECIMIENTO ESTIMADO"}
                </span>
                <h2 id="chart-title">{content.chartTitle}</h2>
              </div>
              <span className="chart-unit">COP</span>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-copper" />
                {kind === "credit"
                  ? "Capital"
                  : kind === "prepayment"
                    ? "Con abonos"
                    : "Valor total"}
              </span>
              <span>
                <i className="legend-neutral" />
                {kind === "credit"
                  ? "Intereses"
                  : kind === "prepayment"
                    ? "Sin abonos"
                    : "Capital aportado"}
              </span>
            </div>
            <ResultChart kind={kind} {...snapshot.results} />
            <p className="chart-description">{content.chartDescription}</p>
          </section>
          <div className="insight">
            <CheckCircle size={19} />
            <p>
              {kind === "credit" ? (
                <>
                  Por cada {currency(loan!.startingBalance)} prestados, pagarías{" "}
                  {currency(loan!.totalInterest)} en intereses durante el plazo.
                  Seguros y comisiones se calculan aparte.
                </>
              ) : kind === "prepayment" ? (
                <>
                  El ahorro compara únicamente el futuro de tu crédito.{" "}
                  {snapshot.inputs.prepayment.mode === "payment"
                    ? "La cuota se recalcula después de cada abono."
                    : "Mantienes la cuota y terminas antes."}
                </>
              ) : (
                <>
                  Los rendimientos mostrados son brutos.{" "}
                  {snapshot.inputs.investment.reinvest
                    ? "La reinversión permite que tus intereses también crezcan."
                    : "El valor total incluye los rendimientos retirados, separados del saldo invertido."}
                </>
              )}
            </p>
          </div>
          {loan && (
            <Link
              href="/abonos/"
              className="continue-link"
              onClick={() =>
                setState((previous) => ({
                  ...previous,
                  prepayment: {
                    ...defaultPrepayment,
                    ...snapshot.inputs.loan,
                    endMonth: snapshot.inputs.loan.months,
                    startMonth: 1,
                  },
                }))
              }
            >
              Explorar cuánto ahorrarías con abonos a capital{" "}
              <ArrowUpRight size={17} />
            </Link>
          )}
        </div>
      </div>
      <ScheduleTable
        key={kind}
        loan={loan ?? prepayment?.adjusted}
        baseline={prepayment?.baseline}
        investment={investment}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
