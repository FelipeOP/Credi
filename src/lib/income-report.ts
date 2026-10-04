import { currency, percent } from "./format";
import type { IncomeInput, IncomeResult } from "./finance/types";
import type { ReportModel } from "./report";

export const assetLabels = {
  cdt: "CDT",
  savings: "Cajita / cuenta remunerada",
  etf: "ETF (escenario de rentabilidad)",
};
export const goalTime = (month: number | null, horizon: number) =>
  month === null
    ? `No alcanzada en ${horizon} meses`
    : month === 0
      ? "Hoy"
      : `${Math.floor(month / 12) ? `${Math.floor(month / 12)} años, ` : ""}${month % 12} meses (mes ${month})`;

export function buildIncomeReport(
  input: IncomeInput,
  result: IncomeResult,
): ReportModel {
  const projection = result.projection;
  return {
    kind: "income",
    title: "Plan para tu meta de ingresos",
    subtitle: "Capital objetivo y tiempo estimado de acumulación.",
    parameters: [
      ["Ingreso mensual deseado", currency(input.desiredMonthlyIncome, 2)],
      ["Tipo de inversión", assetLabels[input.assetKind]],
      ["Rentabilidad asumida E.A.", percent(input.annualRate)],
      ["Equivalente mensual", percent(projection.monthlyRate * 100, 4)],
      ["Capital inicial", currency(input.initialCapital, 2)],
      ["Aporte al final del mes", currency(input.monthlyContribution, 2)],
      ["Horizonte máximo", `${input.maximumMonths} meses`],
    ],
    metrics: [
      ["Capital necesario", currency(result.requiredCapital, 2)],
      ["Ingreso mensual objetivo", currency(input.desiredMonthlyIncome, 2)],
      ["Tiempo estimado", goalTime(result.monthsToGoal, input.maximumMonths)],
      [
        "Saldo al cierre de la proyección",
        currency(projection.finalBalance, 2),
      ],
    ],
    explanations: [
      "Capital necesario = ingreso mensual / tasa mensual equivalente. La tasa mensual se obtiene por capitalización compuesta de la E.A.; no se divide entre 12. El capital objetivo se redondea hacia arriba a centavos.",
      "Reinvertimos todos los rendimientos durante la acumulación y añadimos los aportes al final de cada mes. La proyección termina al alcanzar la meta o agotar el horizonte. No retiramos ingresos durante esta etapa.",
      result.monthsToGoal === null
        ? `La meta no se alcanza en ${input.maximumMonths} meses. Faltarían ${currency(result.shortfall, 2)}; el saldo final generaría aproximadamente ${currency(result.projectedMonthlyIncome, 2)} brutos mensuales con la tasa asumida.`
        : `Al cerrar la acumulación, el saldo generaría aproximadamente ${currency(result.projectedMonthlyIncome, 2)} brutos mensuales bajo la tasa constante asumida. Retirar únicamente esos rendimientos conserva el capital nominal en este modelo.`,
      "La rentabilidad es un supuesto fijo y bruto; excluye impuestos, comisiones e inflación. 9 % E.A. es un ejemplo editable, no una oferta. El ingreso mensual es un equivalente, no un calendario de pagos del producto.",
      input.assetKind === "etf"
        ? "Los ETFs fluctúan y pueden perder valor. Rentabilidad total no equivale a dividendos ni garantiza pagos mensuales. Vender participaciones puede consumir capital."
        : "Un CDT puede pagar al vencimiento y no permitir aportes. Una cajita puede variar su tasa. Los aportes representan tu plan de ahorro, no la disponibilidad de aportes en un producto concreto.",
    ],
    annualTables: [
      {
        title: "Hitos de tu meta",
        columns: ["Hito", "Capital objetivo", "Momento estimado"],
        rows: result.milestones.map((milestone) => [
          `${milestone.percentage} %`,
          currency(milestone.capital, 2),
          goalTime(milestone.month, input.maximumMonths),
        ]),
      },
      ...(projection.annualRows.length
        ? [
            {
              title: "Resumen anual de acumulación",
              columns: ["Año", "Aportes", "Rendimientos", "Saldo"],
              rows: projection.annualRows.map((row) => [
                String(row.year),
                currency(row.contribution, 2),
                currency(row.interest, 2),
                currency(row.balance, 2),
              ]),
            },
          ]
        : []),
    ],
    monthlyTables: [
      {
        title: "Acumulación mensual",
        columns: ["Mes", "Aporte", "Rendimiento", "Saldo"],
        rows: projection.rows.map((row) => [
          String(row.month),
          currency(row.contribution, 2),
          currency(row.interest, 2),
          currency(row.balance, 2),
        ]),
      },
    ],
    chart: {
      title: "Capital acumulado frente a la meta",
      firstLabel: "Capital acumulado",
      secondLabel: "Meta de capital",
      first: [
        input.initialCapital,
        ...projection.rows.map((row) => row.balance),
      ],
      second: [
        result.requiredCapital,
        ...projection.rows.map(() => result.requiredCapital),
      ],
    },
  };
}
