import { v4 as uuidv4 } from "uuid";
import {
	createRealtorProperty,
	createRentCastProperty,
} from "@/types/_dashboard/property";

/**
 * Creates an empty property with default values
 */
export function createEmptyProperty() {
	const now = new Date().toISOString();

	return createRealtorProperty({
		id: uuidv4(),
		address: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			fullStreetLine: "",
			latitude: 0,
			longitude: 0,
		},
		details: {
			beds: 0,
			fullBaths: 0,
			halfBaths: null,
			sqft: null,
			yearBuilt: new Date().getFullYear(),
			lotSqft: null,
			propertyType: "Unknown",
			stories: 0,
			style: "",
			construction: "",
			roof: "",
			parking: "",
		},
		metadata: {
			source: "realtor",
			lastUpdated: now,
			listPrice: 0,
			pricePerSqft: 0,
			status: "Unknown",
			mlsId: "",
			mls: "",
			listDate: now,
			lastSoldDate: now,
			daysOnMarket: 0,
			parkingGarage: 0,
			nearbySchools: "",
			neighborhoods: "",
			agent: {
				name: "",
				email: "",
				phones: [],
				broker: "",
			},
		},
		media: {
			images: [],
			virtualTours: [],
		},
		description: "",
	});
}

/**
 * Gets the primary image URL from a property
 */
export function getPrimaryImage(property: any) {
	if (!property.media?.images?.length) return "";
	const primaryImage = property.media.images.find((img: any) => img.isPrimary);
	return primaryImage?.url || property.media.images[0]?.url || "";
}

/**
 * Formats the property address
 */
export function formatPropertyAddress(property: any) {
	if (!property.address) return "";
	const { street, unit, city, state, zipCode } = property.address;
	return `${street}${unit ? ` ${unit}` : ""}, ${city}, ${state} ${zipCode}`;
}

/**
 * Formats the property details (beds, baths, sqft)
 */
export function formatPropertyDetails(property: any) {
	if (!property.details) return "";
	const { beds, fullBaths, halfBaths, sqft, yearBuilt } = property.details;
	const halfBathText = halfBaths ? `, ${halfBaths} half` : "";
	return `${beds} bed | ${fullBaths}${halfBathText} bath | ${sqft?.toLocaleString() || "N/A"} sqft | ${yearBuilt} year built`;
}
