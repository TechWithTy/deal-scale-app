"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Shared demo data kept tiny and typed
const monthly: Array<{ m: string; a: number; b: number }> = [
  { m: "Jan", a: 186, b: 80 },
  { m: "Feb", a: 305, b: 200 },
  { m: "Mar", a: 237, b: 120 },
  { m: "Apr", a: 73, b: 190 },
  { m: "May", a: 209, b: 130 },
  { m: "Jun", a: 214, b: 140 },
];

const browsers: Array<{ name: string; v: number; fill?: string }> = [
  { name: "Chrome", v: 275, fill: "var(--chart-1)" },
  { name: "Safari", v: 200, fill: "var(--chart-2)" },
  { name: "Firefox", v: 187, fill: "var(--chart-3)" },
  { name: "Edge", v: 173, fill: "var(--chart-4)" },
  { name: "Other", v: 90, fill: "var(--chart-5)" },
];

const skills: Array<{ metric: string; score: number }> = [
  { metric: "Speed", score: 120 },
  { metric: "Quality", score: 98 },
  { metric: "Reliability", score: 86 },
  { metric: "UX", score: 99 },
  { metric: "DX", score: 85 },
];

// Small wrappers so each chart stays focused
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 font-medium text-sm">{title}</div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ChartsGallery() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Area */}
      <Card title="Area Chart (A/B)">
        <AreaChart data={monthly} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis hide />
          <Tooltip labelStyle={{ fontWeight: 600 }} />
          <Legend />
          <Area type="monotone" dataKey="a" name="A" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.25} />
          <Area type="monotone" dataKey="b" name="B" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.25} />
        </AreaChart>
      </Card>

      {/* Bar */}
      <Card title="Bar Chart (A/B)">
        <BarChart data={monthly} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis hide />
          <Tooltip />
          <Legend />
          <Bar dataKey="a" name="A" fill="var(--chart-1)" radius={4} />
          <Bar dataKey="b" name="B" fill="var(--chart-2)" radius={4} />
        </BarChart>
      </Card>

      {/* Line */}
      <Card title="Line Chart (A/B)">
        <LineChart data={monthly} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis hide />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="a" name="A" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="b" name="B" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
        </LineChart>
      </Card>

      {/* Pie */}
      <Card title="Pie Chart (Browsers)">
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie data={browsers} dataKey="v" nameKey="name" innerRadius={40} outerRadius={80} strokeOpacity={0.6} />
        </PieChart>
      </Card>

      {/* Radar */}
      <Card title="Radar Chart (Skills)">
        <RadarChart data={skills} outerRadius={80}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={30} domain={[0, 130]} tickCount={4} />
          <Tooltip />
          <Radar name="Score" dataKey="score" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} />
        </RadarChart>
      </Card>

      {/* Radial Bar */}
      <Card title="Radial Bar (Completion)">
        <RadialBarChart
          data={[{ name: "Complete", v: 78, fill: "var(--chart-4)" }]}
          innerRadius={40}
          outerRadius={90}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="v" cornerRadius={10} />
          <Legend />
          <Tooltip />
        </RadialBarChart>
      </Card>
    </div>
  );
}
