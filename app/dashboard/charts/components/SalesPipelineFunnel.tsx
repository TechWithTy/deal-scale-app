"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/_utils";
import type { SalesPipeline } from "../types/analytics";

interface SalesPipelineFunnelProps {
	data: SalesPipeline;
}

export function SalesPipelineFunnel({ data }: SalesPipelineFunnelProps) {
	const stages = [
		{
			key: "leads_total",
			label: "Total Leads",
			value: data.leads_total,
			color: "bg-blue-500",
		},
		{
			key: "contacted",
			label: "Contacted",
			value: data.contacted,
			color: "bg-indigo-500",
		},
		{
			key: "conversations",
			label: "Conversations",
			value: data.conversations,
			color: "bg-purple-500",
		},
		{
			key: "qualified",
			label: "Qualified",
			value: data.qualified,
			color: "bg-pink-500",
		},
		{
			key: "deals_closed",
			label: "Deals Closed",
			value: data.deals_closed,
			color: "bg-green-500",
		},
	];

	const maxValue = data.leads_total;

	const calculateConversionRate = (
		currentValue: number,
		previousValue: number,
	) => {
		if (previousValue === 0) return "0.0";
		return ((currentValue / previousValue) * 100).toFixed(1);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sales Pipeline Overview</CardTitle>
				<CardDescription>
					Visualize your complete sales pipeline
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{stages.map((stage, index) => {
						const widthPercentage =
							maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
						const conversionRate =
							index > 0
								? calculateConversionRate(stage.value, stages[index - 1].value)
								: "100.0";

						return (
							<div key={stage.key} className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium">{stage.label}</span>
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground">
											{stage.value.toLocaleString()}
										</span>
										{index > 0 && (
											<span className="text-muted-foreground text-xs">
												({conversionRate}%)
											</span>
										)}
									</div>
								</div>
								<div className="h-12 w-full rounded-md bg-muted">
									<div
										className={cn(
											"flex h-full items-center justify-center rounded-md transition-all duration-500",
											stage.color,
										)}
										style={{ width: `${widthPercentage}%` }}
									>
										{widthPercentage > 15 && (
											<span className="font-medium text-sm text-white">
												{stage.value.toLocaleString()}
											</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
