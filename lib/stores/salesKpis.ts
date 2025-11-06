/**
 * Sales KPI Store
 *
 * Zustand store for managing sales KPI state, calculations, and filtering.
 */

import { create } from "zustand";
import type {
	SalesKPIDashboard,
	DateRange,
	DateRangePreset,
	ConversionFunnel,
	DealMetrics,
	ROIMetrics,
	PipelineVelocity,
	ActivityMetrics,
	MetricWithTrend,
	TrendDirection,
} from "@/types/_dashboard/salesKpis";
import type { LeadTypeGlobal, LeadStatus } from "@/types/_dashboard/leads";

interface SalesKPIState {
	/** Current dashboard data */
	dashboard: SalesKPIDashboard | null;
	/** Selected date range */
	dateRange: DateRange;
	/** Loading state */
	isLoading: boolean;
	/** Actions */
	setDateRange: (range: DateRange) => void;
	setDateRangePreset: (preset: DateRangePreset) => void;
	calculateKPIs: (leads: LeadTypeGlobal[]) => void;
	refreshKPIs: () => void;
}

/**
 * Calculate date range from preset
 */
function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
	const endDate = new Date();
	let startDate = new Date();

	switch (preset) {
		case "7d":
			startDate.setDate(endDate.getDate() - 7);
			break;
		case "30d":
			startDate.setDate(endDate.getDate() - 30);
			break;
		case "90d":
			startDate.setDate(endDate.getDate() - 90);
			break;
		default:
			startDate.setDate(endDate.getDate() - 30);
	}

	return {
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		preset,
	};
}

/**
 * Filter leads by date range
 */
function filterLeadsByDateRange(
	leads: LeadTypeGlobal[],
	dateRange: DateRange,
): LeadTypeGlobal[] {
	const start = new Date(dateRange.startDate);
	const end = new Date(dateRange.endDate);

	return leads.filter((lead) => {
		const leadDate = new Date(lead.lastUpdate);
		return leadDate >= start && leadDate <= end;
	});
}

/**
 * Calculate conversion funnel metrics
 */
function calculateConversionFunnel(leads: LeadTypeGlobal[]): ConversionFunnel {
	const newLeads = leads.length;
	const contacted = leads.filter((l) => l.status !== "New Lead").length;
	const qualified = leads.filter((l) =>
		["Contacted", "Closed"].includes(l.status),
	).length;
	const closed = leads.filter((l) => l.status === "Closed").length;
	const lost = leads.filter((l) => l.status === "Lost").length;

	return {
		newLeads,
		contacted,
		qualified,
		closed,
		lost,
		conversionRates: {
			newToContacted: newLeads > 0 ? (contacted / newLeads) * 100 : 0,
			contactedToQualified: contacted > 0 ? (qualified / contacted) * 100 : 0,
			qualifiedToClosed: qualified > 0 ? (closed / qualified) * 100 : 0,
			newToClosed: newLeads > 0 ? (closed / newLeads) * 100 : 0,
			qualifiedToLost: qualified > 0 ? (lost / qualified) * 100 : 0,
		},
	};
}

/**
 * Calculate deal metrics
 */
function calculateDealMetrics(leads: LeadTypeGlobal[]): DealMetrics {
	const closedLeads = leads.filter((l) => l.status === "Closed");
	const lostLeads = leads.filter((l) => l.status === "Lost");
	const totalDeals = closedLeads.length + lostLeads.length;
	const wonDeals = closedLeads.length;

	// Assuming property value represents deal value
	const dealValues = closedLeads
		.map((l) => l.propertyValue || 0)
		.filter((v) => v > 0);
	const avgDealValue =
		dealValues.length > 0
			? dealValues.reduce((sum, v) => sum + v, 0) / dealValues.length
			: 0;
	const totalRevenue = dealValues.reduce((sum, v) => sum + v, 0);

	return {
		totalDeals,
		wonDeals,
		lostDeals: lostLeads.length,
		winRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
		avgDealValue,
		totalRevenue,
		avgDaysToClose: 14, // * Mock value - would calculate from actual data
		medianDealValue:
			dealValues.length > 0
				? dealValues.sort()[Math.floor(dealValues.length / 2)]
				: 0,
		minDealValue: dealValues.length > 0 ? Math.min(...dealValues) : 0,
		maxDealValue: dealValues.length > 0 ? Math.max(...dealValues) : 0,
	};
}

/**
 * Calculate ROI metrics
 */
function calculateROIMetrics(
	revenue: number,
	previousRevenue: number,
): ROIMetrics {
	const costs = revenue * 0.3; // Assume 30% cost ratio
	const profit = revenue - costs;
	const roiPercent = costs > 0 ? (profit / costs) * 100 : 0;

	let trend: TrendDirection = "stable";
	let trendPercent = 0;

	if (previousRevenue > 0) {
		trendPercent = ((revenue - previousRevenue) / previousRevenue) * 100;
		if (trendPercent > 5) trend = "up";
		else if (trendPercent < -5) trend = "down";
	}

	return {
		revenue,
		costs,
		profit,
		roiPercent,
		trend,
		trendPercent: Math.round(trendPercent * 10) / 10,
	};
}

/**
 * Create metric with trend
 */
function createMetricWithTrend(
	value: number,
	previousValue: number,
	formatter: (val: number) => string,
): MetricWithTrend {
	const changePercent =
		previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;
	let trend: TrendDirection = "stable";

	if (changePercent > 5) trend = "up";
	else if (changePercent < -5) trend = "down";

	return {
		value,
		previousValue,
		trend,
		changePercent: Math.round(changePercent * 10) / 10,
		displayValue: formatter(value),
	};
}

/**
 * Calculate pipeline velocity
 */
function calculatePipelineVelocity(): PipelineVelocity {
	return {
		stageTime: {
			newToContacted: 2,
			contactedToQualified: 5,
			qualifiedToClosed: 14,
		},
		totalCycleTime: 21,
		trend: "stable",
	};
}

/**
 * Calculate activity metrics
 */
function calculateActivityMetrics(leads: LeadTypeGlobal[]): ActivityMetrics {
	// * Mock values - would come from actual activity tracking
	return {
		callsMade: leads.length * 3,
		emailsSent: leads.length * 5,
		smsSent: leads.length * 2,
		meetingsBooked: Math.floor(leads.length * 0.4),
		propertiesShown: Math.floor(leads.length * 0.3),
		avgActivitiesPerLead: 10,
	};
}

/**
 * Create the Zustand store
 */
export const useSalesKPIStore = create<SalesKPIState>((set, get) => ({
	dashboard: null,
	dateRange: getDateRangeFromPreset("30d"),
	isLoading: false,

	setDateRange: (range: DateRange) => {
		set({ dateRange: range });
		get().refreshKPIs();
	},

	setDateRangePreset: (preset: DateRangePreset) => {
		const range = getDateRangeFromPreset(preset);
		set({ dateRange: range });
		get().refreshKPIs();
	},

	calculateKPIs: (leads: LeadTypeGlobal[]) => {
		const { dateRange } = get();

		// Filter leads by current date range
		const currentLeads = filterLeadsByDateRange(leads, dateRange);

		// Calculate previous period for trend comparison
		const periodLength =
			new Date(dateRange.endDate).getTime() -
			new Date(dateRange.startDate).getTime();
		const previousPeriodStart = new Date(
			new Date(dateRange.startDate).getTime() - periodLength,
		).toISOString();
		const previousPeriodEnd = dateRange.startDate;
		const previousLeads = filterLeadsByDateRange(leads, {
			startDate: previousPeriodStart,
			endDate: previousPeriodEnd,
		});

		// Calculate all metrics
		const funnel = calculateConversionFunnel(currentLeads);
		const deals = calculateDealMetrics(currentLeads);
		const previousDeals = calculateDealMetrics(previousLeads);
		const roi = calculateROIMetrics(
			deals.totalRevenue,
			previousDeals.totalRevenue,
		);
		const velocity = calculatePipelineVelocity();
		const activities = calculateActivityMetrics(currentLeads);

		// Create KPI cards with trends
		const kpiCards = {
			totalDeals: createMetricWithTrend(
				deals.totalDeals,
				previousDeals.totalDeals,
				(v) => v.toString(),
			),
			avgDealValue: createMetricWithTrend(
				deals.avgDealValue,
				previousDeals.avgDealValue,
				(v) => `$${Math.round(v / 1000)}K`,
			),
			totalRevenue: createMetricWithTrend(
				deals.totalRevenue,
				previousDeals.totalRevenue,
				(v) => `$${Math.round(v / 1000)}K`,
			),
			roiPercent: createMetricWithTrend(
				roi.roiPercent,
				0, // * Previous ROI would be calculated
				(v) => `${Math.round(v)}%`,
			),
			avgDaysToClose: createMetricWithTrend(
				deals.avgDaysToClose,
				deals.avgDaysToClose, // * Mock - would use actual previous value
				(v) => `${Math.round(v)}d`,
			),
			winRate: createMetricWithTrend(
				deals.winRate,
				previousDeals.winRate,
				(v) => `${Math.round(v)}%`,
			),
		};

		const dashboard: SalesKPIDashboard = {
			dateRange,
			funnel,
			deals,
			roi,
			velocity,
			activities,
			kpiCards,
			calculatedAt: new Date().toISOString(),
		};

		set({ dashboard, isLoading: false });
	},

	refreshKPIs: () => {
		// * In real implementation, would fetch leads data here
		// For now, this is a placeholder
		set({ isLoading: true });
	},
}));
