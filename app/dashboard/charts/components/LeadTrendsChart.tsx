"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartAxisTick,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
	useChartTextColor,
} from "@/components/ui/chart";
import { format, parseISO } from "date-fns";
import {
	CartesianGrid,
	Line,
	LineChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { LeadTrend } from "../types/analytics";

interface LeadTrendsChartProps {
	data: LeadTrend[];
}

export function LeadTrendsChart({ data }: LeadTrendsChartProps) {
	const chartTextColor = useChartTextColor();
	const chartConfig = {
		total: {
			label: "Total Leads",
			color: "hsl(var(--chart-1))",
		},
		qualified: {
			label: "Qualified Leads",
			color: "hsl(var(--chart-2))",
		},
	};

	const formattedData = data.map((item) => ({
		...item,
		dateLabel: format(parseISO(item.date), "MMM dd"),
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Lead Generation Trends</CardTitle>
				<CardDescription>Monitor lead acquisition over time</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[300px] w-full"
				>
					<LineChart data={formattedData} width={500} height={300}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="dateLabel"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							style={{ fontSize: "12px" }}
							tick={<ChartAxisTick fill={chartTextColor} />}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							style={{ fontSize: "12px" }}
							tick={<ChartAxisTick fill={chartTextColor} />}
						/>
						<Tooltip content={<ChartTooltipContent />} />
						<ChartLegendContent />
						<Line
							type="monotone"
							dataKey="total"
							stroke={chartConfig.total.color}
							strokeWidth={2}
							dot={false}
							name={chartConfig.total.label}
						/>
						<Line
							type="monotone"
							dataKey="qualified"
							stroke={chartConfig.qualified.color}
							strokeWidth={2}
							dot={false}
							name={chartConfig.qualified.label}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
