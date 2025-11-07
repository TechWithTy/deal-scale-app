"use client";

import React, { Fragment, useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	Pie,
	PieChart,
	XAxis,
} from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { HostEmbedConfig } from "external/embed/config";
import type { LiveChartResponse } from "@/lib/hooks/useLiveChartData";

type EmbedChartProps = {
	data: LiveChartResponse;
	config: HostEmbedConfig;
	onRefresh: () => void;
	isLoading: boolean;
};

type CartesianPoint = Record<string, string | number>;

const fallbackPalette = [
	"hsl(var(--deal-scale-chart-1, var(--chart-1)))",
	"hsl(var(--deal-scale-chart-2, var(--chart-2)))",
	"hsl(var(--deal-scale-chart-3, var(--chart-3)))",
	"hsl(var(--deal-scale-chart-4, var(--chart-4)))",
	"hsl(var(--deal-scale-chart-5, var(--chart-5)))",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
});

function buildChartConfig(data: LiveChartResponse): ChartConfig {
	return data.series.reduce<ChartConfig>((accumulator, series, index) => {
		accumulator[series.id] = {
			label: series.label,
			color: series.color ?? fallbackPalette[index % fallbackPalette.length],
		};
		return accumulator;
	}, {});
}

function buildCartesianDataset(data: LiveChartResponse): CartesianPoint[] {
	const rows = new Map<string, CartesianPoint>();

	data.series.forEach((series) => {
		series.points.forEach((point) => {
			const existing = rows.get(point.x) ?? { x: point.x };
			existing[series.id] = point.y;
			rows.set(point.x, existing);
		});
	});

	return Array.from(rows.entries())
		.sort(([first], [second]) =>
			first.localeCompare(second, undefined, { numeric: true }),
		)
		.map(([, value]) => value);
}

function buildPieDataset(data: LiveChartResponse) {
	return data.series.map((series, index) => ({
		name: series.label,
		value: series.points.reduce((total, point) => total + point.y, 0),
		fill: series.color ?? fallbackPalette[index % fallbackPalette.length],
	}));
}

export function EmbedChart({
	data,
	config,
	onRefresh,
	isLoading,
}: EmbedChartProps) {
	const chartConfig = useMemo(() => buildChartConfig(data), [data]);
	const cartesianData = useMemo(() => buildCartesianDataset(data), [data]);
	const pieData = useMemo(() => buildPieDataset(data), [data]);
	const latestValue =
		data.series.at(0)?.points.at(-1)?.y ?? data.series[0]?.points[0]?.y ?? 0;

	return (
		<div
			className="deal-scale-embed-chart"
			data-theme={config.theme}
			data-chart-type={data.type}
		>
			<header className="deal-scale-embed-header">
				<h3>{data.meta.title}</h3>
				{data.meta.description ? (
					<p className="deal-scale-embed-subtitle">{data.meta.description}</p>
				) : null}
			</header>

			<section aria-label="Deal Scale chart visualization">
				{data.type === "pie" ? (
					<ChartContainer config={chartConfig} className="deal-scale-chart">
						<PieChart>
							<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
							<Pie
								data={pieData}
								dataKey="value"
								nameKey="name"
								innerRadius={60}
								strokeWidth={4}
							>
								<Label
									position="center"
									content={({ viewBox }) => {
										if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
											return null;
										}

										return (
											<Fragment>
												<text
													x={viewBox.cx}
													y={viewBox.cy}
													className="deal-scale-embed-total"
													textAnchor="middle"
													dominantBaseline="central"
												>
													{latestValue.toLocaleString()}
												</text>
												<text
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 18}
													className="deal-scale-embed-unit"
													textAnchor="middle"
												>
													{data.meta.unit ?? ""}
												</text>
											</Fragment>
										);
									}}
								/>
							</Pie>
						</PieChart>
					</ChartContainer>
				) : (
					<ChartContainer config={chartConfig} className="deal-scale-chart">
						{data.type === "bar" ? (
							<BarChart
								accessibilityLayer
								data={cartesianData}
								margin={{ left: 12, right: 12 }}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="x"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(value) =>
										dateFormatter.format(new Date(value))
									}
								/>
								<ChartTooltip
									content={<ChartTooltipContent labelKey="x" nameKey="label" />}
								/>
								{data.series.map((series) => (
									<Bar
										key={series.id}
										dataKey={series.id}
										fill={`var(--color-${series.id})`}
										radius={[4, 4, 0, 0]}
									/>
								))}
							</BarChart>
						) : (
							<AreaChart
								accessibilityLayer
								data={cartesianData}
								margin={{ left: 12, right: 12 }}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="x"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(value) =>
										dateFormatter.format(new Date(value))
									}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent indicator="dot" />}
								/>
								{data.series.map((series) => (
									<Area
										key={series.id}
										dataKey={series.id}
										type="natural"
										fill={`var(--color-${series.id})`}
										fillOpacity={0.35}
										stroke={`var(--color-${series.id})`}
									/>
								))}
							</AreaChart>
						)}
					</ChartContainer>
				)}
			</section>

			<footer
				className="deal-scale-embed-footer"
				data-state={isLoading ? "loading" : "ready"}
			>
				<span className="deal-scale-embed-latest">
					Latest value: {latestValue.toLocaleString()}
					{data.meta.unit ? ` ${data.meta.unit}` : ""}
				</span>
				<button
					type="button"
					className="deal-scale-embed-refresh"
					onClick={onRefresh}
					disabled={isLoading}
				>
					Refresh
				</button>
			</footer>
		</div>
	);
}
