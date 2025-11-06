"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	TrendingUp,
	TrendingDown,
	Facebook,
	Linkedin,
	DollarSign,
	MousePointerClick,
	Users,
	Target,
} from "lucide-react";
import type {
	AudiencePerformanceSummary,
	PerformanceMetrics,
} from "@/types/lookalike";

interface PerformanceTrackerProps {
	performance: AudiencePerformanceSummary | null;
	isLoading?: boolean;
}

export function PerformanceTracker({
	performance,
	isLoading,
}: PerformanceTrackerProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Performance Metrics</CardTitle>
					<CardDescription>Loading performance data...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<div className="animate-pulse text-muted-foreground">
							Loading...
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!performance) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Performance Metrics</CardTitle>
					<CardDescription>No performance data available yet</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground text-sm">
						<Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p>
							Performance data will appear here once your audience is active on
							ad platforms.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const platformIcons = {
		meta: Facebook,
		google: () => <span className="font-bold text-red-600">G</span>,
		linkedin: Linkedin,
	};

	return (
		<div className="space-y-4">
			{/* Overall Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Overall Performance</CardTitle>
					<CardDescription>{performance.audienceName}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-4 gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<Users className="h-4 w-4" />
								Impressions
							</div>
							<div className="font-bold text-2xl">
								{performance.totalImpressions.toLocaleString()}
							</div>
						</div>

						<div className="space-y-1">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<MousePointerClick className="h-4 w-4" />
								Clicks
							</div>
							<div className="font-bold text-2xl">
								{performance.totalClicks.toLocaleString()}
							</div>
							<div className="text-muted-foreground text-xs">
								{performance.avgCtr}% CTR
							</div>
						</div>

						<div className="space-y-1">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<TrendingUp className="h-4 w-4" />
								Conversions
							</div>
							<div className="font-bold text-2xl">
								{performance.totalConversions.toLocaleString()}
							</div>
							<div className="text-muted-foreground text-xs">
								{performance.avgConversionRate}% rate
							</div>
						</div>

						<div className="space-y-1">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<DollarSign className="h-4 w-4" />
								Cost per Lead
							</div>
							<div className="font-bold text-2xl">
								${performance.avgCpl.toFixed(2)}
							</div>
							<div className="text-muted-foreground text-xs">
								${performance.totalCost.toLocaleString()} total
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Platform Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>Performance by Platform</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{performance.byPlatform.map((platformMetrics) => {
							const Icon = platformIcons[platformMetrics.platform];
							const isImproving =
								platformMetrics.conversionRate > performance.avgConversionRate;

							return (
								<div
									key={platformMetrics.platform}
									className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										{typeof Icon === "function" ? (
											<div className="flex h-8 w-8 items-center justify-center">
												<Icon />
											</div>
										) : (
											<Icon className="h-5 w-5" />
										)}
										<div>
											<div className="font-medium capitalize">
												{platformMetrics.platform}
											</div>
											<div className="text-muted-foreground text-xs">
												{platformMetrics.impressions.toLocaleString()}{" "}
												impressions
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4 text-sm">
										<div>
											<div className="text-muted-foreground text-xs">CTR</div>
											<div className="font-medium">{platformMetrics.ctr}%</div>
										</div>
										<div>
											<div className="text-muted-foreground text-xs">
												Conv Rate
											</div>
											<div className="flex items-center gap-1 font-medium">
												{platformMetrics.conversionRate}%
												{isImproving ? (
													<TrendingUp className="h-3 w-3 text-green-600" />
												) : (
													<TrendingDown className="h-3 w-3 text-red-600" />
												)}
											</div>
										</div>
										<div>
											<div className="text-muted-foreground text-xs">CPL</div>
											<div className="font-medium">
												${platformMetrics.cpl.toFixed(2)}
											</div>
										</div>
										<div className="text-right">
											<div className="text-muted-foreground text-xs">
												Conversions
											</div>
											<div className="font-bold text-primary">
												{platformMetrics.conversions}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
