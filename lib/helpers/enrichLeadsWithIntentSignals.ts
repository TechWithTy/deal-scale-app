/**
 * Enrich Leads with Intent Signals Helper
 *
 * Adds intent signal data and scores to existing lead objects for testing and development.
 */

import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import {
	generateMockIntentSignals,
	generateIntentSignalProfile,
} from "@/constants/_faker/intentSignals";
import { calculateIntentScore } from "@/lib/scoring/intentScoring";

/**
 * Enrich a single lead with intent signals and calculated score
 * @param lead - The lead to enrich
 * @param profile - Intent profile to use (optional, randomizes if not provided)
 * @returns Enriched lead with intent signals and score
 */
export function enrichLeadWithIntentSignals(
	lead: LeadTypeGlobal,
	profile?: "high" | "medium" | "low",
): LeadTypeGlobal {
	// Determine profile based on lead status if not specified
	const intentProfile =
		profile ||
		(lead.status === "Closed"
			? "high"
			: lead.status === "Contacted"
				? "medium"
				: "low");

	// Generate signals based on profile
	const signals =
		intentProfile === "high" ||
		intentProfile === "medium" ||
		intentProfile === "low"
			? generateIntentSignalProfile(intentProfile)
			: generateMockIntentSignals(Math.floor(Math.random() * 15) + 5);

	// Calculate intent score from signals
	const intentScore = calculateIntentScore(signals);

	// Get last signal timestamp
	const lastIntentActivity =
		signals.length > 0
			? signals.sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				)[0].timestamp
			: undefined;

	return {
		...lead,
		intentSignals: signals,
		intentScore,
		lastIntentActivity,
	};
}

/**
 * Enrich multiple leads with intent signals
 * @param leads - Array of leads to enrich
 * @param percentage - Percentage of leads to enrich (0-100, default 80)
 * @returns Array of enriched leads
 */
export function enrichLeadsWithIntentSignals(
	leads: LeadTypeGlobal[],
	percentage = 80,
): LeadTypeGlobal[] {
	return leads.map((lead) => {
		// Randomly decide if this lead should have intent signals based on percentage
		const shouldEnrich = Math.random() * 100 < percentage;

		if (!shouldEnrich) {
			return lead;
		}

		return enrichLeadWithIntentSignals(lead);
	});
}

/**
 * Get leads with high intent scores only
 * @param leads - Array of leads
 * @param threshold - Minimum intent score threshold (default: 75)
 * @returns Filtered array of high-intent leads
 */
export function getHighIntentLeads(
	leads: LeadTypeGlobal[],
	threshold = 75,
): LeadTypeGlobal[] {
	return leads.filter(
		(lead) => lead.intentScore && lead.intentScore.total >= threshold,
	);
}

/**
 * Sort leads by intent score (highest first)
 * @param leads - Array of leads
 * @returns Sorted array of leads
 */
export function sortLeadsByIntentScore(
	leads: LeadTypeGlobal[],
): LeadTypeGlobal[] {
	return [...leads].sort((a, b) => {
		const scoreA = a.intentScore?.total || 0;
		const scoreB = b.intentScore?.total || 0;
		return scoreB - scoreA;
	});
}
