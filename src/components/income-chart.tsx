"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactCurrency, currency } from "@/lib/format";
import type { IncomeResult } from "@/lib/finance/types";

export default function IncomeChart({
  result,
  initialCapital,
}: {
  result: IncomeResult;
  initialCapital: number;
}) {
  const data = [
    { month: 0, balance: initialCapital, target: result.requiredCapital },
    ...result.projection.rows.map((row) => ({
      month: row.month,
      balance: row.balance,
      target: result.requiredCapital,
    })),
  ];
  return (
    <div
      className="chart-canvas"
      role="group"
      aria-label="Capital acumulado y capital objetivo. Los valores exactos están en los hitos y la tabla."
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 12, right: 12, bottom: 14, left: 0 }}
        >
          <CartesianGrid
            stroke="#282725"
            vertical={false}
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#aaa39c", fontSize: 11 }}
            minTickGap={32}
            tickFormatter={(value) => `Mes ${value}`}
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
          />
          <Line
            dataKey="target"
            name="Meta de capital"
            stroke="#8c8985"
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Capital acumulado"
            stroke="#cc9166"
            strokeWidth={2.5}
            dot={data.length === 1}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
