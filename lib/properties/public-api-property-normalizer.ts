import { createRealtorProperty } from "@/types/_dashboard/property";
import type { Property } from "@/types/_dashboard/property";

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function text(value: unknown, fallback = "") {
	return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value: unknown, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizePublicApiProperty(payload: unknown): Property | null {
	const record = asRecord(payload);
	const source = asRecord(record.property ?? record.data ?? record);
	if (!Object.keys(source).length) return null;
	const address = asRecord(source.address);
	const details = asRecord(source.details);
	const metadata = asRecord(source.metadata);
	const now = new Date().toISOString();
	const street = text(source.street ?? source.street_address ?? address.street);
	const city = text(source.city ?? address.city);
	const state = text(source.state ?? address.state);
	const zipCode = text(source.zip_code ?? source.zipCode ?? address.zipCode);
	const listPrice = number(
		source.list_price ?? source.value ?? metadata.listPrice,
	);

	return createRealtorProperty({
		address: {
			city,
			fullStreetLine: text(address.fullStreetLine, street),
			latitude: number(source.latitude ?? address.latitude),
			longitude: number(source.longitude ?? address.longitude),
			state,
			street,
			zipCode,
		},
		description: text(source.description ?? source.summary),
		details: {
			beds: number(source.beds ?? details.beds),
			construction: text(details.construction, "Unknown"),
			fullBaths: number(source.baths ?? source.full_baths ?? details.fullBaths),
			halfBaths: null,
			lotSqft: number(source.lot_sqft ?? details.lotSqft),
			parking: text(details.parking, "Unknown"),
			propertyType: text(
				source.property_type ?? details.propertyType,
				"Unknown",
			),
			roof: text(details.roof, "Unknown"),
			sqft: number(source.sqft ?? source.square_feet ?? details.sqft),
			stories: number(details.stories, 1),
			style: text(source.property_type ?? details.style, "Unknown"),
			yearBuilt: number(source.year_built ?? details.yearBuilt),
		},
		id: text(source.id ?? source.property_id, "public-api-property"),
		metadata: {
			agent: { broker: "", email: "", name: "", phones: [] },
			daysOnMarket: number(source.days_on_market ?? metadata.daysOnMarket),
			lastSoldDate: text(source.last_sold_date ?? metadata.lastSoldDate, now),
			lastUpdated: text(source.updated_at ?? metadata.lastUpdated, now),
			listDate: text(source.list_date ?? metadata.listDate, now),
			listPrice,
			mls: text(source.mls ?? metadata.mls),
			mlsId: text(source.mls_id ?? metadata.mlsId),
			nearbySchools: "",
			neighborhoods: "",
			parkingGarage: 0,
			pricePerSqft: number(source.price_per_sqft ?? metadata.pricePerSqft),
			source: "realtor",
			status: text(source.status ?? metadata.status, "Unknown"),
		},
		media: { images: [], virtualTours: [] },
		property_id: text(source.property_id ?? source.id, "public-api-property"),
	});
}
