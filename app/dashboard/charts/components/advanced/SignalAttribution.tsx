"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Target } from "lucide-react";
import type { SignalToSaleAttribution } from "../../types/advanced-analytics";

interface SignalAttributionProps {
	data: SignalToSaleAttribution[];
}

export function SignalAttribution({ data }: SignalAttributionProps) {
	const chartConfig = {
		conversionRate: {
			label: "Conversion Rate (%)",
			color: "hsl(var(--chart-1))",
		},
		avgIntentScore: {
			label: "Avg Intent Score",
			color: "hsl(var(--chart-2))",
		},
	};

	const bestPerformer = data.reduce((best, current) =>
		current.conversionRate > best.conversionRate ? current : best,
	);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Target className="h-5 w-5 text-primary" />
					<CardTitle>Signal → Sale Attribution</CardTitle>
				</div>
				<CardDescription>
					Which lead sources actually close deals
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Chart */}
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full mb-6"
				>
					<BarChart data={data} width={500} height={250}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="signalType"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							style={{ fontSize: "11px" }}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							style={{ fontSize: "11px" }}
						/>
						<Tooltip content={<ChartTooltipContent />} />
						<Legend />
						<Bar
							dataKey="conversionRate"
							fill={chartConfig.conversionRate.color}
							radius={[4, 4, 0, 0]}
							name="Conversion Rate %"
						/>
					</BarChart>
				</ChartContainer>

				{/* Attribution Table */}
				<div className="space-y-2">
					{data.map((signal) => (
						<div
							key={signal.signalType}
							className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
						>
							<div className="flex-1">
								<p className="font-medium text-sm">{signal.signalType}</p>
								<p className="text-xs text-muted-foreground">
									{signal.leadCount} leads → {signal.dealsClosed} deals
								</p>
							</div>
							<div className="text-right space-y-1">
								<p className="font-bold text-sm">{signal.conversionRate}%</p>
								<p className="text-xs text-muted-foreground">
									${(signal.avgDealValue / 1000).toFixed(1)}K avg
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Best Performer Highlight */}
				<div className="mt-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
					<p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">
						🏆 Best Performing Channel
					</p>
					<p className="text-sm font-semibold text-green-900 dark:text-green-300">
						{bestPerformer.signalType} - {bestPerformer.conversionRate}%
						conversion rate
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
