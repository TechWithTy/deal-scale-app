"use client";

/**
 * Intent Score Widget Component
 *
 * Displays the aggregated intent score with visual indicators,
 * breakdown by signal type, and trend information.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { IntentScore } from "@/types/_dashboard/intentSignals";
import { Minus, Target, TrendingDown, TrendingUp } from "lucide-react";

interface IntentScoreWidgetProps {
	/** The calculated intent score object */
	score: IntentScore;
	/** Show detailed breakdown (default: true) */
	showBreakdown?: boolean;
	/** Compact mode for smaller displays (default: false) */
	compact?: boolean;
}

/**
 * Get color class based on intent level
 */
function getScoreColor(level: IntentScore["level"]): string {
	switch (level) {
		case "high":
			return "text-green-600 dark:text-green-400";
		case "medium":
			return "text-yellow-600 dark:text-yellow-400";
		case "low":
			return "text-orange-600 dark:text-orange-400";
		case "none":
			return "text-gray-400 dark:text-gray-500";
	}
}

/**
 * Get badge variant based on intent level
 */
function getBadgeVariant(
	level: IntentScore["level"],
): "default" | "secondary" | "destructive" | "outline" {
	switch (level) {
		case "high":
			return "default";
		case "medium":
			return "secondary";
		case "low":
		case "none":
			return "outline";
	}
}

/**
 * Get progress bar color based on intent level
 */
function getProgressColor(level: IntentScore["level"]): string {
	switch (level) {
		case "high":
			return "bg-green-600";
		case "medium":
			return "bg-yellow-600";
		case "low":
			return "bg-orange-600";
		case "none":
			return "bg-gray-400";
	}
}

/**
 * Render trend icon based on trend direction
 */
function TrendIcon({ trend }: { trend: IntentScore["trend"] }) {
	const className = "h-4 w-4";

	switch (trend) {
		case "up":
			return <TrendingUp className={`${className} text-green-600`} />;
		case "down":
			return <TrendingDown className={`${className} text-red-600`} />;
		case "stable":
			return <Minus className={`${className} text-gray-600`} />;
	}
}

export function IntentScoreWidget({
	score,
	showBreakdown = true,
	compact = false,
}: IntentScoreWidgetProps) {
	const scoreColor = getScoreColor(score.level);
	const badgeVariant = getBadgeVariant(score.level);
	const progressColor = getProgressColor(score.level);

	if (compact) {
		return (
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Target className="h-4 w-4 text-muted-foreground" />
					<span className={`font-semibold text-lg ${scoreColor}`}>
						{score.total}
					</span>
				</div>
				<Badge variant={badgeVariant} className="capitalize">
					{score.level}
				</Badge>
				<div className="flex items-center gap-1 text-muted-foreground text-sm">
					<TrendIcon trend={score.trend} />
					<span>{Math.abs(score.trendPercent)}%</span>
				</div>
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Intent Score
					</span>
					<Badge variant={badgeVariant} className="capitalize">
						{score.level} Intent
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Main Score Display */}
				<div className="text-center">
					<div className={`font-bold text-5xl ${scoreColor}`}>
						{score.total}
						<span className="text-2xl text-muted-foreground">/100</span>
					</div>
					<div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground text-sm">
						<TrendIcon trend={score.trend} />
						<span>
							{score.trend === "up" ? "+" : score.trend === "down" ? "-" : ""}
							{Math.abs(score.trendPercent)}% from last week
						</span>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="space-y-2">
					<Progress value={score.total} className="h-3" />
					<div className="text-center text-muted-foreground text-xs">
						Based on {score.signalCount} signal
						{score.signalCount !== 1 ? "s" : ""}
					</div>
				</div>

				{/* Breakdown by Signal Type */}
				{showBreakdown && (
					<div className="space-y-3 border-t pt-4">
						<div className="font-medium text-sm">Score Breakdown</div>

						{/* Engagement */}
						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Engagement</span>
								<span className="font-medium">
									{Math.round(score.breakdown.engagement)}
								</span>
							</div>
							<Progress
								value={(score.breakdown.engagement / score.total) * 100}
								className="h-2"
							/>
						</div>

						{/* Behavioral */}
						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Behavioral</span>
								<span className="font-medium">
									{Math.round(score.breakdown.behavioral)}
								</span>
							</div>
							<Progress
								value={(score.breakdown.behavioral / score.total) * 100}
								className="h-2"
							/>
						</div>

						{/* External */}
						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">External</span>
								<span className="font-medium">
									{Math.round(score.breakdown.external)}
								</span>
							</div>
							<Progress
								value={(score.breakdown.external / score.total) * 100}
								className="h-2"
							/>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
