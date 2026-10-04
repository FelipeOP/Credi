import { currency, percent } from "./format";
import type {
  CalculatorKind,
  StandardCalculatorKind,
  InvestmentInput,
  InvestmentResult,
  LoanInput,
  LoanResult,
  PrepaymentInput,
  PrepaymentResult,
} from "./finance/types";

export interface ReportTable {
  title: string;
  columns: string[];
  rows: string[][];
}
export interface ReportModel {
  kind: CalculatorKind;
  title: string;
  subtitle: string;
  parameters: [string, string][];
  metrics: [string, string][];
  explanations: string[];
  annualTables: ReportTable[];
  monthlyTables: ReportTable[];
  chart: {
    title: string;
    firstLabel: string;
    secondLabel: string;
    first: number[];
    second: number[];
  };
}

export interface ReportSource {
  kind: StandardCalculatorKind;
  loanInput: LoanInput;
  prepaymentInput: PrepaymentInput;
  investmentInput: InvestmentInput;
  loan?: LoanResult;
  prepayment?: PrepaymentResult;
  investment?: InvestmentResult;
}

function loanTables(result: LoanResult, scenario: string) {
  return {
    annual: {
      title: `Resumen anual · ${scenario}`,
      columns: [
        "Año",
        "Total pagado",
        "Intereses",
        "Capital de la cuota",
        "Abono adicional",
        "Saldo",
      ],
      rows: result.annualRows.map((row) => [
        String(row.year),
        currency(row.payment, 2),
        currency(row.interest, 2),
        currency(row.principal, 2),
        currency(row.extraPayment, 2),
        currency(row.balance, 2),
      ]),
    },
    monthly: {
      title: `Detalle mensual · ${scenario}`,
      columns: [
        "Mes",
        "Cuota ordinaria",
        "Intereses",
        "Capital de la cuota",
        "Abono adicional",
        "Saldo",
      ],
      rows: result.rows.map((row) => [
        String(row.month),
        currency(row.payment, 2),
        currency(row.interest, 2),
        currency(row.principal, 2),
        currency(row.extraPayment, 2),
        currency(row.balance, 2),
      ]),
    },
  };
}

export function buildReport(source: ReportSource): ReportModel {
  const {
    kind,
    loanInput,
    prepaymentInput,
    investmentInput,
    loan,
    prepayment,
    investment,
  } = source;
  const input = kind === "prepayment" ? prepaymentInput : loanInput;
  const common: [string, string][] = [
    ["Monto original", currency(input.principal, 2)],
    [
      "Tasa ingresada",
      input.rateKind === "monthly"
        ? `${percent(input.monthlyRate ?? 0)} M.V. (mensual mes vencido)`
        : `${percent(input.annualRate)} ${input.rateKind === "effective" ? "E. A." : input.compoundingPeriods === 12 ? "N.A.M.V. (nominal anual mes vencido)" : `nominal anual vencida (${input.compoundingPeriods} períodos/año)`}`,
    ],
    ["Plazo original", `${input.months} meses`],
  ];
  if (kind === "investment" && investment) {
    return {
      kind,
      title: "Proyección de inversión",
      subtitle: "Una lectura completa del crecimiento estimado de tu dinero.",
      parameters: [
        ["Capital inicial", currency(investmentInput.principal, 2)],
        ["Tasa fija E. A.", percent(investmentInput.annualRate)],
        ["Plazo", `${investmentInput.months} meses`],
        ["Aporte mensual", currency(investmentInput.monthlyContribution, 2)],
        [
          "Rendimientos",
          investmentInput.reinvest
            ? "Reinvertidos cada mes"
            : "Retirados cada mes",
        ],
        ["Tasa mensual equivalente", percent(investment.monthlyRate * 100, 4)],
      ],
      metrics: [
        ["Valor total", currency(investment.totalValue, 2)],
        ["Capital aportado", currency(investment.totalContributions, 2)],
        ["Rendimientos brutos", currency(investment.totalInterest, 2)],
        ["Saldo invertido", currency(investment.finalBalance, 2)],
      ],
      explanations: [
        "La tasa E. A. se convierte a su equivalente mensual: (1 + E. A.)^(1/12) - 1. Los aportes se realizan después de liquidar los intereses del mes.",
        investmentInput.reinvest
          ? "Los rendimientos se suman al saldo y generan nuevos intereses desde el mes siguiente."
          : "Los intereses se retiran. El valor total incluye capital invertido y rendimientos retirados, sin atribuir rentabilidad adicional a esos retiros.",
        "Esta proyección es bruta: excluye impuestos, comisiones e inflación. La tasa permanece fija. Un CDT real puede liquidar por días y no permitir aportes; consulta sus condiciones.",
        "Los años se agrupan en bloques de 12 meses desde el inicio; el saldo anual es el cierre del último mes del grupo. Las cifras se redondean a centavos, con mitad hacia arriba.",
      ],
      annualTables: [
        {
          title: "Resumen anual",
          columns: [
            "Año",
            "Aportes del año",
            "Rendimientos",
            "Capital acumulado",
            "Interés acumulado",
            "Saldo invertido",
          ],
          rows: investment.annualRows.map((row) => [
            String(row.year),
            currency(row.contribution, 2),
            currency(row.interest, 2),
            currency(row.totalContributions, 2),
            currency(row.totalInterest, 2),
            currency(row.balance, 2),
          ]),
        },
      ],
      monthlyTables: [
        {
          title: "Detalle mensual",
          columns: [
            "Mes",
            "Aporte",
            "Rendimiento",
            "Capital acumulado",
            "Interés acumulado",
            "Saldo invertido",
          ],
          rows: investment.rows.map((row) => [
            String(row.month),
            currency(row.contribution, 2),
            currency(row.interest, 2),
            currency(row.totalContributions, 2),
            currency(row.totalInterest, 2),
            currency(row.balance, 2),
          ]),
        },
      ],
      chart: {
        title: "Capital aportado y valor total",
        firstLabel: "Capital aportado",
        secondLabel: "Valor total",
        first: [
          investmentInput.principal,
          ...investment.rows.map((row) => row.totalContributions),
        ],
        second: [
          investmentInput.principal,
          ...investment.rows.map(
            (row) => row.totalContributions + row.totalInterest,
          ),
        ],
      },
    };
  }
  if (kind === "prepayment" && prepayment) {
    const baseline = loanTables(prepayment.baseline, "sin abonos");
    const adjusted = loanTables(prepayment.adjusted, "con abonos");
    return {
      kind,
      title: "Comparación de abonos a capital",
      subtitle: "El efecto de tus aportes adicionales sobre los pagos futuros.",
      parameters: [
        ...common,
        ["Cuotas ya pagadas", String(prepaymentInput.monthsPaid)],
        [
          "Saldo inicial comparado",
          currency(prepayment.baseline.startingBalance, 2),
        ],
        [
          "Origen del saldo",
          prepaymentInput.currentBalance === undefined
            ? "Reconstruido desde el crédito original"
            : "Saldo actual ingresado",
        ],
        [
          "Base de tasa",
          prepaymentInput.rateSource === "bankPayment"
            ? "Implícita de la cuota bancaria"
            : "Tasa anual ingresada",
        ],
        ["Cuota ordinaria inicial", currency(prepayment.baseline.payment, 2)],
        [
          "Tasa mensual utilizada",
          percent(prepayment.baseline.monthlyRate * 100, 4),
        ],
        ["E. A. utilizada", percent(prepayment.impliedAnnualRate, 4)],
        ["Abono recurrente", currency(prepaymentInput.extraPayment, 2)],
        [
          "Ventana de abonos",
          `Mes ${prepaymentInput.startMonth} a ${prepaymentInput.endMonth} desde ahora, inclusive`,
        ],
        [
          "Modo",
          prepaymentInput.mode === "term"
            ? "Reducir plazo, mantener cuota"
            : "Reducir cuota, mantener plazo",
        ],
        [
          "Momento",
          prepaymentInput.timing === "start"
            ? "Inicio del período, antes del interés"
            : "Fin del período, después de la cuota",
        ],
      ],
      metrics: [
        ["Ahorro en intereses", currency(prepayment.interestSaved, 2)],
        ["Reducción de intereses", percent(prepayment.savedPercentage)],
        ["Meses ahorrados", String(prepayment.monthsSaved)],
        [
          "Plazo con abonos",
          `${prepayment.adjusted.rows.length} meses pendientes`,
        ],
      ],
      explanations: [
        "Ambos escenarios parten del mismo saldo y usan la misma tasa. El ahorro es la diferencia entre sus intereses futuros; no incluye intereses ya pagados.",
        "Capital de la cuota = cuota ordinaria − intereses. Por ejemplo, de una cuota de $500.000 con $100.000 de intereses, $400.000 reducen la deuda. Los abonos adicionales también reducen la deuda y se presentan por separado.",
        prepaymentInput.mode === "term"
          ? "Se conserva la cuota ordinaria y se reduce el número de períodos. La última cuota o el último abono se limitan al saldo pendiente."
          : "Cada abono recalcula la cuota para los períodos pendientes. La cuota cambia después de cada abono y no vuelve a la cuota original cuando termina la ventana de aportes.",
        prepaymentInput.timing === "start"
          ? "El abono se aplica antes del interés del mes. Si cancela toda la deuda, ese mes puede contener solo el abono final, sin cuota ni intereses."
          : "El interés del mes se calcula sobre el saldo inicial. Primero se paga la cuota ordinaria y después se aplica el abono al capital restante.",
        prepaymentInput.rateSource === "bankPayment"
          ? "La tasa implícita supone que la cuota bancaria corresponde únicamente a capital e intereses. Si incluye seguros o comisiones, la inferencia no representa la tasa contractual."
          : input.rateKind === "monthly"
            ? "La tasa M.V. ingresada es el porcentaje de cada mes; se utiliza directamente y no se divide entre 12. La cuota se calcula con el plazo original, sin seguros ni comisiones."
            : "La cuota se calcula a partir de la tasa anual y el plazo original. En N.A.M.V., la tasa mensual es la nominal anual dividida entre 12. Los seguros y comisiones no se incluyen.",
        "Se redondea cada movimiento a dos decimales, con mitad hacia arriba. El último pago absorbe el residuo de redondeo. Los años son bloques de 12 meses del contrato, no años calendario.",
      ],
      annualTables: [
        {
          title: "Comparativo ejecutivo",
          columns: ["Métrica", "Sin abonos", "Con abonos", "Diferencia"],
          rows: [
            [
              "Total de pagos futuros",
              currency(prepayment.baseline.totalPaid, 2),
              currency(prepayment.adjusted.totalPaid, 2),
              currency(
                prepayment.baseline.totalPaid - prepayment.adjusted.totalPaid,
                2,
              ),
            ],
            [
              "Intereses futuros",
              currency(prepayment.baseline.totalInterest, 2),
              currency(prepayment.adjusted.totalInterest, 2),
              currency(prepayment.interestSaved, 2),
            ],
            [
              "Meses pendientes",
              String(prepayment.baseline.rows.length),
              String(prepayment.adjusted.rows.length),
              String(prepayment.monthsSaved),
            ],
            [
              "Abonos adicionales",
              currency(0, 2),
              currency(prepayment.adjusted.totalExtra, 2),
              currency(prepayment.adjusted.totalExtra, 2),
            ],
          ],
        },
        baseline.annual,
        adjusted.annual,
      ],
      monthlyTables: [baseline.monthly, adjusted.monthly],
      chart: {
        title: "Saldo pendiente de ambos escenarios",
        firstLabel: "Sin abonos",
        secondLabel: "Con abonos",
        first: [
          prepayment.baseline.startingBalance,
          ...prepayment.baseline.rows.map((row) => row.balance),
        ],
        second: [
          prepayment.adjusted.startingBalance,
          ...prepayment.baseline.rows.map(
            (row) =>
              prepayment.adjusted.rows.find(
                (other) => other.month === row.month,
              )?.balance ?? 0,
          ),
        ],
      },
    };
  }
  if (!loan) throw new Error("El reporte no tiene resultados de crédito.");
  const tables = loanTables(loan, "crédito");
  return {
    kind,
    title: "Tabla de amortización de crédito",
    subtitle: "Conoce el costo y la distribución de cada cuota.",
    parameters: [
      ...common,
      ["Tasa mensual equivalente", percent(loan.monthlyRate * 100, 4)],
      ["Sistema", "Cuota fija, pagos mensuales vencidos"],
    ],
    metrics: [
      ["Cuota mensual", currency(loan.payment, 2)],
      ["Intereses totales", currency(loan.totalInterest, 2)],
      ["Total pagado", currency(loan.totalPaid, 2)],
      ["Plazo", `${loan.rows.length} meses`],
    ],
    explanations: [
      "Capital de la cuota = cuota ordinaria − intereses. De una cuota de $500.000 con $100.000 de intereses, $400.000 reducen la deuda. Los intereses son el costo del préstamo y no reducen el saldo.",
      input.rateKind === "monthly"
        ? "La tasa mensual mes vencido (M.V.) se aplica directamente al saldo de cada mes, sin dividirla entre 12. Su equivalente anual es (1 + tasa mensual)^12 - 1."
        : input.rateKind === "nominal" && input.compoundingPeriods === 12
          ? "La nominal anual mes vencido (N.A.M.V.) se divide entre 12 para obtener la tasa mensual. Su equivalente efectivo anual incorpora la capitalización de esos 12 períodos."
          : "La tasa E. A. se convierte por equivalencia compuesta. Para una tasa nominal anual vencida, primero se usa su periodicidad de capitalización.",
      "Esta simulación excluye seguros y comisiones y conserva la tasa durante todo el crédito. La última cuota puede variar ligeramente por redondeo.",
      "Los años son bloques de 12 meses del contrato. El saldo anual es el cierre del último mes del grupo; no es una suma de saldos.",
    ],
    annualTables: [tables.annual],
    monthlyTables: [tables.monthly],
    chart: {
      title: "Capital e intereses por cuota",
      firstLabel: "Capital",
      secondLabel: "Intereses",
      first: loan.rows.map((row) => row.principal),
      second: loan.rows.map((row) => row.interest),
    },
  };
}
