/**
 * Deal Generation Utilities
 * Logic for converting leads to deals automatically
 */

import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type {
	Deal,
	DealType,
	SourceLead,
	SourceCampaign,
	PropertyDetails,
} from "@/types/_dashboard/dealRoom";

export interface LeadToDealConversionParams {
	lead: LeadTypeGlobal;
	campaignId?: string;
	campaignName?: string;
	campaignType?: "call" | "text" | "email" | "social";
	suggestedDealType?: DealType;
	purchasePrice?: number;
	estimatedARV?: number;
}

/**
 * Convert a lead to a Source Lead reference
 */
export function leadToSourceLead(lead: LeadTypeGlobal): SourceLead {
	const fullName =
		`${lead.contactInfo.firstName} ${lead.contactInfo.lastName}`.trim();

	return {
		leadId: lead.id,
		leadName: fullName || "Unknown Lead",
		leadEmail: lead.contactInfo.email || undefined,
		leadPhone: lead.contactInfo.phone || undefined,
	};
}

/**
 * Create a Source Campaign reference
 */
export function createSourceCampaign(
	campaignId: string,
	campaignName: string,
	campaignType: "call" | "text" | "email" | "social",
): SourceCampaign {
	return {
		campaignId,
		campaignName,
		campaignType,
		convertedAt: new Date().toISOString(),
	};
}

/**
 * Extract property details from a lead
 */
export function extractPropertyDetails(lead: LeadTypeGlobal): PropertyDetails {
	return {
		bedrooms: lead.bed || undefined,
		bathrooms: lead.bath || undefined,
		squareFeet: lead.sqft || undefined,
		yearBuilt: lead.yearBuilt || undefined,
		propertyType: undefined, // Not in lead data
	};
}

/**
 * Suggest deal type based on lead and property characteristics
 */
export function suggestDealType(lead: LeadTypeGlobal): DealType {
	const sqft = lead.sqft || 0;
	const bed = lead.bed || 0;
	const bath = lead.bath || 0;
	const value = lead.propertyValue || 0;

	// Multi-family: 2+ units or specific tags
	if (
		lead.tags?.toLowerCase().includes("multi") ||
		lead.tags?.toLowerCase().includes("duplex") ||
		bed >= 5
	) {
		return "multi-family";
	}

	// Commercial: High value or commercial tags
	if (
		value > 1000000 ||
		lead.tags?.toLowerCase().includes("commercial") ||
		lead.tags?.toLowerCase().includes("retail")
	) {
		return "commercial";
	}

	// Wholesale: Quick flip indicators
	if (
		lead.tags?.toLowerCase().includes("wholesale") ||
		lead.tags?.toLowerCase().includes("assignment") ||
		lead.summary?.toLowerCase().includes("motivated")
	) {
		return "wholesale";
	}

	// Fix & Flip: Distressed property indicators
	if (
		lead.tags?.toLowerCase().includes("flip") ||
		lead.tags?.toLowerCase().includes("rehab") ||
		lead.tags?.toLowerCase().includes("fixer") ||
		lead.summary?.toLowerCase().includes("needs work")
	) {
		return "fix-and-flip";
	}

	// Land: Low sqft or land-specific tags
	if (
		sqft < 500 ||
		lead.tags?.toLowerCase().includes("land") ||
		lead.tags?.toLowerCase().includes("lot")
	) {
		return "land";
	}

	// Default: Single-family rental
	return "single-family-rental";
}

/**
 * Determine if a lead qualifies for automatic deal conversion
 */
export function shouldAutoConvertLead(lead: LeadTypeGlobal): boolean {
	// Convert if lead status is "Closed" (deal made)
	if (lead.status === "Closed") {
		return true;
	}

	// Convert if lead has high intent signals
	if (lead.intentSignals && lead.intentSignals.length > 0) {
		const highIntentSignals = lead.intentSignals.filter(
			(signal) => signal.strength === "strong" || signal.confidence > 0.8,
		);
		if (highIntentSignals.length >= 2) {
			return true;
		}
	}

	// Convert if lead is tagged as hot/qualified
	if (lead.tags) {
		const hotTags = ["hot", "qualified", "ready", "offer", "under contract"];
		const hasHotTag = hotTags.some((tag) =>
			lead.tags?.toLowerCase().includes(tag),
		);
		if (hasHotTag) {
			return true;
		}
	}

	// Convert if lead has high priority
	if (
		lead.priority?.toLowerCase() === "high" ||
		lead.priority?.toLowerCase() === "urgent"
	) {
		return true;
	}

	return false;
}

/**
 * Generate a deal from lead data
 */
export function generateDealFromLead(
	params: LeadToDealConversionParams,
): Omit<Deal, "id" | "createdAt" | "updatedAt"> {
	const {
		lead,
		campaignId,
		campaignName,
		campaignType,
		suggestedDealType,
		purchasePrice,
		estimatedARV,
	} = params;

	const sourceLead = leadToSourceLead(lead);
	const sourceCampaign =
		campaignId && campaignName && campaignType
			? createSourceCampaign(campaignId, campaignName, campaignType)
			: undefined;
	const propertyDetails = extractPropertyDetails(lead);
	const dealType = suggestedDealType || suggestDealType(lead);

	// Use property value from lead or provided purchase price
	const price = purchasePrice || lead.propertyValue || 0;
	const arv = estimatedARV || (price ? Math.round(price * 1.2) : undefined);
	const roi =
		arv && price > 0 ? Math.round(((arv - price) / price) * 100) : undefined;

	// Calculate estimated days to close based on deal type
	const estimatedDaysMap: Record<DealType, number> = {
		"single-family-rental": 45,
		"fix-and-flip": 30,
		"multi-family": 60,
		commercial: 90,
		wholesale: 14,
		land: 60,
	};

	const daysToClose = estimatedDaysMap[dealType];
	const closingDate = new Date();
	closingDate.setDate(closingDate.getDate() + daysToClose);

	return {
		propertyAddress: lead.address1.fullStreetLine,
		propertyCity: lead.address1.city,
		propertyState: lead.address1.state,
		propertyZip: lead.address1.zipCode,
		propertyPhoto: undefined,
		dealType,
		status: "pre-offer",
		purchasePrice: price,
		estimatedARV: arv,
		projectedROI: roi,
		closingDate: closingDate.toISOString(),
		daysUntilClosing: daysToClose,
		completionPercentage: 5, // Just started
		ownerId: "current-user",
		ownerName: "Current User",
		sourceLead,
		sourceCampaign,
		propertyDetails,
	};
}

/**
 * Validate deal data before creation
 */
export function validateDealData(deal: Partial<Deal>): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!deal.propertyAddress) {
		errors.push("Property address is required");
	}

	if (!deal.propertyCity || !deal.propertyState) {
		errors.push("City and state are required");
	}

	if (!deal.purchasePrice || deal.purchasePrice <= 0) {
		errors.push("Valid purchase price is required");
	}

	if (deal.estimatedARV && deal.estimatedARV < deal.purchasePrice) {
		errors.push("ARV cannot be less than purchase price");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}
