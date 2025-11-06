"use client";

import FeatureGuard from "@/components/access/FeatureGuard";
import { Sparkles } from "lucide-react";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { PredictiveLeadScoring } from "./advanced/PredictiveLeadScoring";
import { RevenueForecasting } from "./advanced/RevenueForecasting";
import { AIROIDashboard } from "./advanced/AIROIDashboard";
import { SignalAttribution } from "./advanced/SignalAttribution";
import { DealEfficiencyCard } from "./advanced/DealEfficiencyCard";
import { PredictiveCloseCard } from "./advanced/PredictiveCloseCard";
import { TeamBenchmarking } from "./advanced/TeamBenchmarking";
import { HobbyTimeForecast } from "./advanced/HobbyTimeForecast";
import { mockAdvancedAnalyticsData } from "@/constants/_faker/analytics/advanced";

export function AdvancedAnalyticsTab() {
	const sessionUser = useSessionStore((state) => state.user);
	const isEnterprise = sessionUser?.tier?.toLowerCase() === "enterprise";

	// Get plan cost based on tier
	const getPlanCost = () => {
		const tier = sessionUser?.tier?.toLowerCase();
		if (tier === "enterprise") return 5000;
		if (tier === "starter") return 1200;
		return 2400; // basic
	};

	const advancedData = mockAdvancedAnalyticsData;

	return (
		<FeatureGuard
			featureKey="analytics.advanced"
			fallbackMode="overlay"
			fallbackTier="Enterprise"
		>
			<div className="space-y-6">
				{/* Unlocked Enterprise Content */}
				<div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
					<div className="flex items-center gap-2 text-primary">
						<Sparkles className="h-5 w-5" />
						<p className="font-medium">Enterprise Features Enabled</p>
					</div>
				</div>

				{/* AI ROI Dashboard - Top Priority */}
				<AIROIDashboard metrics={advancedData.aiRoi} />

				{/* Predictive Analytics Row */}
				<div className="grid gap-4 md:grid-cols-2">
					<PredictiveLeadScoring />
					<RevenueForecasting />
				</div>

				{/* Performance Metrics Row */}
				<div className="grid gap-4 md:grid-cols-2">
					<DealEfficiencyCard data={advancedData.dealEfficiencyIndex} />
					<PredictiveCloseCard data={advancedData.predictiveClose} />
				</div>

				{/* Attribution & Hobby Time Row */}
				<div className="grid gap-4 md:grid-cols-2">
					<SignalAttribution data={advancedData.signalAttribution} />
					<HobbyTimeForecast data={advancedData.hobbyTime} />
				</div>

				{/* Team Benchmarking - Enterprise Only */}
				{isEnterprise && advancedData.teamBenchmark && (
					<TeamBenchmarking data={advancedData.teamBenchmark} />
				)}
			</div>
		</FeatureGuard>
	);
}
