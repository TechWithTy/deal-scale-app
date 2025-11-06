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
	motivationLevel: z.array(z.string()).optional(),
	purchaseTimeline: z.string().optional(),
	investmentExperience: z.string().optional(),
	budgetMin: z.number().optional(),
	budgetMax: z.number().optional(),
	creditScoreMin: z.number().optional(),
	creditScoreMax: z.number().optional(),
	cashBuyerOnly: z.boolean().optional(),
	portfolioSize: z.string().optional(),

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
