"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CampaignPerformance } from "../types/analytics";

interface CampaignPerformanceChartProps {
	data: CampaignPerformance[];
}

type MetricType = "leads" | "conversion" | "revenue";

export function CampaignPerformanceChart({
	data,
}: CampaignPerformanceChartProps) {
	const [metric, setMetric] = useState<MetricType>("leads");

	const chartConfig = {
		leads: { label: "Leads Generated", color: "hsl(var(--chart-1))" },
		conversion: { label: "Conversion Rate (%)", color: "hsl(var(--chart-2))" },
		revenue: { label: "Revenue ($)", color: "hsl(var(--chart-3))" },
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Campaign Performance</CardTitle>
						<CardDescription>
							Track your campaign metrics over time
						</CardDescription>
					</div>
					<Tabs
						value={metric}
						onValueChange={(v) => setMetric(v as MetricType)}
					>
						<TabsList>
							<TabsTrigger value="leads">Leads</TabsTrigger>
							<TabsTrigger value="conversion">Conversion</TabsTrigger>
							<TabsTrigger value="revenue">Revenue</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[300px] w-full"
				>
					<BarChart data={data} width={500} height={300}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="name"
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
						<Bar
							dataKey={metric}
							fill={chartConfig[metric].color}
							radius={[4, 4, 0, 0]}
							name={chartConfig[metric].label}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
