"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Lock, Sparkles, TrendingUp, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProInsights } from "../../types/ai-agents";

interface ProInsightsSectionProps {
	insights: ProInsights;
	isLocked?: boolean;
}

export function ProInsightsSection({
	insights,
	isLocked = false,
}: ProInsightsSectionProps) {
	if (isLocked) {
		return (
			<Card className="relative overflow-hidden border-2 border-dashed border-yellow-500/50">
				<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/10 backdrop-blur-[1px]" />
				<CardHeader className="relative">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-yellow-600" />
								Advanced AI Insights
							</CardTitle>
							<CardDescription>
								Unlock deeper analytics with Pro Analytics
							</CardDescription>
						</div>
						<div className="rounded-full bg-yellow-500/90 px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1">
							<Lock className="h-3 w-3" />
							Pro Tier
						</div>
					</div>
				</CardHeader>
				<CardContent className="relative">
					<div className="grid gap-3 md:grid-cols-2 mb-6 opacity-60">
						<div className="rounded-lg border p-3">
							<div className="flex items-center gap-2 mb-2">
								<Target className="h-4 w-4 text-muted-foreground" />
								<p className="text-xs font-medium">Deal Efficiency Index</p>
							</div>
							<p className="text-3xl font-bold">87 / 100</p>
							<p className="text-xs text-green-600">Top 10% of users</p>
						</div>
						<div className="rounded-lg border p-3">
							<div className="flex items-center gap-2 mb-2">
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
								<p className="text-xs font-medium">Predictive Close</p>
							</div>
							<p className="text-3xl font-bold text-green-600">-34%</p>
							<p className="text-xs text-muted-foreground">
								Faster deal cycles
							</p>
						</div>
						<div className="rounded-lg border p-3">
							<div className="flex items-center gap-2 mb-2">
								<Sparkles className="h-4 w-4 text-muted-foreground" />
								<p className="text-xs font-medium">Signal → Sale Map</p>
							</div>
							<p className="text-3xl font-bold">48%</p>
							<p className="text-xs text-muted-foreground">
								Correlation strength
							</p>
						</div>
						<div className="rounded-lg border p-3">
							<div className="flex items-center gap-2 mb-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<p className="text-xs font-medium">Forecasted Hobby Time</p>
							</div>
							<p className="text-3xl font-bold text-primary">60</p>
							<p className="text-xs text-muted-foreground">Surf sessions 🏄</p>
						</div>
					</div>

					<div className="text-center space-y-4">
						<p className="text-sm text-muted-foreground">
							Unlock AI ROI trends, predictive insights, and full DEI breakdowns
						</p>
						<Button size="lg" className="min-w-[240px]">
							<Sparkles className="mr-2 h-4 w-4" />
							Upgrade to Pro Analytics
						</Button>
						<p className="text-xs text-muted-foreground">
							Starting at <span className="font-semibold">$99/month</span>
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Unlocked Pro content
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" />
					Pro AI Insights
				</CardTitle>
				<CardDescription>
					Advanced analytics powered by your data
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-lg border p-4 text-center">
						<Target className="h-6 w-6 mx-auto mb-2 text-primary" />
						<p className="text-sm text-muted-foreground mb-1">
							Deal Efficiency Index
						</p>
						<p className="text-4xl font-bold text-green-600 dark:text-green-500">
							{insights.dei}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Top 10% of users
						</p>
					</div>
					<div className="rounded-lg border p-4 text-center">
						<TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
						<p className="text-sm text-muted-foreground mb-1">
							Predictive Close
						</p>
						<p className="text-4xl font-bold text-green-600 dark:text-green-500">
							-{insights.predictive_close}%
						</p>
						<p className="text-xs text-muted-foreground mt-1">Faster with AI</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
