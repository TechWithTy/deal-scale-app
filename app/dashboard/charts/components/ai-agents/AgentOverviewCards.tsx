"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CheckCircle2,
	Clock,
	DollarSign,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import type { AIAgentSummary } from "../../types/ai-agents";

interface AgentOverviewCardsProps {
	summary: AIAgentSummary;
}

export function AgentOverviewCards({ summary }: AgentOverviewCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Total AI Tasks</CardTitle>
					<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="font-bold text-2xl">
						{summary.total_tasks.toLocaleString()}
					</div>
					<p className="text-muted-foreground text-xs">Completed this month</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Hours Saved</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="font-bold text-2xl text-green-600 dark:text-green-500">
						{summary.hours_saved}h
					</div>
					<p className="text-muted-foreground text-xs">Automated this week</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Conversion Lift</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="font-bold text-2xl text-green-600 dark:text-green-500">
						+{summary.conversion_lift}%
					</div>
					<p className="text-muted-foreground text-xs">vs manual baseline</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">AI ROI</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="font-bold text-2xl text-green-600 dark:text-green-500">
						+{summary.roi_percent}%
					</div>
					<p className="text-muted-foreground text-xs">Return on investment</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Accuracy</CardTitle>
					<Sparkles className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="font-bold text-2xl">{summary.accuracy}%</div>
					<p className="text-muted-foreground text-xs">Natural interactions</p>
				</CardContent>
			</Card>
		</div>
	);
}
