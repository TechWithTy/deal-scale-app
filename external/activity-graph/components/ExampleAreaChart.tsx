"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

// Example dataset: desktop vs mobile by month
const chartData: Array<{ month: string; desktop: number; mobile: number }> = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

/**
 * ExampleAreaChart
 * Self‑contained Recharts AreaChart example (no parent app dependencies).
 * Colors read from CSS variables: --chart-1 and --chart-2.
 * Ensure your host app defines these variables (see README for details).
 */
export default function ExampleAreaChart() {
  return (
    <div className="w-full">
      <div className="mb-2 text-muted-foreground text-sm">
        Showing total visitors for the last 6 months
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(v: string) => v.slice(0, 3)}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              labelStyle={{ fontWeight: 600 }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="desktop"
              name="Desktop"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="mobile"
              name="Mobile"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
