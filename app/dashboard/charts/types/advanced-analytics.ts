export interface AIROIMetrics {
	timeSavedMinutes: number;
	hourlyValue: number;
	estimatedValueSaved: number;
	planCost: number;
	roiPercent: number;
	roiDelta: number; // % change from last month
}

export interface PredictiveCloseMetrics {
	avgDealCycleWithAI: number; // days
	avgDealCycleWithoutAI: number; // days
	accelerationPercent: number;
	estimatedTimeSaved: number; // hours
	predictedNextMonthCycles: number;
}

export interface SignalToSaleAttribution {
	signalType: string;
	leadCount: number;
	dealsClosed: number;
	conversionRate: number;
	avgIntentScore: number;
	avgDealValue: number;
}

export interface DealEfficiencyIndex {
	score: number; // 0-100
	rank: string; // "Top 10%", "Above Average", etc.
	components: {
		speedScore: number;
		automationScore: number;
		qualityScore: number;
	};
	trend: "up" | "down" | "stable";
}

export interface TeamBenchmark {
	userScore: number;
	teamAverage: number;
	marketAverage: number;
	percentile: number;
	category: string;
}

export interface HobbyTimeMetrics {
	totalHoursSaved: number;
	hobbyType: string;
	sessionsEnabled: number;
	nextMonthForecast: number;
	monthlyTrend: number;
}

export interface AdvancedAnalyticsData {
	aiRoi: AIROIMetrics;
	predictiveClose: PredictiveCloseMetrics;
	signalAttribution: SignalToSaleAttribution[];
	dealEfficiencyIndex: DealEfficiencyIndex;
	teamBenchmark: TeamBenchmark | null; // null for non-Enterprise
	hobbyTime: HobbyTimeMetrics;
}
