// types/_dashboard/property.ts
import { v4 as uuidv4 } from "uuid";

/**
 * Base property interface with common fields for all properties
 */
export interface BaseProperty {
	/** Unique identifier */
	id: string;

	/** Property address */
	address: {
		street: string;
		unit?: string | null;
		city: string;
		state: string;
		zipCode: string;
		fullStreetLine: string;
		latitude: number;
		longitude: number;
	};

	/** Basic property details */
	details: {
		beds: number;
		fullBaths: number;
		halfBaths: number | null;
		sqft: number | null;
		yearBuilt: number;
		lotSqft: number | null;
		propertyType: string;
		stories: number;
		style: string;
		construction: string;
		roof: string;
		parking: string;
	};

	/** Source of the property data */
	source: "rentcast" | "realtor";

	/** Last update timestamp */
	lastUpdated: string;
}

// Base property metadata interface
export interface BasePropertyMetadata {
	// Common metadata fields can go here
	lastUpdated: string;
	source: "realtor" | "rentcast";
}

// Realtor-specific metadata
export interface PropertyRealtorMetadata extends BasePropertyMetadata {
	source: "realtor";
	// Listing information
	listPrice: number;
	pricePerSqft: number;
	status: string;
	mlsId: string;
	mls: string;
	listDate: string;
	lastSoldDate: string;
	daysOnMarket: number;
	hoaFee?: number;
	parkingGarage: number;
	nearbySchools: string;
	neighborhoods: string;

	// Agent information
	agent: {
		name: string;
		email: string;
		phones: Array<{
			number: string;
			primary: boolean;
			type: string;
			ext: string | null;
		}>;
		broker: string;
	};
}

// RentCast-specific metadata
export interface PropertyRentCastMetadata extends BasePropertyMetadata {
	source: "rentcast";
	// RentCast specific fields
	lastSaleDate?: string;
	lastSalePrice?: number;
	assessorID?: string;
	legalDescription?: string;
	subdivision?: string;
	zoning?: string;
	ownerOccupied?: boolean;
	hoa?: {
		fee: number;
		[key: string]: unknown;
	};
	taxAssessments?: {
		[year: string]: {
			year: number;
			value: number;
			land: number;
			improvements: number;
		};
	};
	propertyTaxes?: {
		[year: string]: {
			year: number;
			total: number;
		};
	};
}

// Forward declarations to avoid circular dependencies
export type PropertyMetadata =
	| PropertyRealtorMetadata
	| PropertyRentCastMetadata;

export interface RealtorProperty extends Omit<BaseProperty, "source"> {
	property_id: string;
	source: "realtor";
	metadata: PropertyRealtorMetadata;

	media: {
		images: Array<{
			url: string;
			isPrimary: boolean;
			label?: string;
		}>;
		virtualTours: Array<{
			url: string;
			type: string;
			thumbnail: string;
		}>;
	};
	description: string;
}

export interface RentCastProperty extends Omit<BaseProperty, "source"> {
	source: "rentcast";
	metadata: PropertyRentCastMetadata;
	// Additional RentCast specific fields
}

export type Property = RealtorProperty | RentCastProperty;

// Type guards
export function isRealtorProperty(
	property: Property,
): property is RealtorProperty {
	return property.source === "realtor";
}

export function isRentCastProperty(
	property: Property,
): property is RentCastProperty {
	return property.source === "rentcast";
}

// Factory functions
export function createBaseProperty(
	overrides: Partial<BaseProperty> = {},
): BaseProperty {
	const now = new Date().toISOString();
	return {
		id: overrides.id || uuidv4(),
		address: {
			street: "",
			unit: null,
			city: "",
			state: "",
			zipCode: "",
			fullStreetLine: "",
			latitude: 0,
			longitude: 0,
			...overrides.address,
		},
		details: {
			beds: 0,
			fullBaths: 0,
			halfBaths: null,
			sqft: null,
			yearBuilt: 0,
			lotSqft: null,
			propertyType: "Unknown",
			stories: 0,
			style: "",
			construction: "",
			roof: "",
			parking: "",
			...overrides.details,
		},
		source: "rentcast", // Default, can be overridden
		lastUpdated: now,
		...overrides,
	};
}

export function createRealtorProperty(
	overrides: Partial<RealtorProperty> &
		Pick<RealtorProperty, "metadata" | "media" | "description">,
): RealtorProperty {
	const base = createBaseProperty(overrides);
	return {
		...base,
		source: "realtor",
		...overrides,
	} as RealtorProperty;
}
export function createRentCastProperty(
	overrides: Partial<Omit<RentCastProperty, "metadata">> &
		Pick<RentCastProperty, "metadata">,
): RentCastProperty {
	const base = createBaseProperty(overrides);
	return {
		...base,
		source: "rentcast",

		...overrides,
	};
}
