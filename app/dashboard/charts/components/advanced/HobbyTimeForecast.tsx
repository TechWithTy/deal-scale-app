"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PartyPopper, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/_utils";
import type { HobbyTimeMetrics } from "../../types/advanced-analytics";

interface HobbyTimeForecastProps {
	data: HobbyTimeMetrics;
}

const hobbyEmojis: Record<string, string> = {
	surf: "🏄",
	golf: "⛳",
	gym: "💪",
	"family time": "👨‍👩‍👧‍👦",
	reading: "📚",
};

export function HobbyTimeForecast({ data }: HobbyTimeForecastProps) {
	const emoji = hobbyEmojis[data.hobbyType] || "🎯";
	const isPositiveTrend = data.monthlyTrend > 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<PartyPopper className="h-5 w-5 text-primary" />
					<CardTitle>Hobby Time Unlocked</CardTitle>
				</div>
				<CardDescription>
					Time saved converted to your favorite activities
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Main Metric */}
				<div className="mb-6 text-center">
					<div className="mb-2 text-6xl">{emoji}</div>
					<p className="font-bold text-4xl text-primary mb-1">
						{data.totalHoursSaved}
					</p>
					<p className="text-sm text-muted-foreground mb-3">
						hours saved this month
					</p>
					<p className="text-lg font-semibold capitalize">
						≈ {data.sessionsEnabled} {data.hobbyType} sessions
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div className="rounded-lg border p-3 text-center">
						<Calendar className="h-4 w-4 mx-auto mb-2 text-muted-foreground" />
						<p className="font-bold text-2xl text-primary">
							{data.nextMonthForecast}h
						</p>
						<p className="text-xs text-muted-foreground">
							Forecasted next month
						</p>
					</div>
					<div className="rounded-lg border p-3 text-center">
						<TrendingUp
							className={cn(
								"h-4 w-4 mx-auto mb-2",
								isPositiveTrend
									? "text-green-600 dark:text-green-500"
									: "text-red-600 dark:text-red-500",
							)}
						/>
						<p
							className={cn(
								"font-bold text-2xl",
								isPositiveTrend
									? "text-green-600 dark:text-green-500"
									: "text-red-600 dark:text-red-500",
							)}
						>
							{isPositiveTrend ? "+" : ""}
							{data.monthlyTrend}%
						</p>
						<p className="text-xs text-muted-foreground">Monthly trend</p>
					</div>
				</div>

				{/* Progress to Goal */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							Progress to 60h/month goal
						</span>
						<span className="font-medium">
							{Math.round((data.totalHoursSaved / 60) * 100)}%
						</span>
					</div>
					<Progress value={(data.totalHoursSaved / 60) * 100} className="h-3" />
				</div>

				{/* Motivational Message */}
				<div className="mt-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4">
					<p className="font-medium text-sm mb-1">
						🎉 You're on track for{" "}
						{Math.round(
							data.nextMonthForecast /
								(data.totalHoursSaved / data.sessionsEnabled),
						)}{" "}
						{data.hobbyType} sessions next month!
					</p>
					<p className="text-xs text-muted-foreground">
						Your AI automations are giving you back {data.totalHoursSaved} hours
						of freedom. Keep it up!
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
