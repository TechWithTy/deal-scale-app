/**
 * Configuration Builder Utility
 * Transforms form values into LookalikeConfig format
 * @module lookalike/utils
 */

import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import type { LookalikeConfig } from "@/types/lookalike";
import type { FormValues } from "../types";

/**
 * Builds a complete LookalikeConfig from form values
 * Handles type conversions and data structuring
 */
export function buildLookalikeConfig(
	values: FormValues,
	seedListId: string,
	seedListName: string,
	seedLeadCount: number,
	userPersona?: QuickStartPersonaId,
	userGoal?: QuickStartGoalId,
): LookalikeConfig {
	return {
		seedListId,
		seedListName,
		seedLeadCount,
		userPersona,
		userGoal,
		similarityThreshold: values.similarityThreshold,
		targetSize: values.targetSize,
		salesTargeting: {
			buyerPersona: values.buyerPersona as any,
			targetInterests: values.targetInterests,
			targetIndustry: values.targetIndustry,
			motivationLevel: values.motivationLevel as any,
			purchaseTimeline: values.purchaseTimeline as any,
			investmentExperience: values.investmentExperience as any,
			budgetRange: {
				min: values.budgetMin,
				max: values.budgetMax,
			},
			creditScoreRange: {
				min: values.creditScoreMin,
				max: values.creditScoreMax,
			},
			cashBuyerOnly: values.cashBuyerOnly,
			portfolioSize: values.portfolioSize as any,
			// Sales AI Scores
			minCreditScore: values.minCreditScore,
			minResponseRate: values.minResponseRate,
			minPurchaseIntent: values.minPurchaseIntent,
			excludeLowEngagement: values.excludeLowEngagement,
			skipColdLeads: values.skipColdLeads,
		},
		propertyFilters: {
			propertyTypes: values.propertyTypes as any,
			propertyStatus: values.propertyStatus as any,
			priceRange: {
				min: values.priceMin,
				max: values.priceMax,
			},
			bedrooms: {
				min: values.bedroomsMin,
				max: values.bedroomsMax,
			},
			bathrooms: {
				min: values.bathroomsMin,
				max: values.bathroomsMax,
			},
			sqft: {
				min: values.sqftMin,
				max: values.sqftMax,
			},
			lotSize: {
				min: values.lotSizeMin,
				max: values.lotSizeMax,
			},
			yearBuilt: {
				min: values.yearBuiltMin,
				max: values.yearBuiltMax,
			},
			ownershipDuration: values.ownershipDuration as any,
			equityPosition: values.equityPosition as any,
			distressedSignals: values.distressedSignals as any,
			// Property AI Scores
			maxFloodScore: values.maxFloodScore,
			maxCrimeScore: values.maxCrimeScore,
			minAirQuality: values.minAirQuality,
			minConditionScore: values.minConditionScore,
			minSchoolRating: values.minSchoolRating,
			requireRecentPhotos: values.requireRecentPhotos,
			skipRecentlySold: values.skipRecentlySold,
			skipListedProperties: values.skipListedProperties,
		},
		geoFilters: {
			states: values.states,
			counties: values.counties,
			cities: values.cities
				?.split(",")
				.map((c) => c.trim())
				.filter(Boolean),
			zipCodes: values.zipCodes
				?.split(",")
				.map((z) => z.trim())
				.filter(Boolean),
			radius:
				values.radiusAddress && values.radiusMiles
					? { address: values.radiusAddress, miles: values.radiusMiles }
					: undefined,
			msaAreas: values.msaAreas,
			excludeAreas: {
				states: values.excludeStates,
				cities: values.excludeCities
					?.split(",")
					.map((c) => c.trim())
					.filter(Boolean),
			},
			// Geographic AI Scores
			minWalkScore: values.minWalkScore,
			minTransitScore: values.minTransitScore,
			minBikeScore: values.minBikeScore,
			minAppreciation: values.minAppreciation,
			minPopGrowth: values.minPopGrowth,
			requireUrbanProximity: values.requireUrbanProximity,
			skipOverlappingAreas: values.skipOverlappingAreas,
			consolidateByMarket: values.consolidateByMarket,
		},
		generalOptions: {
			excludeListIds: values.excludeListIds,
			dncCompliance: true, // Always true
			tcpaOptInRequired: true, // Always true
			requirePhone: true, // Always true
			requireEmail: values.requireEmail,
			dataRecencyDays: values.dataRecencyDays,
			enrichmentLevel: values.enrichmentLevel,
			enrichmentRequired: values.enrichmentRequired,
			intentLevels: values.intentLevels as any,
			corporateOwnership: values.corporateOwnership as any,
			absenteeOwner: values.absenteeOwner as any,

			// Efficiency & Deduplication
			skipDuplicates: values.skipDuplicates ?? true,
			skipAlreadyTraced: values.skipAlreadyTraced ?? true,
			skipExistingCampaigns: values.skipExistingCampaigns ?? true,
			skipDncList: values.skipDncList ?? true,
			skipPreviouslyContacted: values.skipPreviouslyContacted ?? false,
			skipInvalidData: values.skipInvalidData,

			// Social Profile Enrichment
			socialEnrichment: values.socialEnrichment ?? true,
			includeFacebook: values.includeFacebook ?? true,
			includeLinkedIn: values.includeLinkedIn ?? true,
			includeInstagram: values.includeInstagram ?? true,
			includeFriendsData: values.includeFriendsData ?? true,
			includeInterests: values.includeInterests ?? true,
			includeEmployment: values.includeEmployment ?? true,
			includeUsername: values.includeUsername ?? true,
			includeSocialDossier: values.includeSocialDossier ?? false,

			// Social Efficiency
			skipNoEmail: values.skipNoEmail,
			skipAlreadyEnriched: values.skipAlreadyEnriched,
			skipInactiveProfiles: values.skipInactiveProfiles,
			skipPrivateProfiles: values.skipPrivateProfiles,

			// Social AI Scores
			minInfluenceScore: values.minInfluenceScore,
			minConnections: values.minConnections,
			minProfileCompleteness: values.minProfileCompleteness,
			minEngagementRate: values.minEngagementRate,
			minAccountAge: values.minAccountAge,
			requireVerified: values.requireVerified,

			// Compliance Advanced Scores
			minPhoneValidity: values.minPhoneValidity,
			minEmailDeliverability: values.minEmailDeliverability,
			minAddressValidity: values.minAddressValidity,
			maxDataAge: values.maxDataAge,
			requireNcoaVerified: values.requireNcoaVerified,
			excludeLandlines: values.excludeLandlines,
			requireMultipleContacts: values.requireMultipleContacts,
		},
	};
}
