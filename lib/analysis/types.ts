import type { AISummarySection } from "external/ai-summary-expandable/components";
import type { SentimentSummary } from "./sentiment";

export interface SummaryPayload {
	section: AISummarySection;
	copy: string;
}

export interface PropertyTypeSnapshot {
	type: string;
	medianPrice: number | null;
	medianDom: number | null;
	averageRent: number | null;
	rentalYield: number | null;
}

export interface LeadSummaryMetrics {
	price: {
		average: number | null;
		median: number | null;
		min: number | null;
		max: number | null;
		trendPct: number | null;
		trendDirection: "up" | "down" | "flat";
	};
	dom: { median: number | null; min: number | null; max: number | null };
	rent: {
		average: number | null;
		median: number | null;
		yieldPct: number | null;
		medianDom: number | null;
		turnover: "fast" | "steady" | "slow" | "unknown";
	};
	inventory: {
		newListings: number;
		totalListings: number;
		newListingRatio: number;
	};
	propertyTypes: {
		topForInvestors: PropertyTypeSnapshot | null;
		fastest: PropertyTypeSnapshot | null;
		slowest: PropertyTypeSnapshot | null;
		bestForAffordability: PropertyTypeSnapshot | null;
	};
	spreadPct: number | null;
	affordabilityIndex: number | null;
	buyerMarket: "Buyer" | "Seller" | "Balanced";
	negotiationPower: "Strong" | "Moderate" | "Weak";
	sentiments: {
		investor: SentimentSummary;
		wholesaler: SentimentSummary;
		buyer: SentimentSummary;
	};
}

export interface LeadSummariesResult {
	location: string;
	metrics: LeadSummaryMetrics;
	investor: SummaryPayload;
	wholesaler: SummaryPayload;
	buyer: SummaryPayload;
}

export interface BuildLeadSummariesOptions {
	now?: Date;
}
