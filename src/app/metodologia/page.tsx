import type { Metadata } from "next";
import Link from "next/link";

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
      <h2>Conversión de tasas</h2>
      <p>
        Para una tasa efectiva anual expresada como decimal, la tasa mensual es
        (1 + E. A.)^(1/12) − 1. Para una nominal anual vencida j, capitalizable
        m veces por año, usamos (1 + j/m)^(m/12) − 1. No admitimos nominales
        anticipadas.
      </p>
      <h2>Crédito de cuota fija</h2>
      <p>
        Si ingresas una tasa mensual mes vencido (M.V.), la usamos directamente
        cada mes. Si ingresas una nominal anual mes vencido (N.A.M.V.), la
        dividimos entre 12. Por ejemplo, 2 % M.V. y 24 % N.A.M.V. producen la
        misma tasa mensual; su equivalente es aproximadamente 26,82 % E.A.
        El porcentaje mensual tiene su propio campo y no reemplaza el anual.
      </p>
      <p>
        La cuota teórica es P × i / (1 − (1 + i)^−n), donde P es el capital, i
        la tasa mensual y n el plazo en meses. Si la tasa es cero, la cuota es
        P/n. El interés de cada mes es el saldo inicial multiplicado por i. La
        diferencia entre cuota e interés amortiza capital.
      </p>
      <h2>Abonos a capital</h2>
      <p>
        Ambos escenarios parten del mismo saldo y tasa. Si no ingresas un saldo
        actual, lo reconstruimos desde el monto original y las cuotas pagadas,
        suponiendo pagos puntuales y sin modificaciones anteriores.
      </p>
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
      <h2>Inversión</h2>
      <p>
        Convertimos la E. A. a una tasa mensual equivalente. Liquidamos
        rendimientos sobre el saldo del inicio del mes y añadimos el aporte al
        final. Si reinviertes, los intereses se incorporan al saldo; si retiras,
        se acumulan por separado y no generan rendimientos nuevos.
      </p>
      <p>
        Es una proyección mensual bruta a tasa fija. Excluye impuestos,
        comisiones e inflación. Un CDT puede liquidar por días, usar una base
        contractual distinta y no permitir aportes adicionales.
      </p>
      <h2>Meta de ingresos mensuales</h2>
      <p>
        El capital objetivo es el ingreso mensual deseado dividido entre la tasa
        mensual equivalente. Lo redondeamos hacia arriba a centavos. La línea del
        tiempo reinvierte todos los rendimientos y añade aportes al final del mes,
        hasta alcanzar la meta o el horizonte máximo. Los hitos corresponden al
        primer mes en que se alcanza cada porcentaje del objetivo.
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
