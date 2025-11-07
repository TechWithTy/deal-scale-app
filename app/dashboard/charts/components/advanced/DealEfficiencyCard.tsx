"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/_utils";
import { Minus, TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { DealEfficiencyIndex } from "../../types/advanced-analytics";

interface DealEfficiencyCardProps {
	data: DealEfficiencyIndex;
}

export function DealEfficiencyCard({ data }: DealEfficiencyCardProps) {
	const getTrendIcon = () => {
		if (data.trend === "up")
			return (
				<TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
			);
		if (data.trend === "down")
			return (
				<TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
			);
		return <Minus className="h-4 w-4 text-muted-foreground" />;
	};

	const getScoreColor = (score: number) => {
		if (score >= 85) return "text-green-600 dark:text-green-500";
		if (score >= 70) return "text-yellow-600 dark:text-yellow-500";
		return "text-orange-600 dark:text-orange-500";
	};

	const getRankBadgeVariant = () => {
		if (data.rank.includes("Top 5")) return "default";
		if (data.rank.includes("Top 10")) return "secondary";
		return "outline";
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-primary" />
						<CardTitle>Deal Efficiency Index</CardTitle>
					</div>
					<Badge variant={getRankBadgeVariant()}>{data.rank}</Badge>
				</div>
				<CardDescription>Your performance efficiency score</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Main Score */}
				<div className="mb-6 text-center">
					<div className="mb-2 flex items-center justify-center gap-2">
						<p className={cn("font-bold text-6xl", getScoreColor(data.score))}>
							{data.score}
						</p>
						{getTrendIcon()}
					</div>
					<p className="text-muted-foreground text-sm">Overall DEI Score</p>
				</div>

				{/* Component Breakdown */}
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Speed Score</span>
							<span className="font-medium">{data.components.speedScore}%</span>
						</div>
						<Progress value={data.components.speedScore} className="h-2" />
						<p className="text-muted-foreground text-xs">
							How quickly you move deals through pipeline
						</p>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Automation Score</span>
							<span className="font-medium">
								{data.components.automationScore}%
							</span>
						</div>
						<Progress value={data.components.automationScore} className="h-2" />
						<p className="text-muted-foreground text-xs">
							AI task automation usage rate
						</p>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Quality Score</span>
							<span className="font-medium">
								{data.components.qualityScore}%
							</span>
						</div>
						<Progress value={data.components.qualityScore} className="h-2" />
						<p className="text-muted-foreground text-xs">
							Lead quality and conversion effectiveness
						</p>
					</div>
				</div>

				{/* Insights */}
				<div className="mt-6 rounded-lg bg-primary/10 p-3 text-sm">
					<p className="mb-1 font-medium">💡 Performance Insight:</p>
					<p className="text-muted-foreground text-xs">
						{data.score >= 85
							? `Outstanding! You're in the ${data.rank}. Your automation and speed are driving exceptional results.`
							: data.score >= 70
								? `Strong performance in the ${data.rank}. Focus on increasing automation to reach top tier.`
								: `Good foundation. Increase automation usage and follow-up speed to boost your DEI.`}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
