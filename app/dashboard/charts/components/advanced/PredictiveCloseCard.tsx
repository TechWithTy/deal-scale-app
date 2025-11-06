"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Zap, Clock, TrendingDown } from "lucide-react";
import { cn } from "@/lib/_utils";
import type { PredictiveCloseMetrics } from "../../types/advanced-analytics";

interface PredictiveCloseCardProps {
	data: PredictiveCloseMetrics;
}

export function PredictiveCloseCard({ data }: PredictiveCloseCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Zap className="h-5 w-5 text-primary" />
					<CardTitle>Predictive Close Acceleration</CardTitle>
				</div>
				<CardDescription>
					How AI automation shortens your deal cycles
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Main Acceleration Metric */}
				<div className="mb-6 text-center">
					<div className="flex items-center justify-center gap-2 mb-2">
						<TrendingDown className="h-8 w-8 text-green-600 dark:text-green-500" />
						<p className="font-bold text-5xl text-green-600 dark:text-green-500">
							-{data.accelerationPercent}%
						</p>
					</div>
					<p className="text-sm text-muted-foreground">
						Faster deal cycles with AI
					</p>
				</div>

				{/* Comparison */}
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center">
						<Clock className="h-5 w-5 mx-auto mb-2 text-red-600 dark:text-red-500" />
						<p className="font-bold text-3xl text-red-600 dark:text-red-500">
							{data.avgDealCycleWithoutAI}d
						</p>
						<p className="text-xs text-muted-foreground mt-1">Without AI</p>
					</div>

					<div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center">
						<Zap className="h-5 w-5 mx-auto mb-2 text-green-600 dark:text-green-500" />
						<p className="font-bold text-3xl text-green-600 dark:text-green-500">
							{data.avgDealCycleWithAI}d
						</p>
						<p className="text-xs text-muted-foreground mt-1">With AI</p>
					</div>
				</div>

				{/* Time Saved Breakdown */}
				<div className="rounded-lg border p-4 space-y-3">
					<p className="font-medium text-sm">Impact Analysis:</p>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Days saved per deal:
							</span>
							<span className="font-semibold text-green-600 dark:text-green-500">
								{data.avgDealCycleWithoutAI - data.avgDealCycleWithAI} days
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Estimated time saved:
							</span>
							<span className="font-semibold">
								{data.estimatedTimeSaved} hours/deal
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Predicted deals next month:
							</span>
							<span className="font-semibold text-primary">
								{data.predictedNextMonthCycles}
							</span>
						</div>
						<div className="h-px bg-border my-2" />
						<div className="flex justify-between">
							<span className="font-medium">
								Total time savings next month:
							</span>
							<span className="font-bold text-green-600 dark:text-green-500">
								~
								{Math.round(
									data.estimatedTimeSaved * data.predictedNextMonthCycles,
								)}{" "}
								hours
							</span>
						</div>
					</div>
				</div>

				{/* AI Insight */}
				<div className="mt-4 rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
					<p>
						<strong>🧠 AI Insight:</strong> Your automation patterns are
						reducing deal cycles by {data.accelerationPercent}%. Continue using
						auto-follow-ups and AI task assignment to maintain this
						acceleration.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
