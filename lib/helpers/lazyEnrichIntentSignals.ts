/**
 * Lazy Intent Signal Enrichment
 *
 * Enriches leads with intent signals on-demand to improve initial load performance
 */

import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import { enrichLeadWithIntentSignals } from "./enrichLeadsWithIntentSignals";

// Cache for enriched leads to avoid re-enriching
const enrichmentCache = new Map<string, LeadTypeGlobal>();

/**
 * Lazily enrich a lead with intent signals (only if not already enriched)
 * Uses caching to avoid re-enriching the same lead multiple times
 */
export function lazyEnrichLead(lead: LeadTypeGlobal): LeadTypeGlobal {
	// Already has intent data
	if (lead.intentSignals && lead.intentScore) {
		return lead;
	}

	// Check cache
	if (enrichmentCache.has(lead.id)) {
		return enrichmentCache.get(lead.id)!;
	}

	// Enrich based on status
	const intentProfile =
		lead.status === "Closed"
			? "high"
			: lead.status === "Contacted"
				? "medium"
				: "low";

	const enrichedLead = enrichLeadWithIntentSignals(lead, intentProfile);

	// Cache the result
	enrichmentCache.set(lead.id, enrichedLead);

	return enrichedLead;
}

/**
 * Clear the enrichment cache (useful for testing or when data changes)
 */
export function clearEnrichmentCache(): void {
	enrichmentCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
	return {
		cachedLeads: enrichmentCache.size,
		cacheKeys: Array.from(enrichmentCache.keys()).slice(0, 10), // First 10 for debugging
	};
}
