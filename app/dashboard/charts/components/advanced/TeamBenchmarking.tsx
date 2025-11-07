"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/_utils";
import { Award, Users } from "lucide-react";
import type { TeamBenchmark } from "../../types/advanced-analytics";

interface TeamBenchmarkingProps {
	data: TeamBenchmark;
}

export function TeamBenchmarking({ data }: TeamBenchmarkingProps) {
	const getCategoryColor = () => {
		if (data.category === "Top Performer")
			return "text-green-600 dark:text-green-500";
		if (data.category === "High Performer")
			return "text-blue-600 dark:text-blue-500";
		if (data.category === "Average")
			return "text-yellow-600 dark:text-yellow-500";
		return "text-orange-600 dark:text-orange-500";
	};

	const metrics = [
		{ label: "Your Score", value: data.userScore, color: "bg-primary" },
		{ label: "Team Average", value: data.teamAverage, color: "bg-blue-500" },
		{
			label: "Market Average",
			value: data.marketAverage,
			color: "bg-gray-500",
		},
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Users className="h-5 w-5 text-primary" />
					<CardTitle>Team Benchmarking</CardTitle>
				</div>
				<CardDescription>
					Compare your performance against team and market
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Category Badge */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className="mb-1 text-muted-foreground text-sm">
							Performance Category
						</p>
						<p className={cn("font-bold text-2xl", getCategoryColor())}>
							{data.category}
						</p>
					</div>
					<div className="text-right">
						<p className="mb-1 text-muted-foreground text-sm">Percentile</p>
						<div className="flex items-center gap-2">
							<Award className="h-5 w-5 text-yellow-500" />
							<p className="font-bold text-2xl">{data.percentile}th</p>
						</div>
					</div>
				</div>

				{/* Comparative Metrics */}
				<div className="space-y-4">
					{metrics.map((metric) => (
						<div key={metric.label} className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">{metric.label}</span>
								<span className="font-semibold">{metric.value}/100</span>
							</div>
							<Progress value={metric.value} className="h-2" />
						</div>
					))}
				</div>

				{/* Comparative Bar Chart */}
				<div className="mt-6 rounded-lg border p-4">
					<p className="mb-3 font-medium text-sm">Performance Comparison</p>
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<div className="w-24 text-muted-foreground text-xs">You</div>
							<div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted">
								<div
									className="flex h-full items-center justify-end bg-primary pr-2 transition-all duration-500"
									style={{ width: `${data.userScore}%` }}
								>
									<span className="font-medium text-primary-foreground text-xs">
										{data.userScore}
									</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-24 text-muted-foreground text-xs">Team Avg</div>
							<div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted">
								<div
									className="flex h-full items-center justify-end bg-blue-500 pr-2 transition-all duration-500"
									style={{ width: `${data.teamAverage}%` }}
								>
									<span className="font-medium text-white text-xs">
										{data.teamAverage}
									</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-24 text-muted-foreground text-xs">
								Market Avg
							</div>
							<div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted">
								<div
									className="flex h-full items-center justify-end bg-gray-500 pr-2 transition-all duration-500"
									style={{ width: `${data.marketAverage}%` }}
								>
									<span className="font-medium text-white text-xs">
										{data.marketAverage}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Insights */}
				<div className="mt-4 rounded-lg bg-muted p-3 text-muted-foreground text-xs">
					<p>
						<strong>Insight:</strong> You're performing{" "}
						<span className="font-semibold text-foreground">
							{((data.userScore / data.teamAverage - 1) * 100).toFixed(0)}%
						</span>{" "}
						{data.userScore > data.teamAverage ? "above" : "below"} your team
						average and{" "}
						<span className="font-semibold text-foreground">
							{((data.userScore / data.marketAverage - 1) * 100).toFixed(0)}%
						</span>{" "}
						{data.userScore > data.marketAverage ? "above" : "below"} market
						standards.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
