import { faker } from "@faker-js/faker";
import type {
	AdvancedAnalyticsData,
	AIROIMetrics,
	PredictiveCloseMetrics,
	SignalToSaleAttribution,
	DealEfficiencyIndex,
	TeamBenchmark,
	HobbyTimeMetrics,
} from "@/app/dashboard/charts/types/advanced-analytics";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "@/constants/data";

/**
 * Generate mock AI ROI metrics
 */
export function generateMockAIROI(planCost: number): AIROIMetrics {
	const timeSavedMinutes = faker.number.int({ min: 1200, max: 4000 }); // 20-67 hours
	const hourlyValue = 60; // Default $60/hr
	const estimatedValueSaved = (timeSavedMinutes / 60) * hourlyValue;
	const roiPercent = ((estimatedValueSaved - planCost) / planCost) * 100;
	
	return {
		timeSavedMinutes,
		hourlyValue,
		estimatedValueSaved,
		planCost,
		roiPercent,
		roiDelta: Number.parseFloat(faker.finance.amount({ min: -5, max: 35, dec: 1 })),
	};
}

/**
 * Generate predictive close acceleration metrics
 */
export function generateMockPredictiveClose(): PredictiveCloseMetrics {
	const withoutAI = faker.number.int({ min: 45, max: 90 });
	const withAI = Math.round(withoutAI * faker.number.float({ min: 0.6, max: 0.75 }));
	const acceleration = ((withoutAI - withAI) / withoutAI) * 100;
	
	return {
		avgDealCycleWithAI: withAI,
		avgDealCycleWithoutAI: withoutAI,
		accelerationPercent: Number.parseFloat(acceleration.toFixed(1)),
		estimatedTimeSaved: Number.parseFloat(((withoutAI - withAI) * 8 / 30).toFixed(1)), // hours
		predictedNextMonthCycles: faker.number.int({ min: 8, max: 15 }),
	};
}

/**
 * Generate signal to sale attribution data
 */
export function generateMockSignalAttribution(): SignalToSaleAttribution[] {
	const signals = [
		{ type: "Website Visit", color: "hsl(var(--chart-1))" },
		{ type: "Social Media", color: "hsl(var(--chart-2))" },
		{ type: "Email Engagement", color: "hsl(var(--chart-3))" },
		{ type: "Referral", color: "hsl(var(--chart-4))" },
		{ type: "Cold Outreach", color: "hsl(var(--chart-5))" },
	];
	
	return signals.map((signal) => {
		const leadCount = faker.number.int({ min: 100, max: 500 });
		const dealsClosed = Math.floor(leadCount * faker.number.float({ min: 0.15, max: 0.35 }));
		
		return {
			signalType: signal.type,
			leadCount,
			dealsClosed,
			conversionRate: Number.parseFloat(((dealsClosed / leadCount) * 100).toFixed(1)),
			avgIntentScore: Number.parseFloat(faker.finance.amount({ min: 60, max: 95, dec: 1 })),
			avgDealValue: faker.number.int({ min: 3000, max: 15000 }),
		};
	});
}

/**
 * Generate Deal Efficiency Index
 */
export function generateMockDEI(): DealEfficiencyIndex {
	const speedScore = faker.number.int({ min: 70, max: 98 });
	const automationScore = faker.number.int({ min: 75, max: 95 });
	const qualityScore = faker.number.int({ min: 65, max: 92 });
	const overallScore = Math.round((speedScore + automationScore + qualityScore) / 3);
	
	let rank = "Average";
	if (overallScore >= 90) rank = "Top 5%";
	else if (overallScore >= 85) rank = "Top 10%";
	else if (overallScore >= 75) rank = "Above Average";
	
	const trends = ["up", "down", "stable"] as const;
	
	return {
		score: overallScore,
		rank,
		components: {
			speedScore,
			automationScore,
			qualityScore,
		},
		trend: faker.helpers.arrayElement(trends),
	};
}

/**
 * Generate team benchmark data (Enterprise only)
 */
export function generateMockTeamBenchmark(): TeamBenchmark {
	const userScore = faker.number.int({ min: 70, max: 95 });
	const teamAverage = faker.number.int({ min: 65, max: 85 });
	const marketAverage = faker.number.int({ min: 60, max: 80 });
	
	return {
		userScore,
		teamAverage,
		marketAverage,
		percentile: faker.number.int({ min: 60, max: 98 }),
		category: faker.helpers.arrayElement(["Top Performer", "High Performer", "Average", "Developing"]),
	};
}

/**
 * Generate hobby time metrics
 */
export function generateMockHobbyTime(): HobbyTimeMetrics {
	const hobbyTypes = ["surf", "golf", "gym", "family time", "reading"];
	const totalHours = faker.number.float({ min: 20, max: 80, fractionDigits: 1 });
	
	return {
		totalHoursSaved: totalHours,
		hobbyType: faker.helpers.arrayElement(hobbyTypes),
		sessionsEnabled: Math.floor(totalHours / faker.number.float({ min: 1.5, max: 3 })),
		nextMonthForecast: Number.parseFloat((totalHours * faker.number.float({ min: 1.1, max: 1.3 })).toFixed(1)),
		monthlyTrend: Number.parseFloat(faker.finance.amount({ min: 5, max: 25, dec: 1 })),
	};
}

/**
 * Generate complete advanced analytics data
 */
export function generateMockAdvancedAnalytics(
	planCost: number = 2400,
	includeEnterprise: boolean = false
): AdvancedAnalyticsData {
	return {
		aiRoi: generateMockAIROI(planCost),
		predictiveClose: generateMockPredictiveClose(),
		signalAttribution: generateMockSignalAttribution(),
		dealEfficiencyIndex: generateMockDEI(),
		teamBenchmark: includeEnterprise ? generateMockTeamBenchmark() : null,
		hobbyTime: generateMockHobbyTime(),
	};
}

/**
 * Static mock data for testing
 */
export const mockAdvancedAnalyticsData: AdvancedAnalyticsData = NEXT_PUBLIC_APP_TESTING_MODE
	? generateMockAdvancedAnalytics(2400, true)
	: {
		aiRoi: {
			timeSavedMinutes: 2520,
			hourlyValue: 60,
			estimatedValueSaved: 2520,
			planCost: 2400,
			roiPercent: 5,
			roiDelta: 12.5,
		},
		predictiveClose: {
			avgDealCycleWithAI: 32,
			avgDealCycleWithoutAI: 48,
			accelerationPercent: 33.3,
			estimatedTimeSaved: 4.3,
			predictedNextMonthCycles: 12,
		},
		signalAttribution: [
			{ signalType: "Website Visit", leadCount: 450, dealsClosed: 112, conversionRate: 24.9, avgIntentScore: 78.5, avgDealValue: 8500 },
			{ signalType: "Social Media", leadCount: 320, dealsClosed: 64, conversionRate: 20.0, avgIntentScore: 72.3, avgDealValue: 7200 },
			{ signalType: "Email Engagement", leadCount: 280, dealsClosed: 70, conversionRate: 25.0, avgIntentScore: 81.2, avgDealValue: 9100 },
			{ signalType: "Referral", leadCount: 150, dealsClosed: 52, conversionRate: 34.7, avgIntentScore: 88.9, avgDealValue: 12000 },
			{ signalType: "Cold Outreach", leadCount: 400, dealsClosed: 68, conversionRate: 17.0, avgIntentScore: 65.4, avgDealValue: 6800 },
		],
		dealEfficiencyIndex: {
			score: 87,
			rank: "Top 10%",
			components: {
				speedScore: 92,
				automationScore: 88,
				qualityScore: 81,
			},
			trend: "up",
		},
		teamBenchmark: {
			userScore: 87,
			teamAverage: 78,
			marketAverage: 72,
			percentile: 89,
			category: "Top Performer",
		},
		hobbyTime: {
			totalHoursSaved: 42,
			hobbyType: "surf",
			sessionsEnabled: 18,
			nextMonthForecast: 52,
			monthlyTrend: 19.2,
		},
	};

