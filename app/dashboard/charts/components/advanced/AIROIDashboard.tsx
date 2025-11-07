"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/_utils";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import type { AIROIMetrics } from "../../types/advanced-analytics";

interface AIROIDashboardProps {
	metrics: AIROIMetrics;
}

export function AIROIDashboard({ metrics }: AIROIDashboardProps) {
	const isPositiveROI = metrics.roiPercent > 0;
	const hoursaved = Math.round(metrics.timeSavedMinutes / 60);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>AI ROI Dashboard</CardTitle>
						<CardDescription>
							Dollar value of time saved vs. your plan cost
						</CardDescription>
					</div>
					<div
						className={cn(
							"rounded-full px-3 py-1 font-bold text-sm",
							isPositiveROI
								? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
								: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
						)}
					>
						{isPositiveROI ? "+" : ""}
						{metrics.roiPercent.toFixed(0)}% ROI
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-3">
					{/* Time Saved */}
					<div className="space-y-2 rounded-lg border p-4">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Clock className="h-4 w-4" />
							<p className="font-medium text-xs">Time Saved</p>
						</div>
						<p className="font-bold text-3xl">{hoursaved}h</p>
						<p className="text-muted-foreground text-xs">
							{metrics.timeSavedMinutes.toLocaleString()} minutes this month
						</p>
					</div>

					{/* Value Saved */}
					<div className="space-y-2 rounded-lg border p-4">
						<div className="flex items-center gap-2 text-muted-foreground">
							<DollarSign className="h-4 w-4" />
							<p className="font-medium text-xs">Value Saved</p>
						</div>
						<p className="font-bold text-3xl text-green-600 dark:text-green-500">
							${Math.round(metrics.estimatedValueSaved).toLocaleString()}
						</p>
						<p className="text-muted-foreground text-xs">
							@ ${metrics.hourlyValue}/hour rate
						</p>
					</div>

					{/* Net Benefit */}
					<div className="space-y-2 rounded-lg border p-4">
						<div className="flex items-center gap-2 text-muted-foreground">
							<TrendingUp className="h-4 w-4" />
							<p className="font-medium text-xs">Net Benefit</p>
						</div>
						<p
							className={cn(
								"font-bold text-3xl",
								isPositiveROI
									? "text-green-600 dark:text-green-500"
									: "text-red-600 dark:text-red-500",
							)}
						>
							$
							{Math.round(
								metrics.estimatedValueSaved - metrics.planCost,
							).toLocaleString()}
						</p>
						<p className="text-muted-foreground text-xs">
							Plan cost: ${metrics.planCost.toLocaleString()}
						</p>
					</div>
				</div>

				{/* ROI Breakdown */}
				<div className="mt-6 rounded-lg bg-muted p-4">
					<p className="mb-3 font-medium text-sm">This Month's Impact:</p>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Your automations worked for:
							</span>
							<span className="font-semibold">{hoursaved} hours</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Equivalent manual labor cost:
							</span>
							<span className="font-semibold">
								${Math.round(metrics.estimatedValueSaved).toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Your plan investment:
							</span>
							<span className="font-semibold text-red-600 dark:text-red-500">
								-${metrics.planCost.toLocaleString()}
							</span>
						</div>
						<div className="my-2 h-px bg-border" />
						<div className="flex items-center justify-between">
							<span className="font-medium">Return on Investment:</span>
							<span
								className={cn(
									"font-bold text-lg",
									isPositiveROI
										? "text-green-600 dark:text-green-500"
										: "text-red-600 dark:text-red-500",
								)}
							>
								{isPositiveROI ? "+" : ""}
								{metrics.roiPercent.toFixed(1)}%
							</span>
						</div>
						{metrics.roiDelta !== 0 && (
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">vs. last month:</span>
								<span
									className={cn(
										"font-medium",
										metrics.roiDelta >= 0
											? "text-green-600 dark:text-green-500"
											: "text-red-600 dark:text-red-500",
									)}
								>
									{metrics.roiDelta >= 0 ? "+" : ""}
									{metrics.roiDelta}%
								</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
