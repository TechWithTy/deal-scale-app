/**
 * Type definitions and schemas for Lookalike Audience Configuration
 * @module lookalike/types
 */

import { z } from "zod";

/**
 * Lookalike configuration form schema
 * Validates all user inputs for audience generation
 */
export const lookalikeConfigSchema = z.object({
	similarityThreshold: z.number().min(60).max(95),
	targetSize: z.number().min(10).max(10000).optional(),

	// Sales targeting (all optional)
	buyerPersona: z.array(z.string()).optional(),
	targetInterests: z.string().optional(),
	targetIndustry: z.string().optional(),
	motivationLevel: z.array(z.string()).optional(),
	purchaseTimeline: z.string().optional(),
	investmentExperience: z.string().optional(),
	budgetMin: z.number().optional(),
	budgetMax: z.number().optional(),
	creditScoreMin: z.number().optional(),
	creditScoreMax: z.number().optional(),
	cashBuyerOnly: z.boolean().optional(),
	portfolioSize: z.string().optional(),

	// Sales AI Scores
	minCreditScore: z.number().min(300).max(850).optional(),
	minResponseRate: z.number().min(0).max(100).optional(),
	minPurchaseIntent: z.number().min(0).max(100).optional(),
	excludeLowEngagement: z.boolean().optional(),
	skipColdLeads: z.boolean().optional(),

	// Property filters
	propertyTypes: z.array(z.string()).optional(),
	propertyStatus: z.array(z.string()).optional(),
	priceMin: z.number().optional(),
	priceMax: z.number().optional(),
	bedroomsMin: z.number().optional(),
	bedroomsMax: z.number().optional(),
	bathroomsMin: z.number().optional(),
	bathroomsMax: z.number().optional(),
	sqftMin: z.number().optional(),
	sqftMax: z.number().optional(),
	lotSizeMin: z.number().optional(),
	lotSizeMax: z.number().optional(),
	yearBuiltMin: z.number().optional(),
	yearBuiltMax: z.number().optional(),
	ownershipDuration: z.array(z.string()).optional(),
	equityPosition: z.array(z.string()).optional(),
	distressedSignals: z.array(z.string()).optional(),

	// Property AI Scores
	maxFloodScore: z.number().min(0).max(100).optional(),
	maxCrimeScore: z.number().min(0).max(100).optional(),
	minAirQuality: z.number().min(0).max(100).optional(),
	minConditionScore: z.number().min(0).max(100).optional(),
	minSchoolRating: z.number().min(1).max(10).optional(),
	requireRecentPhotos: z.boolean().optional(),
	skipRecentlySold: z.boolean().optional(),
	skipListedProperties: z.boolean().optional(),

	// Geographic filters
	states: z.array(z.string()).optional(),
	counties: z.array(z.string()).optional(),
	cities: z.string().optional(),
	zipCodes: z.string().optional(),
	radiusAddress: z.string().optional(),
	radiusMiles: z.number().optional(),
	msaAreas: z.array(z.string()).optional(),
	excludeStates: z.array(z.string()).optional(),
	excludeCities: z.string().optional(),

	// Geographic AI Scores
	minWalkScore: z.number().min(0).max(100).optional(),
	minTransitScore: z.number().min(0).max(100).optional(),
	minBikeScore: z.number().min(0).max(100).optional(),
	minAppreciation: z.number().min(0).max(50).optional(),
	minPopGrowth: z.number().min(-10).max(20).optional(),
	requireUrbanProximity: z.boolean().optional(),
	skipOverlappingAreas: z.boolean().optional(),
	consolidateByMarket: z.boolean().optional(),

	// General options
	excludeListIds: z.array(z.string()).optional(),
	dncCompliance: z.boolean().optional(),
	tcpaOptInRequired: z.boolean().optional(),
	requirePhone: z.boolean().optional(),
	requireEmail: z.boolean().optional(),
	dataRecencyDays: z.number().optional(),
	enrichmentLevel: z.enum(["none", "free", "premium", "hybrid"]).optional(),
	enrichmentRequired: z.boolean().optional(),
	intentLevels: z.array(z.string()).optional(),
	corporateOwnership: z.string().optional(),
	absenteeOwner: z.string().optional(),
	lotSizeMin: z.number().optional(),
	lotSizeMax: z.number().optional(),

	// Efficiency & Deduplication options
	skipDuplicates: z.boolean().optional().default(true),
	skipAlreadyTraced: z.boolean().optional().default(true),
	skipExistingCampaigns: z.boolean().optional().default(true),
	skipDncList: z.boolean().optional().default(true),
	skipPreviouslyContacted: z.boolean().optional().default(false),

	// Social Profile Enrichment
	socialEnrichment: z.boolean().optional().default(true),
	includeFacebook: z.boolean().optional().default(true),
	includeLinkedIn: z.boolean().optional().default(true),
	includeInstagram: z.boolean().optional().default(true),
	includeFriendsData: z.boolean().optional().default(true),
	includeInterests: z.boolean().optional().default(true),
	includeEmployment: z.boolean().optional().default(true),
	includeUsername: z.boolean().optional().default(true),
	includeSocialDossier: z.boolean().optional().default(false),

	// Social Efficiency
	skipNoEmail: z.boolean().optional(),
	skipAlreadyEnriched: z.boolean().optional(),
	skipInactiveProfiles: z.boolean().optional(),
	skipPrivateProfiles: z.boolean().optional(),

	// Social Advanced Scores
	minInfluenceScore: z.number().min(0).max(100).optional(),
	minConnections: z.number().min(0).max(10000).optional(),
	minProfileCompleteness: z.number().min(0).max(100).optional(),
	minEngagementRate: z.number().min(0).max(100).optional(),
	minAccountAge: z.number().min(0).max(120).optional(),
	requireVerified: z.boolean().optional(),

	// Compliance Advanced Scores
	minPhoneValidity: z.number().min(0).max(100).optional(),
	minEmailDeliverability: z.number().min(0).max(100).optional(),
	minAddressValidity: z.number().min(0).max(100).optional(),
	maxDataAge: z.number().min(0).max(365).optional(),
	requireNcoaVerified: z.boolean().optional(),
	excludeLandlines: z.boolean().optional(),
	requireMultipleContacts: z.boolean().optional(),
	skipInvalidData: z.boolean().optional(),
});

/** Inferred TypeScript type from the Zod schema */
export type FormValues = z.infer<typeof lookalikeConfigSchema>;

/** US state abbreviations for geographic filtering */
export const US_STATES = [
	"AL",
	"AK",
	"AZ",
	"AR",
	"CA",
	"CO",
	"CT",
	"DE",
	"FL",
	"GA",
	"HI",
	"ID",
	"IL",
	"IN",
	"IA",
	"KS",
	"KY",
	"LA",
	"ME",
	"MD",
	"MA",
	"MI",
	"MN",
	"MS",
	"MO",
	"MT",
	"NE",
	"NV",
	"NH",
	"NJ",
	"NM",
	"NY",
	"NC",
	"ND",
	"OH",
	"OK",
	"OR",
	"PA",
	"RI",
	"SC",
	"SD",
	"TN",
	"TX",
	"UT",
	"VT",
	"VA",
	"WA",
	"WV",
	"WI",
	"WY",
];

/** Property type options for filtering */
export const PROPERTY_TYPES = [
	{ value: "single-family", label: "Single Family" },
	{ value: "multi-family", label: "Multi-Family" },
	{ value: "commercial", label: "Commercial" },
	{ value: "land", label: "Land" },
	{ value: "condo", label: "Condo" },
	{ value: "mobile-home", label: "Mobile Home" },
];

/** Property status options for filtering */
export const PROPERTY_STATUSES = [
	{ value: "active", label: "Active" },
	{ value: "off-market", label: "Off-Market" },
	{ value: "pre-foreclosure", label: "Pre-Foreclosure" },
	{ value: "foreclosure", label: "Foreclosure" },
	{ value: "reo", label: "REO" },
	{ value: "sold", label: "Sold" },
];

/** Distressed property signals */
export const DISTRESSED_SIGNALS = [
	{ value: "pre-foreclosure", label: "Pre-Foreclosure" },
	{ value: "tax-lien", label: "Tax Lien" },
	{ value: "code-violation", label: "Code Violation" },
	{ value: "vacant", label: "Vacant" },
];

/** Buyer persona types */
export const BUYER_PERSONAS = [
	"investor",
	"wholesaler",
	"lender",
	"agent",
	"owner-occupant",
];

/** Lead motivation levels */
export const MOTIVATION_LEVELS = ["hot", "warm", "cold"];

/** Ownership duration options */
export const OWNERSHIP_DURATIONS = [
	{ value: "<1year", label: "Less than 1 year" },
	{ value: "1-3years", label: "1-3 years" },
	{ value: "3-5years", label: "3-5 years" },
	{ value: "5-10years", label: "5-10 years" },
	{ value: "10+years", label: "10+ years" },
];

/** Equity position options */
export const EQUITY_POSITIONS = [
	{ value: "<20%", label: "Less than 20%" },
	{ value: "20-50%", label: "20-50%" },
	{ value: "50-80%", label: "50-80%" },
	{ value: "80%+", label: "80%+" },
];
