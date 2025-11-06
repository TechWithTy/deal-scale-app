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

export interface AnalyticsData {
	analytics_summary: AnalyticsSummary;
	campaign_performance: CampaignPerformance[];
	lead_trends: LeadTrend[];
	sales_pipeline: SalesPipeline;
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
