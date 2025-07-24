// RentCast Property Data Types
// Generated from RentCast API documentation
// https://docs.rentcast.io/reference/get_properties

type PropertyType =
	| "Single Family"
	| "Multi-Family"
	| "Condo"
	| "Townhouse"
	| "Apartment"
	| "Mobile Home"
	| "Land"
	| "Other";

type ArchitectureType =
	| "Apartment"
	| "Bi-Level"
	| "Bungalow"
	| "Cape Cod"
	| "Colonial"
	| "Condo"
	| "Contemporary"
	| "Conventional"
	| "Cottage"
	| "Custom"
	| "Duplex"
	| "European"
	| "High Rise"
	| "Historical"
	| "Mobile Home"
	| "Modern"
	| "Multi-Unit Building"
	| "Raised Ranch"
	| "Rambler"
	| "Ranch"
	| "Spanish"
	| "Split Level"
	| "Townhouse"
	| "Traditional"
	| "Triplex"
	| "Other";

type CoolingType =
	| "Central"
	| "Commercial"
	| "Evaporative"
	| "Other"
	| "Package"
	| "Refrigeration"
	| "Wall"
	| "Window";

type ExteriorType =
	| "Aluminum"
	| "Aluminum Siding"
	| "Asbestos Shingle"
	| "Block"
	| "Brick"
	| "Brick Veneer"
	| "Combination"
	| "Composition"
	| "Concrete"
	| "Concrete Block"
	| "Frame"
	| "Frame Siding"
	| "Marble"
	| "Marblecrete"
	| "Masonry"
	| "Metal"
	| "Shingle"
	| "Siding"
	| "Stone"
	| "Stucco"
	| "Vinyl"
	| "Vinyl Siding"
	| "Wood"
	| "Wood Frame"
	| "Wood Shingle"
	| "Other";

type FireplaceType =
	| "1 Story"
	| "1 Story Brick Chimney"
	| "2 Story"
	| "2 Story Brick Chimney"
	| "Backed"
	| "Gas Log"
	| "Masonry"
	| "Prefab"
	| "Single"
	| "Other";

type FoundationType =
	| "Block"
	| "Concrete"
	| "Concrete Block"
	| "Crawl"
	| "Footing"
	| "Masonry"
	| "Mat"
	| "Pier"
	| "Pile"
	| "Post & Beam"
	| "Raft"
	| "Raised"
	| "Slab"
	| "Stone"
	| "Wood"
	| "Other";

type GarageType =
	| "Attached"
	| "Basement"
	| "Built-in"
	| "Carport"
	| "Detached"
	| "Garage"
	| "Mixed"
	| "Underground"
	| "Other";

type HeatingType =
	| "Baseboard"
	| "Central"
	| "Electric"
	| "Floor"
	| "Forced Air"
	| "Furnace"
	| "Gas"
	| "Heat Pump"
	| "Hot Water"
	| "Oil"
	| "Package"
	| "Radiant"
	| "Steam"
	| "Wall"
	| "Other";

type PoolType =
	| "Above-Ground Pool"
	| "Community Pool"
	| "Concrete"
	| "Fiberglass"
	| "Gunite"
	| "Heated Pool"
	| "In-Ground Pool"
	| "In-Ground Vinyl Pool"
	| "Indoor Pool"
	| "Municipal"
	| "Plastic"
	| "Pool and Hot Tub"
	| "Public"
	| "Reinforced Concrete"
	| "Spa"
	| "Other";

type RoofType =
	| "Aluminum"
	| "Asbestos"
	| "Asphalt"
	| "Built-up"
	| "Composition Shingle"
	| "Concrete"
	| "Concrete Tile"
	| "Fiberglass"
	| "Gravel"
	| "Metal"
	| "Roll Composition"
	| "Shake"
	| "Shingle"
	| "Slate"
	| "Tile"
	| "Wood"
	| "Wood Shake"
	| "Wood Shingle"
	| "Other";

type ViewType =
	| "Average"
	| "Beach"
	| "Canal"
	| "City"
	| "Corner"
	| "Cul-de-sac"
	| "Excellent"
	| "Fair"
	| "Golf Course"
	| "Good"
	| "Lake"
	| "Mountain"
	| "Park"
	| "River"
	| "Water"
	| "Waterfront"
	| "Other";

interface PropertyFeatures {
	architectureType?: ArchitectureType;
	cooling?: boolean;
	coolingType?: CoolingType;
	exteriorType?: ExteriorType;
	fireplace?: boolean;
	fireplaceType?: FireplaceType;
	floorCount?: number;
	foundationType?: FoundationType;
	garage?: boolean;
	garageSpaces?: number;
	garageType?: GarageType;
	heating?: boolean;
	heatingType?: HeatingType;
	pool?: boolean;
	poolType?: PoolType;
	roofType?: RoofType;
	roomCount?: number;
	unitCount?: number;
	viewType?: ViewType;
	[key: string]: unknown; // For any additional features not explicitly typed
}

interface TaxAssessment {
	year: number;
	value: number;
	land: number;
	improvements: number;
}

interface PropertyTax {
	year: number;
	total: number;
}

interface PropertyHistoryEvent {
	event: "Sale";
	date: string; // ISO 8601 format
	price: number;
}

interface MailingAddress {
	id: string;
	formattedAddress: string;
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	zipCode: string;
}

interface PropertyOwner {
	names: string[];
	type: "Individual" | "Organization";
	mailingAddress: MailingAddress;
}

interface PropertyRecord {
	// Basic Property Information
	id: string;
	formattedAddress: string;
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	zipCode: string;
	county: string;
	latitude: number;
	longitude: number;

	// Property Characteristics
	propertyType: PropertyType;
	bedrooms: number;
	bathrooms: number;
	squareFootage: number;
	lotSize: number;
	yearBuilt: number;

	// Legal & Identification
	assessorID?: string;
	legalDescription?: string;
	subdivision?: string;
	zoning?: string;

	// Sales History
	lastSaleDate?: string; // ISO 8601 format
	lastSalePrice?: number;

	// HOA Information
	hoa?: {
		fee: number;
		[key: string]: unknown; // For any additional HOA fields
	};

	// Property Features
	features?: PropertyFeatures;

	// Tax Information
	taxAssessments?: {
		[year: string]: TaxAssessment;
	};

	propertyTaxes?: {
		[year: string]: PropertyTax;
	};

	// Property History
	history?: {
		[date: string]: PropertyHistoryEvent;
	};

	// Owner Information
	owner?: PropertyOwner;
	ownerOccupied?: boolean;

	// Allow for additional properties not explicitly typed
	[key: string]: unknown;
}

export type RentCastOffMarketProperty = {
	property: PropertyRecord;
	features?: PropertyFeatures;
	taxAssessments?: { [year: string]: TaxAssessment };
	propertyTaxes?: { [year: string]: PropertyTax };
	history?: { [date: string]: PropertyHistoryEvent };
	owner?: PropertyOwner;
	propertyType: PropertyType;
	architectureType?: ArchitectureType;
	coolingType?: CoolingType;
	exteriorType?: ExteriorType;
	fireplaceType?: FireplaceType;
	foundationType?: FoundationType;
	garageType?: GarageType;
	heatingType?: HeatingType;
	poolType?: PoolType;
	roofType?: RoofType;
	viewType?: ViewType;
	address: MailingAddress;
};

export type {
	PropertyRecord,
	PropertyFeatures,
	TaxAssessment,
	PropertyTax,
	PropertyHistoryEvent,
	PropertyOwner,
	MailingAddress,
	PropertyType,
	ArchitectureType,
	CoolingType,
	ExteriorType,
	FireplaceType,
	FoundationType,
	GarageType,
	HeatingType,
	PoolType,
	RoofType,
	ViewType,
};
