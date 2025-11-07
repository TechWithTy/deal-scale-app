"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/_utils";
import { Clock, TrendingDown, Zap } from "lucide-react";
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
					<div className="mb-2 flex items-center justify-center gap-2">
						<TrendingDown className="h-8 w-8 text-green-600 dark:text-green-500" />
						<p className="font-bold text-5xl text-green-600 dark:text-green-500">
							-{data.accelerationPercent}%
						</p>
					</div>
					<p className="text-muted-foreground text-sm">
						Faster deal cycles with AI
					</p>
				</div>

				{/* Comparison */}
				<div className="mb-6 grid grid-cols-2 gap-4">
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
						<Clock className="mx-auto mb-2 h-5 w-5 text-red-600 dark:text-red-500" />
						<p className="font-bold text-3xl text-red-600 dark:text-red-500">
							{data.avgDealCycleWithoutAI}d
						</p>
						<p className="mt-1 text-muted-foreground text-xs">Without AI</p>
					</div>

					<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
						<Zap className="mx-auto mb-2 h-5 w-5 text-green-600 dark:text-green-500" />
						<p className="font-bold text-3xl text-green-600 dark:text-green-500">
							{data.avgDealCycleWithAI}d
						</p>
						<p className="mt-1 text-muted-foreground text-xs">With AI</p>
					</div>
				</div>

				{/* Time Saved Breakdown */}
				<div className="space-y-3 rounded-lg border p-4">
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
						<div className="my-2 h-px bg-border" />
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
				<div className="mt-4 rounded-lg bg-primary/10 p-3 text-muted-foreground text-xs">
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
