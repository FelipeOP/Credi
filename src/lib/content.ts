import type { CalculatorKind } from "./finance/types";

const monthlyRateFaq = [
  "¿Cuál es la diferencia entre M.V., N.A.M.V. y E.A.?",
  "M.V. es la tasa de cada mes, con intereses liquidados al final del período. N.A.M.V. es una tasa nominal anual dividida en 12 meses: 24 % N.A.M.V. equivale a 2 % M.V. La efectiva anual incorpora la capitalización: ese 2 % mensual equivale aproximadamente a 26,82 % E.A., no a 24 % E.A. Si tu extracto dice 2 % M.V., selecciona Mensual M.V.; si dice 24 % nominal anual mes vencido, selecciona Nominal anual y periodicidad Mes vencido.",
];
const principalFaq = [
  "¿Qué es el capital pagado en la cuota?",
  "Es la parte de tu cuota que devuelve el dinero prestado y reduce la deuda. Se calcula restando los intereses de la cuota: si pagas $500.000 y $100.000 corresponden a intereses, abonas $400.000 de capital. Los intereses pagan el costo del préstamo, pero no reducen el saldo. Si además haces un abono de $200.000, tu deuda baja $600.000 en total. La tabla separa el capital de la cuota del abono adicional.",
];

export const calculatorContent = {
  credit: {
    path: "/credito/",
    label: "Crédito",
    eyebrow: "PLANEA TU CRÉDITO",
    title: "Cada cuota,",
    emphasis: "con claridad.",
    description:
      "Conoce cuánto pagarás, cómo se distribuyen tus cuotas y el costo real de los intereses.",
    formTitle: "Tu crédito",
    formDescription: "Empieza con los datos que quieres simular.",
    resultTitle: "Así se ve tu crédito",
    chartTitle: "Lo que pagas en cada cuota",
    chartDescription:
      "Al principio pagas más intereses. Con el tiempo, una mayor parte de tu cuota reduce el capital.",
    faqs: [
      monthlyRateFaq,
      principalFaq,
      [
        "¿Qué es una tasa efectiva anual (E. A.)?",
        "Expresa el crecimiento equivalente de una tasa durante un año, incluyendo su capitalización. Para calcular cuotas mensuales convertimos la E. A. a una tasa mensual equivalente; no la dividimos entre 12.",
      ],
      [
        "¿En qué se diferencia de la tasa nominal anual?",
        "La nominal anual se interpreta junto con su periodicidad. Por ejemplo, una nominal anual mes vencido se divide entre 12 para obtener la tasa de cada mes. Credi admite tasas nominales vencidas; las anticipadas requieren otra conversión.",
      ],
      [
        "¿Qué muestra la tabla de amortización?",
        "Cada fila separa cuota ordinaria, interés del período, capital amortizado y saldo pendiente. La suma del capital amortizado debe corresponder al dinero prestado.",
      ],
      [
        "¿Por qué mi banco puede cobrar una cuota diferente?",
        "El cobro puede incluir seguros, comisiones u otras condiciones. Esta simulación considera capital e intereses a tasa fija. En Abonos puedes estimar una tasa implícita a partir de una cuota bancaria, siempre que corresponda solo al crédito.",
      ],
      [
        "¿Cómo se agrupan los años?",
        "El año 1 corresponde a los meses 1 a 12 del crédito, no al año calendario. El último grupo puede contener menos de 12 meses.",
      ],
    ],
  },
  prepayment: {
    path: "/abonos/",
    label: "Abonos a capital",
    eyebrow: "DA EL SIGUIENTE PASO",
    title: "Menos intereses.",
    emphasis: "Más posibilidades.",
    description:
      "Compara tu crédito con y sin abonos. Descubre cuánto puedes ahorrar y cuándo terminarías de pagar.",
    formTitle: "Tu plan de abonos",
    formDescription: "Define un aporte adicional que puedas sostener.",
    resultTitle: "El efecto de tus abonos",
    chartTitle: "Un camino más corto hacia cero",
    chartDescription:
      "Compara el saldo pendiente de ambos escenarios al terminar cada mes. La misma tasa y el mismo saldo inicial se usan en los dos.",
    faqs: [
      monthlyRateFaq,
      principalFaq,
      [
        "¿Qué es un abono a capital?",
        "Es un pago adicional que reduce directamente la deuda pendiente. No es lo mismo que adelantar cuotas: su efecto depende de que el banco lo aplique al capital.",
      ],
      [
        "¿Reducir plazo o reducir cuota?",
        "Reducir plazo conserva la cuota ordinaria y permite terminar antes. Reducir cuota conserva los meses contratados y recalcula la cuota después de cada abono, mientras exista saldo. Compara el ahorro y el flujo de caja que te resulte sostenible.",
      ],
      [
        "¿Desde cuándo se cuentan los meses de abono?",
        "Mes 1 significa el siguiente mes pendiente de tu crédito. Si ya pagaste 8 cuotas, el primer mes de la simulación es el mes 9 del contrato. Los meses inicial y final del abono se incluyen.",
      ],
      [
        "¿Importa el momento del abono?",
        "Sí. Al inicio del período reduce el saldo antes de calcular ese mes de interés. Al final se aplica después de la cuota ordinaria y reduce el interés de los meses siguientes. Elige la convención que corresponda a tu operación.",
      ],
      [
        "¿Qué significa la tasa implícita de la cuota?",
        "Es la tasa que hace equivalentes el préstamo, las cuotas y el plazo original. Es una estimación matemática: si la cuota contiene seguros o comisiones, esos conceptos se mezclarían con la tasa. No demuestra por sí sola que la tasa contractual sea incorrecta.",
      ],
      [
        "¿El ahorro incluye lo que ya pagué?",
        "No. Comparamos únicamente los pagos e intereses futuros, desde el saldo actual. Los intereses de cuotas anteriores ya ocurrieron y no se pueden ahorrar con un abono futuro.",
      ],
    ],
  },
  investment: {
    path: "/inversion/",
    label: "Inversión",
    eyebrow: "PROYECTA TU INVERSIÓN",
    title: "Tu dinero hoy.",
    emphasis: "Su potencial mañana.",
    description:
      "Explora cómo crecería tu capital con una tasa fija, aportes mensuales y reinversión de rendimientos.",
    formTitle: "Tu inversión",
    formDescription: "Una proyección sencilla para planear mejor.",
    resultTitle: "El crecimiento que puedes proyectar",
    chartTitle: "El tiempo también aporta",
    chartDescription:
      "Distingue lo que aportas de lo que genera tu inversión. El valor total incluye los intereses retirados cuando no los reinviertes.",
    faqs: [
      [
        "¿Qué es el interés compuesto?",
        "Ocurre cuando reinviertes los rendimientos: los intereses de períodos anteriores también generan intereses. Si los retiras, el saldo no recibe ese crecimiento adicional.",
      ],
      [
        "¿Esta proyección sirve para un CDT?",
        "Sirve para explorar un equivalente mensual con tasa fija E. A. Un CDT puede liquidar por días, usar una base contractual diferente y pagar al vencimiento. Esta proyección no sustituye esa liquidación exacta ni supone que permita aportes adicionales.",
      ],
      [
        "¿Cuándo se aplican los aportes?",
        "Al final de cada mes, después de calcular los rendimientos. Por eso un aporte empieza a generar intereses en el mes siguiente.",
      ],
      [
        "¿Qué pasa si no reinvierto?",
        "Mostramos por separado el saldo invertido y los rendimientos acumulados retirados. El valor total es la suma de ambos, sin asumir que el dinero retirado produce nuevos intereses.",
      ],
      [
        "¿Incluye impuestos, inflación o comisiones?",
        "No. Los rendimientos son brutos y la tasa permanece fija durante toda la proyección. La rentabilidad neta y el poder adquisitivo pueden ser diferentes.",
      ],
    ],
  },
  income: {
    path: "/ingresos/",
    label: "Meta de ingresos",
    eyebrow: "CONSTRUYE TU META",
    title: "Un ingreso mensual.",
    emphasis: "Un plan para lograrlo.",
    description: "Calcula el capital que necesitarías para generar rendimientos mensuales y cuánto tardarías en reunirlo con tus aportes.",
    formTitle: "Tu meta de ingresos",
    formDescription: "Elige un ingreso y un aporte que puedas sostener.",
    resultTitle: "Tu camino hacia la meta",
    chartTitle: "Cada aporte te acerca",
    chartDescription: "Reinvertimos los rendimientos mientras acumulas capital. La línea de meta indica el saldo necesario para el ingreso elegido.",
    faqs: [
      ["¿Cómo calculan cuánto necesito invertir?", "Dividimos el ingreso mensual deseado entre la tasa mensual equivalente: capital = ingreso / ((1 + E.A.)^(1/12) − 1). Por ejemplo, a 1 % mensual necesitas $100.000.000 para generar $1.000.000 brutos al mes. La tasa predeterminada de 9 % E.A. es un supuesto editable, no una oferta de una entidad."],
      ["¿Qué representa la línea del tiempo?", "Muestra cuándo alcanzarías el 25 %, 50 %, 75 % y 100 % del capital objetivo. Durante esta etapa reinviertes todos los rendimientos y aportas al final de cada mes. Si tu capital inicial ya alcanza la meta, puedes verla cumplida hoy. Si no la alcanzas dentro del horizonte, mostramos el faltante y el ingreso estimado al cierre."],
      ["¿Un CDT o una cajita me pagarán cada mes?", "Depende del producto. Un CDT puede pagar al vencimiento y no permitir aportes; una cajita puede cambiar su tasa. Aquí el ingreso es un equivalente mensual bruto. Para recibir pagos mensuales reales debes revisar periodicidad, disponibilidad y condiciones del producto."],
      ["¿Sirve para proyectar un ETF?", "Solo como escenario matemático con una rentabilidad constante asumida. Un ETF fluctúa y puede perder valor; rentabilidad total y dividendos no son lo mismo. No garantiza un pago mensual. Vender participaciones para obtener ingresos puede consumir capital."],
      ["¿Puedo retirar ese ingreso sin reducir el capital?", "En este modelo constante, una vez reunido el capital objetivo, retirar solo los rendimientos conserva el capital nominal. No modelamos impuestos, comisiones, inflación ni variaciones de precio o tasa. Por eso no es una estrategia garantizada de retiros ni una rentabilidad neta."],
    ],
  },
} satisfies Record<
  CalculatorKind,
  {
    path: string;
    label: string;
    eyebrow: string;
    title: string;
    emphasis: string;
    description: string;
    formTitle: string;
    formDescription: string;
    resultTitle: string;
    chartTitle: string;
    chartDescription: string;
    faqs: string[][];
  }
>;
