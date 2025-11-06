import { faker } from "@faker-js/faker";
import type {
	AnalyticsData,
	AnalyticsSummary,
	CampaignPerformance,
	LeadTrend,
	SalesPipeline,
} from "@/app/dashboard/charts/types/analytics";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "@/constants/data";

/**
 * Generate mock analytics summary with realistic deltas
 */
export function generateMockAnalyticsSummary(): AnalyticsSummary {
	const totalLeads = faker.number.int({ min: 1500, max: 5000 });
	const activeCampaigns = faker.number.int({ min: 20, max: 60 });
	const conversionRate = Number.parseFloat(faker.finance.amount({ min: 15, max: 35, dec: 1 }));
	const activeTasks = faker.number.int({ min: 50, max: 150 });

	return {
		total_leads: totalLeads,
		total_leads_delta: Number.parseFloat(faker.finance.amount({ min: -5, max: 30, dec: 1 })),
		active_campaigns: activeCampaigns,
		campaigns_delta: Number.parseFloat(faker.finance.amount({ min: -2, max: 20, dec: 1 })),
		conversion_rate: conversionRate,
		conversion_delta: Number.parseFloat(faker.finance.amount({ min: -1, max: 5, dec: 1 })),
		active_tasks: activeTasks,
		tasks_delta: Number.parseInt(faker.finance.amount({ min: -10, max: 15, dec: 0 })),
	};
}

/**
 * Generate mock campaign performance data
 */
export function generateMockCampaignPerformance(count = 4): CampaignPerformance[] {
	const campaignTypes = [
		"Q4 Seller Outreach",
		"Investor Nurture",
		"Cold Calling Campaign",
		"Social Media Ads",
		"Direct Mail Campaign",
		"Email Newsletter",
		"LinkedIn Outreach",
		"Referral Program",
	];

	return Array.from({ length: count }, (_, i) => {
		const leads = faker.number.int({ min: 300, max: 1500 });
		const conversion = Number.parseFloat(faker.finance.amount({ min: 15, max: 30, dec: 1 }));
		const revenue = faker.number.int({ min: 2000, max: 8000 });

		return {
			name: campaignTypes[i] || faker.company.catchPhrase(),
			leads,
			conversion,
			revenue,
		};
	});
}

/**
 * Generate mock lead trends data for the past 6 weeks
 */
export function generateMockLeadTrends(): LeadTrend[] {
	const trends: LeadTrend[] = [];
	const baseDate = new Date();
	baseDate.setDate(baseDate.getDate() - 42); // Start 6 weeks ago

	let totalLeads = faker.number.int({ min: 1500, max: 1800 });
	let qualifiedLeads = Math.floor(totalLeads * 0.2);

	for (let i = 0; i < 6; i++) {
		const date = new Date(baseDate);
		date.setDate(date.getDate() + i * 7);

		// Add some growth trend
		const growthFactor = 1 + faker.number.float({ min: 0.05, max: 0.15 });
		totalLeads = Math.floor(totalLeads * growthFactor);
		qualifiedLeads = Math.floor(totalLeads * faker.number.float({ min: 0.20, max: 0.28 }));

		trends.push({
			date: date.toISOString().split("T")[0],
			total: totalLeads,
			qualified: qualifiedLeads,
		});
	}

	return trends;
}

/**
 * Generate mock sales pipeline data
 */
export function generateMockSalesPipeline(): SalesPipeline {
	const leadsTotal = faker.number.int({ min: 2000, max: 3000 });
	const contacted = Math.floor(leadsTotal * faker.number.float({ min: 0.75, max: 0.90 }));
	const conversations = Math.floor(contacted * faker.number.float({ min: 0.35, max: 0.45 }));
	const qualified = Math.floor(conversations * faker.number.float({ min: 0.65, max: 0.80 }));
	const dealsClosed = Math.floor(qualified * faker.number.float({ min: 0.20, max: 0.30 }));

	return {
		leads_total: leadsTotal,
		contacted,
		conversations,
		qualified,
		deals_closed: dealsClosed,
	};
}

/**
 * Generate complete mock analytics data
 */
export function generateMockAnalyticsData(): AnalyticsData {
	return {
		analytics_summary: generateMockAnalyticsSummary(),
		campaign_performance: generateMockCampaignPerformance(),
		lead_trends: generateMockLeadTrends(),
		sales_pipeline: generateMockSalesPipeline(),
	};
}

/**
 * Export static mock data for testing
 */
export const mockAnalyticsData: AnalyticsData = NEXT_PUBLIC_APP_TESTING_MODE
	? generateMockAnalyticsData()
	: {
		analytics_summary: {
			total_leads: 2543,
			total_leads_delta: 20.1,
			active_campaigns: 45,
			campaigns_delta: 12.0,
			conversion_rate: 24.5,
			conversion_delta: 3.2,
			active_tasks: 89,
			tasks_delta: 7,
		},
		campaign_performance: [
			{ name: "Q4 Seller Outreach", leads: 1240, conversion: 22.5, revenue: 5600 },
			{ name: "Investor Nurture", leads: 830, conversion: 26.1, revenue: 4800 },
			{ name: "Cold Calling Campaign", leads: 473, conversion: 18.3, revenue: 2100 },
			{ name: "Social Media Ads", leads: 612, conversion: 21.7, revenue: 3200 },
		],
		lead_trends: [
			{ date: "2025-10-01", total: 1800, qualified: 350 },
			{ date: "2025-10-08", total: 1950, qualified: 405 },
			{ date: "2025-10-15", total: 2100, qualified: 468 },
			{ date: "2025-10-22", total: 2250, qualified: 520 },
			{ date: "2025-10-29", total: 2400, qualified: 580 },
			{ date: "2025-11-05", total: 2543, qualified: 623 },
		],
		sales_pipeline: {
			leads_total: 2543,
			contacted: 2100,
			conversations: 840,
			qualified: 623,
			deals_closed: 154,
		},
	};

