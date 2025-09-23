"use client";

import { useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	LabelList,
} from "recharts";

import type { ActivityDataPoint, ChartConfigLocal } from "../types";
import CustomNode from "./CustomNode";
import CustomPopover from "./CustomPopover";

type ActivityLineGraphProps = {
	data: ActivityDataPoint[];
	config: ChartConfigLocal;
	lines: string[];
	title?: string;
	description?: string;
	showLabels?: boolean;
	labelFormatter?: (key: string) => string;
};

export default function ActivityLineGraph({
	data,
	config,
	lines,
	title,
	description,
	showLabels = false,
	labelFormatter,
}: ActivityLineGraphProps) {
	const [activeNode, setActiveNode] = useState<ActivityDataPoint | null>(null);

	// Inline CSS variables for theme-aware series colors like --color-desktop
	const colorVars: React.CSSProperties = lines.reduce((vars, key) => {
		const color = config[key]?.color;
		if (color) {
			// @ts-expect-error: dynamic CSS var key
			vars[`--color-${key}`] = color;
		}
		return vars;
	}, {} as React.CSSProperties);

	return (
		<div className="flex flex-col gap-4" style={colorVars}>
			{title && <h3 className="font-semibold text-lg">{title}</h3>}
			{description && (
				<p className="text-muted-foreground text-sm">{description}</p>
			)}

			<ResponsiveContainer width="100%" height={300}>
				<LineChart
					data={data}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="hsl(var(--border))"
					/>
					<XAxis
						dataKey="timestamp"
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
						tickFormatter={(value) => new Date(value).toLocaleDateString()}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
					/>
					<Tooltip
						cursor={{
							stroke: "hsl(var(--muted-foreground))",
							strokeDasharray: "4 4",
						}}
						content={({ active, payload }) => {
							if (!active || !payload || payload.length === 0) return null;
							const node = payload[0]?.payload as ActivityDataPoint;
							return <CustomPopover config={config} activeNode={node} />;
						}}
					/>

					{lines.map((lineKey) => (
						<Line
							key={lineKey}
							type="monotone"
							dataKey={lineKey}
							stroke={config[lineKey]?.color || `var(--color-${lineKey})`}
							strokeWidth={2}
							dot={(props) => (
								<CustomNode
									{...props}
									config={config}
									dataKey={lineKey}
									onHover={setActiveNode}
								/>
							)}
							activeDot={<CustomNode config={config} dataKey={lineKey} />}
						>
							{showLabels && (
								<LabelList
									dataKey={lineKey}
									position="top"
									offset={10}
									className="fill-foreground text-xs"
									formatter={(value: unknown) =>
										labelFormatter ? labelFormatter(lineKey) : String(value)
									}
								/>
							)}
						</Line>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
