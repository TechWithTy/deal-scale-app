// Look-Alike Audience Type Definitions

import type {
	QuickStartPersonaId,
	QuickStartGoalId,
} from "@/lib/config/quickstart/wizardFlows";

export type AdPlatform = "meta" | "google" | "linkedin";

export type BuyerPersona =
	| "investor"
	| "wholesaler"
	| "lender"
	| "agent"
	| "owner-occupant";
export type MotivationLevel = "hot" | "warm" | "cold";
export type PurchaseTimeline =
	| "0-3months"
	| "3-6months"
	| "6-12months"
	| "12+months";
export type InvestmentExperience =
	| "first-time"
	| "experienced"
	| "professional";
export type PortfolioSize = "0-5" | "5-20" | "20-50" | "50+";

export type PropertyType =
	| "single-family"
	| "multi-family"
	| "commercial"
	| "land"
	| "condo"
	| "mobile-home";
export type PropertyStatus =
	| "active"
	| "off-market"
	| "pre-foreclosure"
	| "foreclosure"
	| "reo"
	| "sold";
export type OwnershipDuration =
	| "<1year"
	| "1-3years"
	| "3-5years"
	| "5-10years"
	| "10+years";
export type EquityPosition = "<20%" | "20-50%" | "50-80%" | "80%+";
export type DistressedSignal =
	| "pre-foreclosure"
	| "tax-lien"
	| "code-violation"
	| "vacant";

export type CorporateOwnershipFilter = "exclude" | "only" | "all";
export type AbsenteeOwnerFilter = "exclude" | "only" | "all";
export type IntentLevel = "high" | "medium" | "low";

export interface LookalikeConfig {
	seedListId: string;
	seedListName: string;
	seedLeadCount: number;

	// User Context (from profile)
	userPersona?: QuickStartPersonaId;
	userGoal?: QuickStartGoalId;

	// Similarity settings
	similarityThreshold: number; // 60-95%
	targetSize?: number;

	// Sales & Audience Targeting
	salesTargeting: {
		buyerPersona?: BuyerPersona[];
		motivationLevel?: MotivationLevel[];
		purchaseTimeline?: PurchaseTimeline;
		investmentExperience?: InvestmentExperience;
		budgetRange?: { min?: number; max?: number };
		creditScoreRange?: { min?: number; max?: number };
		cashBuyerOnly?: boolean;
		portfolioSize?: PortfolioSize;
	};

	// Property Filters
	propertyFilters: {
		propertyTypes?: PropertyType[];
		propertyStatus?: PropertyStatus[];
		priceRange?: { min?: number; max?: number };
		bedrooms?: { min?: number; max?: number };
		bathrooms?: { min?: number; max?: number };
		sqft?: { min?: number; max?: number };
		lotSize?: { min?: number; max?: number };
		yearBuilt?: { min?: number; max?: number };
		ownershipDuration?: OwnershipDuration[];
		equityPosition?: EquityPosition[];
		distressedSignals?: DistressedSignal[];
	};

	// Geographic Filters
	geoFilters: {
		states?: string[];
		counties?: string[];
		cities?: string[];
		zipCodes?: string[];
		radius?: { address: string; miles: number };
		msaAreas?: string[];
		excludeAreas?: { states?: string[]; cities?: string[] };
	};

	// General Options
	generalOptions: {
		excludeListIds?: string[];
		dncCompliance?: boolean;
		tcpaOptInRequired?: boolean;
		requirePhone?: boolean;
		requireEmail?: boolean;
		dataRecencyDays?: number;
		enrichmentLevel?: "none" | "free" | "premium" | "hybrid";
		enrichmentRequired?: boolean;
		intentLevels?: IntentLevel[];
		corporateOwnership?: CorporateOwnershipFilter;
		absenteeOwner?: AbsenteeOwnerFilter;
	};
}

export interface LookalikeCandidate {
	id: string;
	leadId: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	propertyType: PropertyType;
	similarityScore: number; // 0-100
	estimatedValue?: number;
	equity?: number;
	ownershipDuration?: string;
	phoneNumber?: string;
	email?: string;
}

export interface LookalikeAudience {
	id: string;
	tenantId: string;
	name: string;
	createdAt: string;
	seedListId: string;
	seedListName: string;
	config: LookalikeConfig;
	candidateCount: number;
	status: "draft" | "active" | "archived";
	exportedTo?: AdPlatform[];
}

export interface ExportJob {
	id: string;
	audienceId: string;
	platform: AdPlatform;
	status: "pending" | "processing" | "completed" | "failed";
	platformAudienceId?: string;
	startedAt: string;
	completedAt?: string;
	error?: string;
	exportedCount?: number;
}

export interface PerformanceMetrics {
	audienceId: string;
	platform: AdPlatform;
	impressions: number;
	clicks: number;
	conversions: number;
	cost: number;
	cpl: number; // cost per lead
	ctr: number; // click-through rate
	conversionRate: number;
	lastUpdated: string;
}

export interface AudiencePerformanceSummary {
	audienceId: string;
	audienceName: string;
	totalImpressions: number;
	totalClicks: number;
	totalConversions: number;
	totalCost: number;
	avgCpl: number;
	avgCtr: number;
	avgConversionRate: number;
	byPlatform: PerformanceMetrics[];
}
