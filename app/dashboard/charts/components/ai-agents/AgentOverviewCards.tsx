"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CheckCircle2,
	Clock,
	TrendingUp,
	DollarSign,
	Sparkles,
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
					<CardTitle className="text-sm font-medium">Total AI Tasks</CardTitle>
					<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{summary.total_tasks.toLocaleString()}
					</div>
					<p className="text-xs text-muted-foreground">Completed this month</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Hours Saved</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-green-600 dark:text-green-500">
						{summary.hours_saved}h
					</div>
					<p className="text-xs text-muted-foreground">Automated this week</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Conversion Lift</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-green-600 dark:text-green-500">
						+{summary.conversion_lift}%
					</div>
					<p className="text-xs text-muted-foreground">vs manual baseline</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">AI ROI</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-green-600 dark:text-green-500">
						+{summary.roi_percent}%
					</div>
					<p className="text-xs text-muted-foreground">Return on investment</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Accuracy</CardTitle>
					<Sparkles className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{summary.accuracy}%</div>
					<p className="text-xs text-muted-foreground">Natural interactions</p>
				</CardContent>
			</Card>
		</div>
	);
}
