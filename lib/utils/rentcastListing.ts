import type {
	OnMarketResult,
	RentCastListing,
} from "@/types/_dashboard/rentcast_listing";

/**
 * Determine if a listing is on market based on RentCast rules
 * - On-Market = listing exists and status === "Active"
 * - Off-Market = no listing or status === "Inactive"
 */
export function computeOnMarket(
	listing?: RentCastListing | null,
): OnMarketResult {
	if (!listing) {
		return { on_market: false, reason: "No listing record" };
	}
	const status = listing.status;
	if (status === "Active") {
		return { on_market: true };
	}
	if (status === "Inactive") {
		return {
			on_market: false,
			last_known_price: listing.price,
			removed_date: listing.removedDate ?? null,
		};
	}
	return { on_market: false, reason: "Unknown status" };
}
