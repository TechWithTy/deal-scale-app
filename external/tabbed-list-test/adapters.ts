/**
 * Adapters map external API shapes to our PropertySummary domain model.
 */
import type { PropertySummary } from "./types";
import { PropertySummarySchema } from "./schemas";

/**
 * Map any backend property object to PropertySummary. Extend as needed.
 */
export function toPropertySummary(input: any): PropertySummary {
	const candidate = {
		id: String(input.id ?? input.propertyId ?? input._id),
		addressLine:
			input.addressLine ??
			input.address?.fullStreetLine ??
			input.address?.street ??
			"Unknown address",
		city: input.city ?? input.address?.city ?? "",
		state: input.state ?? input.address?.state ?? "",
		zip: input.zip ?? input.address?.zipCode ?? "",
		price: input.price ?? input.metadata?.listPrice,
		beds: input.details?.beds ?? input.beds,
		baths: input.details?.fullBaths ?? input.baths,
		sqft: input.details?.sqft ?? input.sqft,
		lotSqft: input.details?.lotSqft ?? input.lotSqft,
		imageUrl: input.media?.images?.[0]?.url ?? input.primary_photo ?? undefined,
		badges: input.badges,
		aiScore: input.aiScore,
		createdAt: input.createdAt ?? input.metadata?.listDate,
	};
	return PropertySummarySchema.parse(candidate);
}
