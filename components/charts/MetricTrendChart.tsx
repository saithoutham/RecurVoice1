"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatDate } from "@/lib/utils";

type Datum = {
  date: string;
  value: number;
};

export function MetricTrendChart({
  data,
  lines,
  bands,
  yDomain
}: {
  data: Datum[];
  lines: { color: string; label: string };
  bands: Array<{ from: number; to: number; fill: string }>;
  yDomain: [number, number];
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatDate(value, { month: "short", day: "numeric" })}
            stroke="#6B7280"
          />
          <YAxis domain={yDomain} stroke="#6B7280" />
          {bands.map((band) => (
            <ReferenceArea
              key={`${band.from}-${band.to}`}
              y1={band.from}
              y2={band.to}
              fill={band.fill}
              fillOpacity={0.2}
            />
          ))}
          <Tooltip
            formatter={(value) => Number(value).toFixed(2)}
            labelFormatter={(value) => formatDate(String(value))}
          />
          <Line
            dataKey="value"
            type="monotone"
            stroke={lines.color}
            strokeWidth={3}
            dot={{ fill: lines.color, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
