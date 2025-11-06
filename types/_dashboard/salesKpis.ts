/**
 * Sales KPI Type Definitions
 *
 * Defines types for tracking sales performance metrics, conversion funnels,
 * deal analytics, and ROI calculations. Inspired by Plausible Analytics simplicity.
 */

import type { LeadStatus } from "./leads";

/** Date range preset options for KPI filtering */
export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

/** Trend direction for metric changes */
export type TrendDirection = "up" | "down" | "stable";

/** Date range for filtering KPIs */
export interface DateRange {
	/** Start date in ISO format */
	startDate: string;
	/** End date in ISO format */
	endDate: string;
	/** Preset name if using a preset */
	preset?: DateRangePreset;
}

/** Conversion funnel stage counts and rates */
export interface ConversionFunnel {
	/** Total new leads in the funnel */
	newLeads: number;
	/** Leads that have been contacted */
	contacted: number;
	/** Leads that are qualified */
	qualified: number;
	/** Deals that closed successfully */
	closed: number;
	/** Deals that were lost */
	lost: number;
	/** Conversion rates between stages */
	conversionRates: {
		/** % of new leads that were contacted */
		newToContacted: number;
		/** % of contacted leads that were qualified */
		contactedToQualified: number;
		/** % of qualified leads that closed */
		qualifiedToClosed: number;
		/** % of new leads that ultimately closed */
		newToClosed: number;
		/** % of qualified leads that were lost */
		qualifiedToLost: number;
	};
}

/** Individual deal metrics */
export interface DealMetrics {
	/** Total number of deals (closed + lost) */
	totalDeals: number;
	/** Number of won deals */
	wonDeals: number;
	/** Number of lost deals */
	lostDeals: number;
	/** Win rate percentage */
	winRate: number;
	/** Average deal value in dollars */
	avgDealValue: number;
	/** Total revenue from won deals */
	totalRevenue: number;
	/** Average days from lead to close */
	avgDaysToClose: number;
	/** Median deal value */
	medianDealValue: number;
	/** Smallest deal value */
	minDealValue: number;
	/** Largest deal value */
	maxDealValue: number;
}

/** Return on Investment metrics */
export interface ROIMetrics {
	/** Total revenue generated */
	revenue: number;
	/** Total costs/investment */
	costs: number;
	/** Net profit (revenue - costs) */
	profit: number;
	/** ROI percentage ((profit / costs) * 100) */
	roiPercent: number;
	/** Trend compared to previous period */
	trend: TrendDirection;
	/** Percentage change from previous period */
	trendPercent: number;
}

/** Metric with trend data */
export interface MetricWithTrend {
	/** Current value */
	value: number;
	/** Previous period value for comparison */
	previousValue: number;
	/** Trend direction */
	trend: TrendDirection;
	/** Percentage change from previous period */
	changePercent: number;
	/** Formatted display value (e.g., "$50K", "25%") */
	displayValue: string;
}

/** Pipeline velocity metrics */
export interface PipelineVelocity {
	/** Average time in each stage (in days) */
	stageTime: {
		newToContacted: number;
		contactedToQualified: number;
		qualifiedToClosed: number;
	};
	/** Total pipeline cycle time in days */
	totalCycleTime: number;
	/** Velocity trend */
	trend: TrendDirection;
}

/** Activity metrics for sales team */
export interface ActivityMetrics {
	/** Total calls made */
	callsMade: number;
	/** Total emails sent */
	emailsSent: number;
	/** Total SMS sent */
	smsSent: number;
	/** Meetings/demos booked */
	meetingsBooked: number;
	/** Properties shown */
	propertiesShown: number;
	/** Average activities per lead */
	avgActivitiesPerLead: number;
}

/** Complete sales KPI dashboard data */
export interface SalesKPIDashboard {
	/** Date range for the metrics */
	dateRange: DateRange;
	/** Conversion funnel data */
	funnel: ConversionFunnel;
	/** Deal metrics */
	deals: DealMetrics;
	/** ROI metrics */
	roi: ROIMetrics;
	/** Pipeline velocity */
	velocity: PipelineVelocity;
	/** Activity metrics */
	activities: ActivityMetrics;
	/** Top-level KPI cards */
	kpiCards: {
		totalDeals: MetricWithTrend;
		avgDealValue: MetricWithTrend;
		totalRevenue: MetricWithTrend;
		roiPercent: MetricWithTrend;
		avgDaysToClose: MetricWithTrend;
		winRate: MetricWithTrend;
	};
	/** Timestamp of last calculation */
	calculatedAt: string;
}

/** Lead stage distribution for pie charts */
export interface LeadStageDistribution {
	stage: LeadStatus;
	count: number;
	percentage: number;
	color: string;
}

/** Time series data point for trend charts */
export interface TimeSeriesDataPoint {
	/** Date label (e.g., "2024-01-15" or "Week 3") */
	date: string;
	/** Metric value */
	value: number;
	/** Optional label for display */
	label?: string;
}

/** Revenue over time series */
export interface RevenueTimeSeries {
	/** Data points for the chart */
	dataPoints: TimeSeriesDataPoint[];
	/** Total for the period */
	total: number;
	/** Growth rate percentage */
	growthRate: number;
}

/** Funnel stage for visualization */
export interface FunnelStage {
	/** Stage name */
	name: string;
	/** Number of leads in this stage */
	count: number;
	/** Percentage of total leads */
	percentage: number;
	/** Conversion rate to next stage */
	conversionToNext?: number;
	/** Color for visualization */
	color: string;
}

/** Export data format for CSV downloads */
export interface KPIExportData {
	dateRange: string;
	totalDeals: number;
	wonDeals: number;
	lostDeals: number;
	winRate: string;
	avgDealValue: string;
	totalRevenue: string;
	roiPercent: string;
	avgDaysToClose: number;
	conversionNewToContacted: string;
	conversionContactedToQualified: string;
	conversionQualifiedToClosed: string;
	conversionNewToClosed: string;
}
