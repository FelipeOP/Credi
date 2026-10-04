"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactCurrency, currency } from "@/lib/format";
import type {
  CalculatorKind,
  InvestmentResult,
  LoanResult,
  PrepaymentResult,
} from "@/lib/finance/types";

export interface ChartProps {
  kind: CalculatorKind;
  loan?: LoanResult;
  prepayment?: PrepaymentResult;
  investment?: InvestmentResult;
}

export default function ResultChart({
  kind,
  loan,
  prepayment,
  investment,
}: ChartProps) {
  const data: Array<{ month: number; [key: string]: number }> =
    kind === "investment" && investment
      ? [
          {
            month: 0,
            contributions:
              investment.rows[0].totalContributions -
              investment.rows[0].contribution,
            value:
              investment.rows[0].totalContributions -
              investment.rows[0].contribution,
          },
          ...investment.rows.map((row) => ({
            month: row.month,
            contributions: row.totalContributions,
            value: row.totalContributions + row.totalInterest,
          })),
        ]
      : kind === "prepayment" && prepayment
        ? [
            {
              month: (prepayment.baseline.rows[0]?.month ?? 1) - 1,
              baseline: prepayment.baseline.startingBalance,
              adjusted: prepayment.adjusted.startingBalance,
            },
            ...prepayment.baseline.rows.map((row) => ({
              month: row.month,
              baseline: row.balance,
              adjusted:
                prepayment.adjusted.rows.find(
                  (adjusted) => adjusted.month === row.month,
                )?.balance ?? 0,
            })),
          ]
        : (loan?.rows.map((row) => ({
            month: row.month,
            interest: row.interest,
            principal: row.principal,
          })) ?? []);
  const axes = (
    <>
      <CartesianGrid stroke="#282725" vertical={false} strokeDasharray="3 6" />
      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        tick={{ fill: "#aaa39c", fontSize: 11 }}
        minTickGap={32}
        tickFormatter={(value: number) => `Mes ${value}`}
        dy={12}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tick={{ fill: "#aaa39c", fontSize: 11 }}
        tickFormatter={compactCurrency}
        width={70}
      />
      <Tooltip
        contentStyle={{
          background: "#1a1917",
          border: "1px solid #51453a",
          borderRadius: 8,
          color: "#f0ede8",
          fontSize: 12,
        }}
        formatter={(value) => currency(Number(value))}
        labelFormatter={(value) => `Mes ${value}`}
        cursor={{ fill: "#ffffff05" }}
      />
    </>
  );
  return (
    <div
      className="chart-canvas"
      role="group"
      aria-label={
        kind === "investment"
          ? "Gráfica de aportes y valor total. Los valores exactos están en la tabla."
          : kind === "prepayment"
            ? "Gráfica del saldo con y sin abonos. Los valores exactos están en las tablas."
            : "Gráfica de capital e intereses por cuota. Los valores exactos están en la tabla."
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        {kind === "investment" ? (
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, bottom: 14, left: 0 }}
          >
            {axes}
            <Area
              type="monotone"
              dataKey="value"
              name="Valor total"
              stroke="#cc9166"
              strokeWidth={2}
              fill="#cc9166"
              fillOpacity={0.08}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="contributions"
              name="Capital aportado"
              stroke="#8c8985"
              fill="#8c8985"
              fillOpacity={0.03}
              strokeDasharray="5 5"
              isAnimationActive={false}
            />
          </AreaChart>
        ) : kind === "prepayment" ? (
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, bottom: 14, left: 0 }}
          >
            {axes}
            <Line
              type="monotone"
              dataKey="baseline"
              name="Sin abonos"
              stroke="#8c8985"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="adjusted"
              name="Con abonos"
              stroke="#cc9166"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        ) : (
          <BarChart
            data={data}
            barCategoryGap="24%"
            margin={{ top: 12, right: 12, bottom: 14, left: 0 }}
          >
            {axes}
            <Bar
              dataKey="principal"
              name="Capital"
              stackId="payment"
              fill="#cc9166"
              isAnimationActive={false}
            />
            <Bar
              dataKey="interest"
              name="Intereses"
              stackId="payment"
              fill="#5c5a57"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
