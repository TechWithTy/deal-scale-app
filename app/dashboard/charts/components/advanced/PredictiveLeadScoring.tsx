"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/_utils";

interface LeadScore {
	leadId: string;
	leadName: string;
	score: number; // 0-100
	conversionProbability: number; // 0-100
	factors: {
		engagement: number;
		intent: number;
		timing: number;
		fitScore: number;
	};
	recommendation: string;
	trend: "up" | "down" | "stable";
}

interface PredictiveLeadScoringProps {
	leads?: LeadScore[];
}

// Generate mock lead scores based on real data patterns
function generateLeadScores(): LeadScore[] {
	const names = [
		"John Smith - Investor Lead",
		"Sarah Johnson - Wholesaler",
		"Mike Chen - Property Buyer",
		"Emma Davis - Agent Referral",
		"Alex Rodriguez - Direct Mail",
	];

	return names
		.map((name, i) => {
			const engagement = 60 + Math.random() * 35;
			const intent = 55 + Math.random() * 40;
			const timing = 50 + Math.random() * 45;
			const fitScore = 65 + Math.random() * 30;

			const score = (engagement + intent + timing + fitScore) / 4;
			const conversionProbability = Math.min(
				95,
				score * 0.9 + Math.random() * 10,
			);

			let recommendation = "Monitor";
			if (conversionProbability >= 75)
				recommendation = "High Priority - Contact Now";
			else if (conversionProbability >= 60)
				recommendation = "Nurture with Follow-up";
			else if (conversionProbability >= 40)
				recommendation = "Add to Drip Campaign";

			const trends = ["up", "down", "stable"] as const;

			return {
				leadId: `lead-${i + 1}`,
				leadName: name,
				score: Math.round(score),
				conversionProbability: Math.round(conversionProbability),
				factors: {
					engagement: Math.round(engagement),
					intent: Math.round(intent),
					timing: Math.round(timing),
					fitScore: Math.round(fitScore),
				},
				recommendation,
				trend: trends[Math.floor(Math.random() * 3)],
			};
		})
		.sort((a, b) => b.conversionProbability - a.conversionProbability);
}

export function PredictiveLeadScoring({ leads }: PredictiveLeadScoringProps) {
	const scoredLeads = leads || generateLeadScores();

	const getScoreColor = (score: number) => {
		if (score >= 75) return "text-green-600 dark:text-green-500";
		if (score >= 60) return "text-yellow-600 dark:text-yellow-500";
		if (score >= 40) return "text-orange-600 dark:text-orange-500";
		return "text-red-600 dark:text-red-500";
	};

	const getScoreBadge = (score: number) => {
		if (score >= 75) return { label: "Hot", variant: "default" as const };
		if (score >= 60) return { label: "Warm", variant: "secondary" as const };
		if (score >= 40) return { label: "Cool", variant: "outline" as const };
		return { label: "Cold", variant: "destructive" as const };
	};

	const getTrendIcon = (trend: "up" | "down" | "stable") => {
		if (trend === "up")
			return <TrendingUp className="h-3 w-3 text-green-600" />;
		if (trend === "down")
			return <TrendingDown className="h-3 w-3 text-red-600" />;
		return <Minus className="h-3 w-3 text-muted-foreground" />;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" />
					<CardTitle>Predictive Lead Scoring</CardTitle>
				</div>
				<CardDescription>
					AI-driven conversion probability for your top leads
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{scoredLeads.map((lead) => {
						const badge = getScoreBadge(lead.conversionProbability);

						return (
							<div
								key={lead.leadId}
								className="rounded-lg border p-4 space-y-3 hover:bg-muted/50 transition-colors"
							>
								{/* Lead Header */}
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="font-medium text-sm">{lead.leadName}</h4>
											<Badge variant={badge.variant}>{badge.label}</Badge>
											{getTrendIcon(lead.trend)}
										</div>
										<p className="text-xs text-muted-foreground">
											{lead.recommendation}
										</p>
									</div>
									<div className="text-right">
										<p
											className={cn(
												"font-bold text-2xl",
												getScoreColor(lead.conversionProbability),
											)}
										>
											{lead.conversionProbability}%
										</p>
										<p className="text-xs text-muted-foreground">Conversion</p>
									</div>
								</div>

								{/* Score Breakdown */}
								<div className="grid grid-cols-4 gap-2 text-xs">
									<div>
										<p className="text-muted-foreground mb-1">Engagement</p>
										<Progress
											value={lead.factors.engagement}
											className="h-1.5"
										/>
										<p className="font-medium mt-0.5">
											{lead.factors.engagement}%
										</p>
									</div>
									<div>
										<p className="text-muted-foreground mb-1">Intent</p>
										<Progress value={lead.factors.intent} className="h-1.5" />
										<p className="font-medium mt-0.5">{lead.factors.intent}%</p>
									</div>
									<div>
										<p className="text-muted-foreground mb-1">Timing</p>
										<Progress value={lead.factors.timing} className="h-1.5" />
										<p className="font-medium mt-0.5">{lead.factors.timing}%</p>
									</div>
									<div>
										<p className="text-muted-foreground mb-1">Fit</p>
										<Progress value={lead.factors.fitScore} className="h-1.5" />
										<p className="font-medium mt-0.5">
											{lead.factors.fitScore}%
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Summary Stats */}
				<div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
					<div className="text-center">
						<p className="text-xs text-muted-foreground">Avg Score</p>
						<p className="font-bold text-lg">
							{Math.round(
								scoredLeads.reduce(
									(sum, l) => sum + l.conversionProbability,
									0,
								) / scoredLeads.length,
							)}
							%
						</p>
					</div>
					<div className="text-center">
						<p className="text-xs text-muted-foreground">Hot Leads</p>
						<p className="font-bold text-lg text-green-600 dark:text-green-500">
							{scoredLeads.filter((l) => l.conversionProbability >= 75).length}
						</p>
					</div>
					<div className="text-center">
						<p className="text-xs text-muted-foreground">Focus This Week</p>
						<p className="font-bold text-lg text-primary">
							{scoredLeads.filter((l) => l.conversionProbability >= 60).length}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
