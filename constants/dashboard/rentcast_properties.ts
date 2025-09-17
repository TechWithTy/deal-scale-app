import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { createRentCastProperty } from "@/types/_dashboard/property";
import { generateMockRentCastProperty } from "./mockRentCast";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../data";
import type { PropertyType as RentCastPropertyType } from "@/types/_dashboard/rentcast_types";

// Types for property-related data
interface PropertyImage {
	url: string;
	isPrimary: boolean;
	label?: string;
}

// Constants for property generation
const PROPERTY_TYPES: RentCastPropertyType[] = [
	"Single Family",
	"Multi-Family",
	"Condo",
	"Townhouse",
	"Apartment",
	"Mobile Home",
	"Land",
	"Other",
];

// Helper function to generate property images
const generatePropertyImages = (count = 5): PropertyImage[] => {
	const images: PropertyImage[] = [];

	// Generate primary image
	images.push({
		url: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
		isPrimary: true,
		label: "Front View",
	});

	// Generate additional images
	for (let i = 1; i < count; i++) {
		images.push({
			url: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
			isPrimary: false,
			label: faker.helpers.arrayElement([
				"Living Room",
				"Kitchen",
				"Bedroom",
				"Bathroom",
				"Backyard",
				"Dining Area",
				"Garage",
				"Pool",
			]),
		});
	}

	return images;
};

/**
 * Generates a single mock RentCast property with application-specific formatting
 */
const generateMockProperty = () => {
	// Generate a mock RentCast property
	const rentCastProperty = generateMockRentCastProperty();

	// Map the RentCast property to our application's property structure
	return createRentCastProperty({
		id: rentCastProperty.id,
		address: {
			street: rentCastProperty.address.street,
			city: rentCastProperty.address.city,
			state: rentCastProperty.address.state,
			zipCode: rentCastProperty.address.zipCode,
			fullStreetLine: rentCastProperty.address.fullStreetLine,
			latitude: rentCastProperty.address.latitude,
			longitude: rentCastProperty.address.longitude,
		},
		details: {
			beds: rentCastProperty.details.beds,
			fullBaths: rentCastProperty.details.fullBaths,
			halfBaths: rentCastProperty.details.halfBaths,
			sqft: rentCastProperty.details.sqft,
			yearBuilt: rentCastProperty.details.yearBuilt,
			lotSqft: rentCastProperty.details.lotSqft,
			propertyType: rentCastProperty.details.propertyType,
			stories: rentCastProperty.details.stories,
			style: rentCastProperty.details.style,
			construction: rentCastProperty.details.construction,
			roof: rentCastProperty.details.roof,
			parking: rentCastProperty.details.parking,
		},
		metadata: {
			source: "rentcast",
			lastUpdated: new Date().toISOString(),
			lastSaleDate: rentCastProperty.metadata.lastSaleDate,
			lastSalePrice: rentCastProperty.metadata.lastSalePrice,
			assessorID: rentCastProperty.metadata.assessorID,
			legalDescription: rentCastProperty.metadata.legalDescription,
			subdivision: rentCastProperty.metadata.subdivision,
			zoning: rentCastProperty.metadata.zoning,
			ownerOccupied: rentCastProperty.metadata.ownerOccupied,
			hoa: rentCastProperty.metadata.hoa,
			taxAssessments: rentCastProperty.metadata.taxAssessments,
			propertyTaxes: rentCastProperty.metadata.propertyTaxes,
		},
	});
};

/**
 * Generates an array of mock RentCast properties
 * @param count Number of properties to generate (default: 10)
 * @returns Array of mock properties
 */
const generateMockProperties = (count = 10) => {
	return Array.from({ length: count }, () => generateMockProperty());
};

export { generateMockProperty, generateMockProperties, type PropertyImage };

// Guarded mock array export for mapped RentCast properties
export const mockRentCastMappedProperties:
	| ReturnType<typeof generateMockProperties>
	| false = NEXT_PUBLIC_APP_TESTING_MODE && generateMockProperties(100);
