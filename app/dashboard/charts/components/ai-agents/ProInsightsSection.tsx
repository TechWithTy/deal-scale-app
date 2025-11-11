"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Calendar, Lock, Sparkles, Target, TrendingUp } from "lucide-react";
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
			<Card className="relative overflow-hidden border-2 border-yellow-500/50 border-dashed">
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
						<div className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-3 py-1.5 font-medium text-white text-xs">
							<Lock className="h-3 w-3" />
							Pro Tier
						</div>
					</div>
				</CardHeader>
				<CardContent className="relative">
					<div className="mb-6 grid gap-3 opacity-60 md:grid-cols-2">
						<div className="rounded-lg border p-3">
							<div className="mb-2 flex items-center gap-2">
								<Target className="h-4 w-4 text-muted-foreground" />
								<p className="font-medium text-xs">Deal Efficiency Index</p>
							</div>
							<p className="font-bold text-3xl">87 / 100</p>
							<p className="text-green-600 text-xs">Top 10% of users</p>
						</div>
						<div className="rounded-lg border p-3">
							<div className="mb-2 flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
								<p className="font-medium text-xs">Predictive Close</p>
							</div>
							<p className="font-bold text-3xl text-green-600">-34%</p>
							<p className="text-muted-foreground text-xs">
								Faster deal cycles
							</p>
						</div>
						<div className="rounded-lg border p-3">
							<div className="mb-2 flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-muted-foreground" />
								<p className="font-medium text-xs">Signal → Sale Map</p>
							</div>
							<p className="font-bold text-3xl">48%</p>
							<p className="text-muted-foreground text-xs">
								Correlation strength
							</p>
						</div>
						<div className="rounded-lg border p-3">
							<div className="mb-2 flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<p className="font-medium text-xs">Forecasted Hobby Time</p>
							</div>
							<p className="font-bold text-3xl text-primary">60</p>
							<p className="text-muted-foreground text-xs">Surf sessions 🏄</p>
						</div>
					</div>

					<div className="space-y-4 text-center">
						<p className="text-muted-foreground text-sm">
							Unlock AI ROI trends, predictive insights, and full DEI breakdowns
						</p>
						<Button size="lg" className="min-w-[240px]">
							<Sparkles className="mr-2 h-4 w-4" />
							Upgrade to Pro Analytics
						</Button>
						<p className="text-muted-foreground text-xs">
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
						<Target className="mx-auto mb-2 h-6 w-6 text-primary" />
						<p className="mb-1 text-muted-foreground text-sm">
							Deal Efficiency Index
						</p>
						<p className="font-bold text-4xl text-green-600 dark:text-green-500">
							{insights.dei}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							Top 10% of users
						</p>
					</div>
					<div className="rounded-lg border p-4 text-center">
						<TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
						<p className="mb-1 text-muted-foreground text-sm">
							Predictive Close
						</p>
						<p className="font-bold text-4xl text-green-600 dark:text-green-500">
							-{insights.predictive_close}%
						</p>
						<p className="mt-1 text-muted-foreground text-xs">Faster with AI</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
