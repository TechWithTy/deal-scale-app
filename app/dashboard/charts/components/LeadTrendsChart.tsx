"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { LeadTrend } from "../types/analytics";
import { format, parseISO } from "date-fns";

interface LeadTrendsChartProps {
	data: LeadTrend[];
}

export function LeadTrendsChart({ data }: LeadTrendsChartProps) {
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
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={formattedData}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="dateLabel"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								style={{ fontSize: "12px" }}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								style={{ fontSize: "12px" }}
							/>
							<Tooltip content={<ChartTooltipContent />} />
							<Legend />
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
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
