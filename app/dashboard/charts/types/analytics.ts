export interface AnalyticsSummary {
	total_leads: number;
	total_leads_delta: number;
	active_campaigns: number;
	campaigns_delta: number;
	conversion_rate: number;
	conversion_delta: number;
	active_tasks: number;
	tasks_delta: number;
}

export interface CampaignPerformance {
	name: string;
	leads: number;
	conversion: number;
	revenue: number;
}

export interface LeadTrend {
	date: string;
	total: number;
	qualified: number;
}

export interface SalesPipeline {
	leads_total: number;
	contacted: number;
	conversations: number;
	qualified: number;
	deals_closed: number;
}

export interface LeadSegmentAnalytics {
	key: "off-market-sellers" | "motivated-sellers" | "cash-buyers";
	label: string;
	total_leads: number;
	qualified_leads: number;
	hot_leads: number;
	conversion_rate: number;
	average_intent_score: number;
	top_source: string;
	primary_signal: string;
}

export interface LeadsAnalytics {
	total_leads: number;
	qualified_leads: number;
	hot_leads: number;
	average_intent_score: number;
	segments: LeadSegmentAnalytics[];
}

export interface AnalyticsData {
	analytics_summary: AnalyticsSummary;
	campaign_performance: CampaignPerformance[];
	lead_trends: LeadTrend[];
	sales_pipeline: SalesPipeline;
	leads_analytics: LeadsAnalytics;
}

export interface ROIMetrics {
	totalRevenue: number;
	totalCost: number;
	roi: number;
	averageDealValue: number;
	costPerLead: number;
	costPerConversion: number;
}

export type SubscriptionPlan = "basic" | "starter" | "enterprise";

export interface PlanCosts {
	aiCreditsPerMonth: number;
	leadsAllotted: number;
	monthlyPrice: number;
	callCostPer5Min: number;
	smsCostPerMessage: number;
	directMailCostPerPiece: number;
}
