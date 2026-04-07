"use client";

import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis, Tooltip } from "recharts";

type BenchmarkDatum = {
  label: string;
  x: number;
  y: number;
  low: number;
  high: number;
};

export function ComparisonChart({
  data,
  userValue
}: {
  data: BenchmarkDatum[];
  userValue: number;
}) {
  const overlay = data.map((entry) => ({
    ...entry,
    user: userValue
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            type="number"
            dataKey="x"
            tickFormatter={(value) => data.find((entry) => entry.x === value)?.label ?? ""}
            ticks={data.map((entry) => entry.x)}
            domain={[0.5, data.length + 0.5]}
          />
          <YAxis type="number" dataKey="y" domain={["dataMin - 1", "dataMax + 1"]} />
          <ZAxis type="number" range={[120]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill="#94A3B8" />
          <Scatter data={overlay.map((entry) => ({ x: entry.x, y: userValue }))} fill="#1B4332" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
