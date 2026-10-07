import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import { Formula } from "@/components/formula";

export const metadata: Metadata = {
  title: "Metodología y supuestos de cálculo",
  alternates: { canonical: "/metodologia/" },
};
export default function MethodologyPage() {
  return (
    <main id="main-content" className="page-container prose-page">
      <span className="eyebrow">CÁLCULOS TRANSPARENTES</span>
      <h1>
        Detrás de <span>cada número.</span>
      </h1>
      <p className="prose-lead">
        Estas son las reglas que usa Credi para que puedas interpretar y
        comprobar tus simulaciones.
      </p>
      <nav
        className="methodology-navigation"
        aria-label="Temas de la metodología"
      >
        <a href="#rates">Tasas</a>
        <a href="#payments">Cuotas</a>
        <a href="#prepayments">Abonos</a>
        <a href="#investments">Inversión</a>
        <a href="#income">Meta de ingresos</a>
      </nav>
      <p className="methodology-note">
        Antes de empezar: las tasas de estas fórmulas se expresan como
        decimales. Una tasa de 10 % se escribe como 0,10; una de 2 %, como 0,02.
      </p>
      <h2 id="rates">Conversión de tasas</h2>
      <p>
        Para calcular pagos o rendimientos mensuales necesitamos una tasa de
        cada mes. La conversión depende del tipo de tasa que ingreses: una
        efectiva anual incluye capitalización y no se divide entre 12.
      </p>
      <Formula
        title="De efectiva anual a mensual"
        expression={String.raw`i = (1+r)^{\frac{1}{12}} - 1`}
        description="Buscamos la tasa mensual que, al capitalizarse durante 12 meses, equivale a la rentabilidad o al costo anual."
        variables={[
          ["i", "Tasa mensual equivalente, en decimal."],
          ["r", "Tasa efectiva anual (E.A.), en decimal."],
        ]}
        example="10 % E.A. equivale aproximadamente a 0,7974 % mensual. Dividir 10 % entre 12 daría 0,8333 % y no conservaría la equivalencia."
      />
      <Formula
        title="De nominal anual vencida a mensual"
        expression={String.raw`i = \left(1+\frac{j}{m}\right)^{\frac{m}{12}} - 1`}
        description="Primero obtenemos la tasa de cada período de capitalización; después la convertimos a un mes equivalente. No admitimos tasas nominales anticipadas."
        variables={[
          ["j", "Tasa nominal anual, en decimal."],
          ["m", "Períodos de capitalización por año (12 si es mes vencido)."],
          ["i", "Tasa mensual equivalente, en decimal."],
        ]}
        example="24 % nominal anual mes vencido (N.A.M.V.) se expresa como j = 0,24 y m = 12. El resultado es i = 0,02, es decir, 2 % M.V."
      />
      <h2 id="payments">Crédito de cuota fija</h2>
      <p>
        Si ingresas una tasa mensual mes vencido (M.V.), la usamos directamente
        cada mes. Si ingresas una nominal anual mes vencido (N.A.M.V.), la
        dividimos entre 12. Por ejemplo, 2 % M.V. y 24 % N.A.M.V. producen la
        misma tasa mensual; su equivalente es aproximadamente 26,82 % E.A. El
        porcentaje mensual tiene su propio campo y no reemplaza el anual.
      </p>
      <p>
        La cuota cubre los intereses del mes y devuelve una parte del préstamo.
        Con tasa positiva, la calculamos así:
      </p>
      <Formula
        title="Cuota mensual con tasa fija"
        expression={String.raw`C = \frac{P\,i}{1-(1+i)^{-n}}`}
        description="La fórmula distribuye el pago del préstamo y sus intereses en cuotas mensuales iguales. Si la tasa es cero, simplemente usamos C = P / n."
        variables={[
          [
            "C",
            "Cuota mensual de capital e intereses, sin seguros ni comisiones.",
          ],
          ["P", "Monto prestado, en pesos."],
          ["i", "Tasa mensual, en decimal."],
          ["n", "Número de meses del crédito."],
        ]}
        example="Para $1.000.000 a 1 % mensual durante 12 meses, la cuota teórica es aproximadamente $88.848,79. La última cuota puede ajustarse por centavos de redondeo."
      />
      <Formula
        title="Qué parte de la cuota reduce tu deuda"
        expression={String.raw`\begin{aligned} I_t &= S_{t-1}\,i \\ K_t &= C_t-I_t \\ S_t &= S_{t-1}-K_t \end{aligned}`}
        description="Primero calculamos el interés sobre la deuda al inicio del mes. Lo que queda de la cuota paga capital. Este saldo todavía no incluye abonos adicionales."
        variables={[
          ["t", "Mes que estamos calculando."],
          ["Sₜ₋₁ / Sₜ", "Saldo al inicio / al final del mes."],
          ["Iₜ", "Intereses del mes."],
          ["Cₜ", "Cuota pagada en ese mes."],
          ["Kₜ", "Capital pagado dentro de la cuota."],
          ["i", "Tasa mensual, en decimal."],
        ]}
        example="Si debes $10.000.000 a 1 % mensual y pagas una cuota de $500.000, los intereses son $100.000. Los $400.000 restantes reducen la deuda a $9.600.000."
      />
      <h2 id="prepayments">Abonos a capital</h2>
      <p>
        Ambos escenarios parten del mismo saldo y tasa. Si no ingresas un saldo
        actual, lo reconstruimos desde el monto original y las cuotas pagadas,
        suponiendo pagos puntuales y sin modificaciones anteriores.
      </p>
      <Formula
        title="Ahorro de intereses con abonos"
        expression={String.raw`\Delta I = I_{\mathrm{sin}}-I_{\mathrm{con}}`}
        description="Comparamos los intereses futuros de dos escenarios que parten del mismo saldo y tasa. Los intereses ya pagados quedan fuera del ahorro."
        variables={[
          ["ΔI", "Intereses que dejarías de pagar."],
          ["I sin", "Total de intereses futuros sin abonos."],
          ["I con", "Total de intereses futuros con tu plan de abonos."],
        ]}
        example="Sin abonos pagarías $3.000.000 de intereses futuros y con abonos pagarías $1.800.000, el ahorro sería $1.200.000."
      />
      <p>
        Al inicio del período, el abono reduce el saldo antes de calcular
        intereses. Al final, se paga la cuota ordinaria y después se abona al
        saldo restante. En reducción de plazo conservamos la cuota; en reducción
        de cuota calculamos una nueva cuota para los períodos restantes después
        de cada abono. Los abonos se limitan a la deuda pendiente.
      </p>
      <h2>Cuota bancaria y tasa implícita</h2>
      <p>
        Opcionalmente resolvemos la tasa que corresponde al monto, plazo y cuota
        originales. La inferencia supone pagos uniformes y una cuota que
        contiene únicamente capital e intereses. No debe interpretarse como tasa
        contractual cuando el cobro incluye otros conceptos.
      </p>
      <p>
        Si proporcionas un saldo real que difiere del reconstruido, la última
        cuota del escenario base puede ajustarse para cerrar el saldo en el
        plazo restante. Revisa ese último pago antes de interpretar la
        comparación.
      </p>
      <h2 id="investments">Inversión</h2>
      <p>
        Convertimos la E. A. a una tasa mensual equivalente. Liquidamos
        rendimientos sobre el saldo del inicio del mes y añadimos el aporte al
        final. Si reinviertes, los intereses se incorporan al saldo; si retiras,
        se acumulan por separado y no generan rendimientos nuevos.
      </p>
      <Formula
        title="Crecimiento mensual con reinversión"
        expression={String.raw`B_t = B_{t-1}(1+i)+a`}
        description="El saldo genera rendimientos durante el mes. Si los reinviertes, se incorporan al capital; el aporte se suma al final y empieza a generar rendimientos el mes siguiente."
        variables={[
          ["Bₜ₋₁ / Bₜ", "Saldo invertido al inicio / al cierre del mes."],
          ["i", "Tasa mensual equivalente, en decimal."],
          ["a", "Aporte al final del mes, en pesos."],
        ]}
        example="Con $1.000.000 iniciales, 1 % mensual y un aporte de $100.000, cerrarías el primer mes con $1.110.000: $1.000.000 + $10.000 de rendimiento + $100.000 de aporte."
      />
      <p>
        Es una proyección mensual bruta a tasa fija. Excluye impuestos,
        comisiones e inflación. Un CDT puede liquidar por días, usar una base
        contractual distinta y no permitir aportes adicionales.
      </p>
      <h2 id="income">Meta de ingresos mensuales</h2>
      <Formula
        title="Capital necesario para tu ingreso mensual"
        expression={String.raw`P_{\mathrm{meta}} = \frac{G}{i}`}
        description="Dividimos el ingreso mensual deseado entre la tasa mensual equivalente para estimar el capital que lo generaría bajo una tasa constante."
        variables={[
          ["P meta", "Capital objetivo, redondeado hacia arriba a centavos."],
          ["G", "Ingreso mensual bruto que quieres generar."],
          ["i", "Tasa mensual equivalente, en decimal."],
        ]}
        example="Para generar $1.000.000 brutos al mes con una tasa de 1 % mensual, necesitarías $100.000.000: $1.000.000 ÷ 0,01."
      />
      <p>
        El capital objetivo es el ingreso mensual deseado dividido entre la tasa
        mensual equivalente. Lo redondeamos hacia arriba a centavos. La línea
        del tiempo reinvierte todos los rendimientos y añade aportes al final
        del mes, hasta alcanzar la meta o el horizonte máximo. Los hitos
        corresponden al primer mes en que se alcanza cada porcentaje del
        objetivo.
      </p>
      <p>
        Usamos 9 % E.A. como supuesto editable, no como oferta. El ingreso es un
        equivalente mensual bruto. Un CDT puede pagar al vencimiento; una cajita
        puede cambiar su tasa. Un ETF tiene precio variable: rentabilidad total
        no equivale a dividendos ni garantiza un ingreso mensual. Retirar solo
        rendimientos conserva el capital nominal únicamente bajo el supuesto
        constante del modelo, sin impuestos, comisiones ni inflación.
      </p>
      <h2>Redondeo y agregación</h2>
      <p>
        El motor usa precisión decimal de 32 dígitos y redondea los movimientos
        monetarios a dos decimales, con mitad hacia arriba. El último pago
        absorbe residuos de centavos. La interfaz muestra pesos enteros para
        lectura; el PDF muestra dos decimales. Los años agrupan los meses del
        contrato en bloques de 12, con el saldo al cierre del último mes.
      </p>
      <h2>Referencia para tasas</h2>
      <p>
        Consulta el{" "}
        <a
          href="https://www.superfinanciera.gov.co/publicaciones/61554/consumidor-financieroinformacion-generalsimulador-de-conversion-de-tasas-de-interes-61554/"
          target="_blank"
          rel="noreferrer"
        >
          simulador de conversión de tasas de la Superintendencia Financiera de
          Colombia
        </a>{" "}
        para ampliar los conceptos.
      </p>
      <Link className="primary-button" href="/credito/">
        Volver a las calculadoras
      </Link>
    </main>
  );
}
