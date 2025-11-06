import type {
	AdPlatform,
	PerformanceMetrics,
	AudiencePerformanceSummary,
} from "@/types/lookalike";

/**
 * Mock function to record a conversion event
 * In production, this would write to a conversions table
 */
export async function recordConversion(
	audienceId: string,
	candidateId: string,
	eventType: "click" | "lead" | "conversion",
	metadata?: Record<string, any>,
): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 200));

	console.log(
		`[Mock] Recorded ${eventType} for candidate ${candidateId} in audience ${audienceId}`,
		metadata,
	);
}

/**
 * Mock function to get performance metrics for a specific platform
 */
export async function getPlatformMetrics(
	audienceId: string,
	platform: AdPlatform,
): Promise<PerformanceMetrics> {
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Generate realistic mock metrics
	const impressions = Math.floor(Math.random() * 50000) + 10000;
	const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
	const conversions = Math.floor(clicks * (Math.random() * 0.15 + 0.05)); // 5-20% conversion
	const cost = Math.floor(Math.random() * 2000) + 500;

	return {
		audienceId,
		platform,
		impressions,
		clicks,
		conversions,
		cost,
		cpl: conversions > 0 ? Math.round((cost / conversions) * 100) / 100 : 0,
		ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
		conversionRate:
			clicks > 0 ? Math.round((conversions / clicks) * 10000) / 100 : 0,
		lastUpdated: new Date().toISOString(),
	};
}

/**
 * Mock function to get comprehensive performance summary for an audience
 */
export async function getAudiencePerformance(
	audienceId: string,
	audienceName: string,
	platforms: AdPlatform[],
): Promise<AudiencePerformanceSummary> {
	// Fetch metrics for all platforms
	const platformMetrics = await Promise.all(
		platforms.map((platform) => getPlatformMetrics(audienceId, platform)),
	);

	// Calculate totals
	const totals = platformMetrics.reduce(
		(acc, metrics) => ({
			impressions: acc.impressions + metrics.impressions,
			clicks: acc.clicks + metrics.clicks,
			conversions: acc.conversions + metrics.conversions,
			cost: acc.cost + metrics.cost,
		}),
		{ impressions: 0, clicks: 0, conversions: 0, cost: 0 },
	);

	return {
		audienceId,
		audienceName,
		totalImpressions: totals.impressions,
		totalClicks: totals.clicks,
		totalConversions: totals.conversions,
		totalCost: totals.cost,
		avgCpl:
			totals.conversions > 0
				? Math.round((totals.cost / totals.conversions) * 100) / 100
				: 0,
		avgCtr:
			totals.impressions > 0
				? Math.round((totals.clicks / totals.impressions) * 10000) / 100
				: 0,
		avgConversionRate:
			totals.clicks > 0
				? Math.round((totals.conversions / totals.clicks) * 10000) / 100
				: 0,
		byPlatform: platformMetrics,
	};
}

/**
 * Mock function to simulate receiving conversion webhook/callback
 * In production, this would be triggered by ad platform webhooks
 */
export function simulateConversionEvent(
	audienceId: string,
	candidateId: string,
	platform: AdPlatform,
): void {
	console.log(
		`[Mock Webhook] Conversion event received from ${platform} for audience ${audienceId}, candidate ${candidateId}`,
	);

	// In production, this would:
	// 1. Validate webhook signature
	// 2. Parse event data
	// 3. Call recordConversion
	// 4. Update metrics in database
	// 5. Trigger UI updates
}
