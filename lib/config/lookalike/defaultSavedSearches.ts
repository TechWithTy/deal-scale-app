/**
 * Default Saved Search Templates
 * Pre-configured lookalike audience templates for common use cases
 */

import type { LookalikeConfig } from "@/types/lookalike";
import type { SavedSearch } from "@/types/userProfile";

/**
 * High-Quality Investor Leads
 * Targets serious investors with verified contact info and high engagement
 */
export const highQualityInvestorTemplate: Partial<SavedSearch> = {
	name: "High-Quality Investors",
	description:
		"Serious investors with verified contact data and high engagement scores",
	isDefault: true,
	priority: true,
	lookalikeConfig: {
		similarityThreshold: 80,
		targetSize: 500,
		salesTargeting: {
			buyerPersona: ["investor", "wholesaler"],
			motivationLevel: ["high"],
			purchaseTimeline: "0-3-months",
			minCreditScore: 680,
			minResponseRate: 70,
			minPurchaseIntent: 75,
			cashBuyerOnly: false,
		},
		propertyFilters: {
			propertyTypes: ["single-family", "multi-family"],
			priceRange: { min: 100000, max: 500000 },
			minConditionScore: 60,
			maxCrimeScore: 40,
			minSchoolRating: 6,
		},
		geoFilters: {
			minWalkScore: 50,
			minAppreciation: 10,
			minPopGrowth: 0,
		},
		generalOptions: {
			dncCompliance: true,
			tcpaOptInRequired: true,
			requirePhone: true,
			requireEmail: true,
			enrichmentLevel: "premium",
			skipDuplicates: true,
			skipAlreadyTraced: true,
			skipExistingCampaigns: true,
			socialEnrichment: true,
			includeFacebook: true,
			includeLinkedIn: true,
			minPhoneValidity: 80,
			minEmailDeliverability: 85,
			requireMultipleContacts: true,
		},
	} as LookalikeConfig,
};

/**
 * Distressed Property Opportunities
 * Targets motivated sellers with distressed properties
 */
export const distressedPropertyTemplate: Partial<SavedSearch> = {
	name: "Distressed Property Leads",
	description: "Motivated sellers with properties showing distressed signals",
	isDefault: true,
	lookalikeConfig: {
		similarityThreshold: 75,
		targetSize: 1000,
		salesTargeting: {
			motivationLevel: ["high", "medium"],
			purchaseTimeline: "0-3-months",
		},
		propertyFilters: {
			propertyTypes: ["single-family", "multi-family", "condo"],
			distressedSignals: [
				"foreclosure",
				"tax-delinquent",
				"pre-foreclosure",
				"vacant",
			],
			equityPosition: ["50-80", "80+"],
			ownershipDuration: ["5-10", "10+"],
			maxFloodScore: 30,
		},
		geoFilters: {
			minAppreciation: 5,
		},
		generalOptions: {
			dncCompliance: true,
			tcpaOptInRequired: true,
			requirePhone: true,
			enrichmentLevel: "premium",
			skipDuplicates: true,
			skipAlreadyTraced: true,
			skipRecentlySold: true,
			minPhoneValidity: 70,
		},
	} as LookalikeConfig,
};

/**
 * Owner-Occupant First-Time Buyers
 * Targets first-time homebuyers with good credit
 */
export const firstTimeBuyerTemplate: Partial<SavedSearch> = {
	name: "First-Time Homebuyers",
	description: "Owner-occupants looking for their first home with good credit",
	isDefault: true,
	lookalikeConfig: {
		similarityThreshold: 70,
		targetSize: 750,
		salesTargeting: {
			buyerPersona: ["owner-occupant"],
			investmentExperience: "beginner",
			minCreditScore: 640,
			minResponseRate: 60,
			portfolioSize: "0-5",
		},
		propertyFilters: {
			propertyTypes: ["single-family", "condo", "townhouse"],
			priceRange: { min: 150000, max: 400000 },
			bedrooms: { min: 2, max: 4 },
			bathrooms: { min: 1, max: 3 },
			minConditionScore: 70,
			maxCrimeScore: 30,
			minSchoolRating: 7,
		},
		geoFilters: {
			minWalkScore: 60,
			minTransitScore: 50,
			requireUrbanProximity: true,
		},
		generalOptions: {
			dncCompliance: true,
			tcpaOptInRequired: true,
			requirePhone: true,
			requireEmail: true,
			enrichmentLevel: "premium",
			skipDuplicates: true,
			socialEnrichment: true,
			minEmailDeliverability: 80,
		},
	} as LookalikeConfig,
};

/**
 * Cash Buyer Wholesalers
 * High-volume cash buyers for quick deals
 */
export const cashBuyerTemplate: Partial<SavedSearch> = {
	name: "Cash Buyer Wholesalers",
	description: "High-volume cash buyers looking for wholesale deals",
	isDefault: true,
	lookalikeConfig: {
		similarityThreshold: 85,
		targetSize: 300,
		salesTargeting: {
			buyerPersona: ["wholesaler", "investor"],
			motivationLevel: ["high"],
			purchaseTimeline: "0-3-months",
			cashBuyerOnly: true,
			portfolioSize: "20-50",
			minPurchaseIntent: 80,
		},
		propertyFilters: {
			propertyTypes: ["single-family", "multi-family"],
			priceRange: { min: 50000, max: 300000 },
			maxCrimeScore: 50,
		},
		geoFilters: {
			minAppreciation: 15,
			minPopGrowth: 5,
		},
		generalOptions: {
			dncCompliance: true,
			tcpaOptInRequired: true,
			requirePhone: true,
			requireEmail: true,
			enrichmentLevel: "premium",
			skipDuplicates: true,
			skipExistingCampaigns: true,
			skipAlreadyTraced: true,
			socialEnrichment: true,
			includeLinkedIn: true,
			minInfluenceScore: 50,
			minPhoneValidity: 85,
			requireMultipleContacts: true,
		},
	} as LookalikeConfig,
};

/**
 * Luxury Market Leads
 * High-net-worth individuals for luxury properties
 */
export const luxuryMarketTemplate: Partial<SavedSearch> = {
	name: "Luxury Market Buyers",
	description: "High-net-worth buyers interested in luxury properties",
	isDefault: true,
	lookalikeConfig: {
		similarityThreshold: 85,
		targetSize: 200,
		salesTargeting: {
			buyerPersona: ["investor", "owner-occupant"],
			minCreditScore: 750,
			minResponseRate: 70,
			minPurchaseIntent: 70,
		},
		propertyFilters: {
			propertyTypes: ["single-family", "luxury-condo"],
			priceRange: { min: 750000, max: 5000000 },
			bedrooms: { min: 3, max: 10 },
			bathrooms: { min: 2, max: 10 },
			sqft: { min: 2500 },
			minConditionScore: 85,
			maxCrimeScore: 20,
			minSchoolRating: 8,
			minAirQuality: 80,
		},
		geoFilters: {
			minWalkScore: 70,
			minTransitScore: 60,
			requireUrbanProximity: true,
		},
		generalOptions: {
			dncCompliance: true,
			tcpaOptInRequired: true,
			requirePhone: true,
			requireEmail: true,
			enrichmentLevel: "premium",
			skipDuplicates: true,
			socialEnrichment: true,
			includeFacebook: true,
			includeLinkedIn: true,
			includeInstagram: true,
			minInfluenceScore: 60,
			minConnections: 500,
			minProfileCompleteness: 80,
			minPhoneValidity: 90,
			minEmailDeliverability: 90,
			requireMultipleContacts: true,
		},
	} as LookalikeConfig,
};

/**
 * Array of all default templates
 */
export const defaultSavedSearches: Partial<SavedSearch>[] = [
	highQualityInvestorTemplate,
	distressedPropertyTemplate,
	firstTimeBuyerTemplate,
	cashBuyerTemplate,
	luxuryMarketTemplate,
];

/**
 * Get default saved searches with proper IDs and dates
 */
export function getDefaultSavedSearches(): SavedSearch[] {
	const now = new Date();
	return defaultSavedSearches.map((template, index) => ({
		id: `default-${index + 1}`,
		name: template.name || `Template ${index + 1}`,
		description: template.description,
		searchCriteria: {},
		createdAt: now,
		updatedAt: now,
		isDefault: true,
		priority: template.priority,
		lookalikeConfig: template.lookalikeConfig,
		useCount: 0,
	})) as SavedSearch[];
}
