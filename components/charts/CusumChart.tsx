"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatDate } from "@/lib/utils";

export function CusumChart({
  data
}: {
  data: Array<{ date: string; value: number }>;
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
          <YAxis domain={[0, 5]} stroke="#6B7280" />
          <Tooltip
            formatter={(value) => Number(value).toFixed(2)}
            labelFormatter={(value) => formatDate(String(value))}
          />
          <ReferenceLine y={2} stroke="#B45309" strokeDasharray="4 4" />
          <ReferenceLine y={3} stroke="#C2410C" strokeDasharray="4 4" />
          <ReferenceLine y={4} stroke="#991B1B" strokeDasharray="4 4" />
          <Line
            dataKey="value"
            type="monotone"
            stroke="#1B4332"
            strokeWidth={3}
            dot={{ fill: "#1B4332", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
