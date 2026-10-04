import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Line,
} from "@react-pdf/renderer";
import type { ReportModel, ReportTable } from "@/lib/report";
import { currency } from "@/lib/format";

const palette = {
  ink: "#252220",
  muted: "#716b65",
  copper: "#995d35",
  rule: "#dedad5",
  wash: "#f5f3f0",
};
// Specify font size with lineHeight: PDF resolves leading before inheritance.
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 54,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: palette.ink,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  brand: { fontSize: 26, fontFamily: "Helvetica-Bold", color: palette.copper },
  headerNote: {
    fontSize: 8,
    lineHeight: 1.35,
    color: palette.muted,
    textAlign: "right",
  },
  title: {
    fontSize: 21,
    lineHeight: 1.15,
    fontFamily: "Helvetica-Bold",
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 9,
    lineHeight: 1.4,
    color: palette.muted,
    marginBottom: 22,
  },
  section: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.7,
    borderBottomColor: palette.rule,
  },
  executive: { flexDirection: "row", gap: 22, marginBottom: 24 },
  highlight: {
    width: "47%",
    backgroundColor: palette.wash,
    borderRadius: 5,
    padding: 18,
    justifyContent: "center",
  },
  metricLabel: { fontSize: 9, lineHeight: 1.3, color: palette.muted },
  metricValue: {
    fontSize: 23,
    lineHeight: 1.1,
    fontFamily: "Helvetica-Bold",
    color: palette.copper,
    marginTop: 10,
  },
  metricList: { flexGrow: 1, flexBasis: 0 },
  metricRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.rule,
  },
  metricRowValue: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 5 },
  body: { fontSize: 9, lineHeight: 1.45, color: palette.ink },
  caption: { fontSize: 8, lineHeight: 1.35, color: palette.muted },
  callout: {
    backgroundColor: palette.wash,
    borderRadius: 4,
    padding: 14,
    marginTop: 22,
  },
  parameter: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.4,
    borderBottomColor: palette.rule,
  },
  parameterLabel: {
    width: "43%",
    fontSize: 8.5,
    lineHeight: 1.3,
    color: palette.muted,
  },
  parameterValue: { width: "57%", fontSize: 8.5, lineHeight: 1.3 },
  explanation: { flexDirection: "row", gap: 9, marginBottom: 10 },
  explanationNumber: {
    width: 15,
    fontSize: 8,
    lineHeight: 1.45,
    color: palette.copper,
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
  },
  explanationBody: {
    flexGrow: 1,
    flexBasis: 0,
    fontSize: 8.5,
    lineHeight: 1.45,
  },
  tableTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: palette.wash,
    borderTopWidth: 0.7,
    borderTopColor: palette.rule,
    borderBottomWidth: 0.7,
    borderBottomColor: palette.rule,
    minHeight: 32,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.4,
    borderBottomColor: "#e9e6e2",
    minHeight: 23,
    alignItems: "center",
  },
  cell: {
    fontSize: 8,
    lineHeight: 1.25,
    paddingHorizontal: 5,
    paddingVertical: 6,
    textAlign: "right",
  },
  headerCell: {
    fontSize: 7.5,
    lineHeight: 1.25,
    fontFamily: "Helvetica-Bold",
    color: palette.muted,
  },
  legend: { flexDirection: "row", gap: 22, marginTop: 8 },
  chartEnds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    height: 24,
    fontSize: 7,
    color: palette.muted,
    borderTopWidth: 0.7,
    borderTopColor: palette.rule,
    paddingTop: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, lineHeight: 1.25, color: palette.muted },
});

function Header({ date }: { date: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>credi.</Text>
      <View>
        <Text style={styles.headerNote}>REPORTE FINANCIERO · COP</Text>
        <Text style={styles.headerNote}>{date}</Text>
      </View>
    </View>
  );
}
function Footer() {
  // Dynamic page numbering inherits its type size; explicit Text leading clips it.
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Credi · Simulación estimada · Consulta los supuestos
      </Text>
      <Text
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}
function Chart({ chart }: { chart: ReportModel["chart"] }) {
  const width = 515;
  const height = 150;
  const maximum = Math.max(1, ...chart.first, ...chart.second);
  function path(values: number[]) {
    return values
      .map(
        (value, index) =>
          `${index ? "L" : "M"} ${(8 + (index / Math.max(1, values.length - 1)) * (width - 16)).toFixed(2)} ${(height - 10 - (value / maximum) * (height - 20)).toFixed(2)}`,
      )
      .join(" ");
  }
  return (
    <View>
      <Text style={styles.section}>{chart.title}</Text>
      <Text style={[styles.caption, { marginBottom: 8 }]}>
        Escala de referencia: {currency(0)} a {currency(maximum)}. Consulta las
        cifras exactas en las tablas.
      </Text>
      <Svg width={width} height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((value) => (
          <Line
            key={value}
            x1="0"
            x2={width}
            y1={height - 10 - value * (height - 20)}
            y2={height - 10 - value * (height - 20)}
            stroke="#e9e6e2"
            strokeWidth={0.5}
          />
        ))}
        <Path
          d={path(chart.first)}
          stroke="#88817a"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="none"
        />
        <Path
          d={path(chart.second)}
          stroke={palette.copper}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
      <View style={styles.chartEnds}>
        <Text style={styles.caption}>Inicio</Text>
        <Text style={styles.caption}>Último período</Text>
      </View>
      <View style={styles.legend}>
        <Text style={styles.caption}>
          {chart.firstLabel} · Línea discontinua
        </Text>
        <Text style={[styles.caption, { color: palette.copper }]}>
          {chart.secondLabel} · Línea continua
        </Text>
      </View>
    </View>
  );
}
function columnWidth(table: ReportTable, index: number) {
  const first = table.columns.length === 4 ? 31 : 6;
  return `${index === 0 ? first : (100 - first) / (table.columns.length - 1)}%`;
}
function TableBlock({
  table,
  rows = table.rows,
}: {
  table: ReportTable;
  rows?: string[][];
}) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.tableTitle}>{table.title}</Text>
      <View style={styles.tableHeader}>
        {table.columns.map((column, index) => (
          <Text
            key={column}
            style={[
              styles.cell,
              styles.headerCell,
              {
                width: columnWidth(table, index),
                textAlign: index === 0 ? "left" : "right",
              },
            ]}
          >
            {column}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View
          key={index}
          style={[styles.row, index % 2 ? { backgroundColor: "#fcfbfa" } : {}]}
          wrap={false}
        >
          {row.map((cell, cellIndex) => (
            <Text
              key={cellIndex}
              style={[
                styles.cell,
                {
                  width: columnWidth(table, cellIndex),
                  textAlign: cellIndex === 0 ? "left" : "right",
                },
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
function tablePages(table: ReportTable, date: string, key: string) {
  const pageSize = 24;
  const chunks = Array.from(
    { length: Math.ceil(table.rows.length / pageSize) },
    (_, index) => table.rows.slice(index * pageSize, (index + 1) * pageSize),
  );
  return chunks.map((rows, index) => (
    <Page key={`${key}-${index}`} size="A4" style={styles.page}>
      <Header date={date} />
      <Text style={styles.title}>{table.title}</Text>
      <Text style={styles.subtitle}>
        COP · Dos decimales · Detalle {index + 1} de {chunks.length}. Años del
        contrato o de la proyección, no del calendario.
      </Text>
      <TableBlock
        table={{ ...table, title: "Movimientos del período" }}
        rows={rows}
      />
      <Footer />
    </Page>
  ));
}
export function ReportDocument({
  report,
  includeMonthly = true,
  date,
}: {
  report: ReportModel;
  includeMonthly?: boolean;
  date: string;
}) {
  const compactAnnual =
    report.annualTables.reduce(
      (total, table) => total + table.rows.length,
      0,
    ) <= 14;
  return (
    <Document
      title={`Credi · ${report.title}`}
      author="Credi"
      subject="Simulación financiera en pesos colombianos"
      language="es-CO"
    >
      <Page size="A4" style={styles.page}>
        <Header date={date} />
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.subtitle}>{report.subtitle}</Text>
        <Text style={styles.section}>Tu simulación, en resumen</Text>
        <View style={styles.executive}>
          <View style={styles.highlight}>
            <Text style={styles.metricLabel}>{report.metrics[0][0]}</Text>
            <Text style={styles.metricValue}>{report.metrics[0][1]}</Text>
          </View>
          <View style={styles.metricList}>
            {report.metrics.slice(1).map(([label, value]) => (
              <View key={label} style={styles.metricRow}>
                <Text style={styles.metricLabel}>{label}</Text>
                <Text style={styles.metricRowValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
        <Chart chart={report.chart} />
        <View style={styles.callout}>
          <Text style={[styles.tableTitle, { color: palette.copper }]}>
            Cómo interpretar el resultado
          </Text>
          <Text style={styles.body}>{report.explanations[0]}</Text>
        </View>
        <Text style={[styles.caption, { marginTop: 12 }]}>
          Los datos, supuestos y movimientos se detallan a continuación. Este
          reporte es una estimación; no incluye costos o condiciones que no
          hayas modelado.
        </Text>
        <Footer />
      </Page>
      <Page size="A4" style={styles.page}>
        <Header date={date} />
        <Text style={styles.title}>Datos y supuestos</Text>
        <Text style={styles.subtitle}>
          Una lectura transparente de los parámetros y las reglas de tu
          simulación.
        </Text>
        <Text style={styles.section}>Datos utilizados</Text>
        {report.parameters.map(([label, value]) => (
          <View key={label} style={styles.parameter} wrap={false}>
            <Text style={styles.parameterLabel}>{label}</Text>
            <Text style={styles.parameterValue}>{value}</Text>
          </View>
        ))}
        <Text style={[styles.section, { marginTop: 22 }]}>
          Cómo se calculan tus resultados
        </Text>
        {report.explanations.map((explanation, index) => (
          <View key={index} style={styles.explanation} wrap={false}>
            <Text style={styles.explanationNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={styles.explanationBody}>{explanation}</Text>
          </View>
        ))}
        <Footer />
      </Page>
      {compactAnnual ? (
        <Page size="A4" style={styles.page}>
          <Header date={date} />
          <Text style={styles.title}>
            {report.kind === "prepayment"
              ? "Comparación y resumen anual"
              : "Resumen anual"}
          </Text>
          <Text style={styles.subtitle}>
            COP · Dos decimales · Los flujos se suman por año; los saldos
            corresponden al cierre del último mes.
          </Text>
          {report.annualTables.map((table, index) => (
            <TableBlock key={index} table={table} />
          ))}
          <Footer />
        </Page>
      ) : (
        report.annualTables.flatMap((table, index) =>
          tablePages(table, date, `annual-${index}`),
        )
      )}
      {includeMonthly &&
        report.monthlyTables.flatMap((table, index) =>
          tablePages(table, date, `monthly-${index}`),
        )}
    </Document>
  );
}
