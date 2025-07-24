import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { createRentCastProperty } from "@/types/_dashboard/property";
import { generateMockRentCastProperty } from "./mockRentCast";
import type {
	RentCastOffMarketProperty,
	PropertyType as RentCastPropertyType,
	PropertyRecord,
	TaxAssessment,
	PropertyTax,
	PropertyFeatures,
} from "@/types/_dashboard/rentcast_off_market";

// Extended type for the full RentCast property with all its nested data
type FullRentCastProperty = Omit<RentCastOffMarketProperty, "property"> & {
	property: PropertyRecord & {
		features?: PropertyFeatures & {
			garage?: boolean;
		};
	};
	architectureType?: string;
	roofType?: string;
	taxAssessments?: Record<string, TaxAssessment>;
	propertyTaxes?: Record<string, PropertyTax>;
};

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
const generatePropertyImages = (count: number = 5): PropertyImage[] => {
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
	const rentCastProperty =
		generateMockRentCastProperty() as unknown as FullRentCastProperty;
	const { property } = rentCastProperty;

	// Extract property features with safe access
	const features = property.features || {};

	// Map the RentCast property to our application's property structure
	return createRentCastProperty({
		id: property.id,
		address: {
			street: property.addressLine1,
			city: property.city,
			state: property.state,
			zipCode: property.zipCode,
			fullStreetLine: property.formattedAddress,
			latitude: property.latitude,
			longitude: property.longitude,
		},
		details: {
			beds: property.bedrooms,
			fullBaths: Math.floor(property.bathrooms || 0),
			halfBaths: (property.bathrooms || 0) % 1 > 0 ? 1 : 0,
			sqft: property.squareFootage,
			yearBuilt: property.yearBuilt,
			lotSqft: property.lotSize,
			propertyType: property.propertyType,
			stories: 1, // Default value, can be enhanced
			style: rentCastProperty.architectureType || "Unknown",
			construction: "Unknown", // Not directly mapped
			roof: rentCastProperty.roofType || "Unknown",
			parking: features.garage ? "Garage" : "None",
		},
		metadata: {
			source: "rentcast",
			lastUpdated: new Date().toISOString(),
			lastSaleDate: property.lastSaleDate,
			lastSalePrice: property.lastSalePrice,
			assessorID: property.assessorID,
			legalDescription: property.legalDescription,
			subdivision: property.subdivision,
			zoning: property.zoning,
			ownerOccupied: property.ownerOccupied,
			hoa: property.hoa,
			taxAssessments: rentCastProperty.taxAssessments,
			propertyTaxes: rentCastProperty.propertyTaxes,
		},
	});
};

/**
 * Generates an array of mock RentCast properties
 * @param count Number of properties to generate (default: 10)
 * @returns Array of mock properties
 */
const generateMockProperties = (count: number = 10) => {
	return Array.from({ length: count }, () => generateMockProperty());
};

export { generateMockProperty, generateMockProperties, type PropertyImage };
