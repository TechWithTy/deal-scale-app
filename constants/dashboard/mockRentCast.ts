import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import type {
	RentCastProperty,
	PropertyRentCastMetadata,
} from "@/types/_dashboard/property";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../data";
import type {
	PropertyFeatures,
	TaxAssessment,
	PropertyTax,
	PropertyHistoryEvent,
	PropertyOwner,
	MailingAddress,
	ArchitectureType,
	FireplaceType,
	FoundationType,
	PoolType,
	GarageType,
	CoolingType,
	ExteriorType,
	HeatingType,
	RoofType,
	ViewType,
	PropertyType as RentCastPropertyType,
} from "@/types/_dashboard/rentcast_off_market";

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date): string => {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	).toISOString();
};

// Generate mock property features
const generatePropertyFeatures = (): PropertyFeatures => {
	// Valid values from their respective enums
	const architectureTypes: ArchitectureType[] = [
		"Apartment",
		"Bi-Level",
		"Bungalow",
		"Cape Cod",
		"Colonial",
		"Condo",
		"Contemporary",
		"Conventional",
		"Cottage",
		"Custom",
		"Duplex",
		"European",
		"High Rise",
		"Historical",
		"Mobile Home",
		"Modern",
		"Multi-Unit Building",
		"Raised Ranch",
		"Rambler",
		"Ranch",
		"Spanish",
		"Split Level",
		"Townhouse",
		"Traditional",
		"Triplex",
		"Other",
	];

	const fireplaceTypes: FireplaceType[] = [
		"1 Story",
		"2 Story",
		"Gas Log",
		"Masonry",
		"Prefab",
		"Single",
	];

	const foundationTypes: FoundationType[] = [
		"Block",
		"Concrete",
		"Crawl",
		"Slab",
		"Stone",
		"Wood",
		"Raised",
		"Other",
	];

	const poolTypes: PoolType[] = [
		"Above-Ground Pool",
		"In-Ground Pool",
		"Community Pool",
		"Plastic",
		"Spa",
		"Other",
	];

	const coolingTypes: CoolingType[] = [
		"Central",
		"Commercial",
		"Evaporative",
		"Other",
		"Package",
		"Refrigeration",
		"Wall",
		"Window",
	];

	const exteriorTypes: ExteriorType[] = [
		"Brick",
		"Vinyl",
		"Wood",
		"Stucco",
		"Stone",
		"Other",
	];

	const garageTypes: GarageType[] = ["Attached", "Carport", "Detached"];

	const heatingTypes: HeatingType[] = [
		"Forced Air",
		"Heat Pump",
		"Radiant",
		"Baseboard",
		"Other",
	];

	const roofTypes: RoofType[] = [
		"Asphalt",
		"Shingle",
		"Tile",
		"Metal",
		"Other",
	];

	const viewTypes: ViewType[] = ["Mountain", "City", "Park", "Water", "Other"];

	const features: PropertyFeatures = {
		architectureType: faker.helpers.arrayElement(architectureTypes),
		cooling: faker.datatype.boolean(),
		coolingType: faker.helpers.arrayElement(coolingTypes),
		exteriorType: faker.helpers.arrayElement(exteriorTypes),
		fireplace: faker.datatype.boolean({ probability: 0.6 }),
		fireplaceType: faker.datatype.boolean()
			? faker.helpers.arrayElement(fireplaceTypes)
			: undefined,
		floorCount: faker.number.int({ min: 1, max: 3 }),
		foundationType: faker.helpers.arrayElement(foundationTypes),
		garage: faker.datatype.boolean({ probability: 0.7 }),
		garageSpaces: faker.number.int({ min: 1, max: 3 }),
		garageType: faker.helpers.arrayElement(garageTypes),
		heating: true,
		heatingType: faker.helpers.arrayElement(heatingTypes),
		pool: faker.datatype.boolean({ probability: 0.2 }),
		poolType: faker.datatype.boolean()
			? faker.helpers.arrayElement(poolTypes)
			: undefined,
		roofType: faker.helpers.arrayElement(roofTypes),
		roomCount: faker.number.int({ min: 5, max: 12 }),
		unitCount: faker.number.int({ min: 1, max: 4 }),
		viewType: faker.helpers.arrayElement(viewTypes),
	};

	return features;
};

// Generate mock tax assessments
const generateTaxAssessments = (): Record<string, TaxAssessment> => {
	const currentYear = new Date().getFullYear();
	const assessments: Record<string, TaxAssessment> = {};

	for (let year = currentYear - 5; year <= currentYear; year++) {
		const value = faker.number.int({ min: 200000, max: 1000000 });
		const land = Math.round(value * 0.7);
		const improvements = value - land;

		assessments[year] = {
			year,
			value,
			land,
			improvements,
		};
	}

	return assessments;
};

// Generate mock property taxes
const generatePropertyTaxes = (): Record<string, PropertyTax> => {
	const currentYear = new Date().getFullYear();
	const taxes: Record<string, PropertyTax> = {};

	for (let year = currentYear - 5; year <= currentYear; year++) {
		taxes[year] = {
			year,
			total: faker.number.int({ min: 2000, max: 15000 }),
		};
	}

	return taxes;
};

// Generate mock property history
const generatePropertyHistory = (): Record<string, PropertyHistoryEvent> => {
	const history: Record<string, PropertyHistoryEvent> = {};
	const eventCount = faker.number.int({ min: 1, max: 5 });

	for (let i = 0; i < eventCount; i++) {
		const date = randomDate(new Date(2010, 0, 1), new Date());
		history[date] = {
			event: "Sale",
			date,
			price: faker.number.int({ min: 150000, max: 1000000 }),
		};
	}

	return history;
};

// Generate mock mailing address
const generateMailingAddress = (): MailingAddress => {
	const addressLine1 = faker.location.streetAddress();
	const city = faker.location.city();
	const state = faker.location.state({ abbreviated: true });
	const zipCode = faker.location.zipCode();

	return {
		id: uuidv4(),
		formattedAddress: `${addressLine1}, ${city}, ${state} ${zipCode}`,
		addressLine1,
		city,
		state,
		zipCode,
	};
};

// Generate mock property owner
const generatePropertyOwner = (): PropertyOwner => {
	const ownerType = faker.helpers.arrayElement([
		"Individual",
		"Organization",
	] as const);

	return {
		names:
			ownerType === "Individual"
				? [`${faker.person.firstName()} ${faker.person.lastName()}`]
				: [faker.company.name()],
		type: ownerType,
		mailingAddress: generateMailingAddress(),
	};
};

// Generate a single mock RentCast property
export const generateMockRentCastProperty = (): RentCastProperty => {
	const id = uuidv4();
	const addressLine1 = faker.location.streetAddress();
	const city = faker.location.city();
	const state = faker.location.state({ abbreviated: true });
	const zipCode = faker.location.zipCode();
	const formattedAddress = `${addressLine1}, ${city}, ${state} ${zipCode}`;
	const propertyType = faker.helpers.arrayElement([
		"Single Family",
		"Multi-Family",
		"Condo",
		"Townhouse",
		"Apartment",
	] as const) as RentCastPropertyType;

	const bedrooms = faker.number.int({ min: 1, max: 6 });
	const fullBaths = faker.number.int({ min: 1, max: 4 });
	const hasHalfBath = faker.datatype.boolean();
	const bathrooms = hasHalfBath ? fullBaths + 0.5 : fullBaths;
	const squareFootage = faker.number.int({ min: 800, max: 5000 });
	const lotSize = faker.number.int({ min: 2000, max: 43560 }); // Up to 1 acre
	const yearBuilt = faker.number.int({
		min: 1950,
		max: new Date().getFullYear(),
	});
	const lastSaleDate = randomDate(new Date(2010, 0, 1), new Date());
	const lastSalePrice = faker.number.int({ min: 150000, max: 1000000 });

	const features = generatePropertyFeatures();
	const taxAssessments = generateTaxAssessments();
	const propertyTaxes = generatePropertyTaxes();
	const history = generatePropertyHistory();
	const owner = generatePropertyOwner();

	// Generate metadata
	const metadata: PropertyRentCastMetadata = {
		source: "rentcast",
		lastUpdated: new Date().toISOString(),
		lastSaleDate,
		lastSalePrice,
		assessorID: `ASR-${faker.string.numeric(8)}`,
		legalDescription: `Lot ${faker.number.int({ min: 1, max: 100 })} Block ${faker.number.int({ min: 1, max: 20 })}`,
		subdivision: `${faker.location.county()} Estates`,
		zoning: faker.helpers.arrayElement(["R1", "R2", "R3", "R4", "R5"]),
		ownerOccupied: faker.datatype.boolean({ probability: 0.7 }),
		hoa: faker.datatype.boolean({ probability: 0.5 })
			? { fee: faker.number.int({ min: 100, max: 500 }) }
			: undefined,
		taxAssessments,
		propertyTaxes,
	};

	return {
		id,
		address: {
			street: addressLine1,
			city,
			state,
			zipCode,
			fullStreetLine: formattedAddress,
			latitude: Number(faker.location.latitude()),
			longitude: Number(faker.location.longitude()),
		},
		details: {
			beds: bedrooms,
			fullBaths: Math.floor(bathrooms),
			halfBaths: hasHalfBath ? 1 : 0,
			sqft: squareFootage,
			yearBuilt,
			lotSqft: lotSize,
			propertyType,
			stories: features.floorCount || 1,
			style: features.architectureType || "Other",
			construction: features.exteriorType || "Other",
			roof: features.roofType || "Other",
			parking: features.garage ? `Garage (${features.garageSpaces})` : "None",
		},
		metadata,
		source: "rentcast",
		lastUpdated: new Date().toISOString(),
	};
};

// Generate multiple mock RentCast properties
export const generateMockRentCastProperties = (
	count = 10,
): RentCastProperty[] => {
	return Array.from({ length: count }, generateMockRentCastProperty);
};

// Generate a single mock RentCast property for use with createRentCastProperty
export const generateMockRentCastPropertyForCreation = (): RentCastProperty => {
	return generateMockRentCastProperty();
};

// Generate mock RentCast properties for use with createRentCastProperty
export const generateMockRentCastPropertiesForCreation = (
	count = 10,
): RentCastProperty[] => {
	return Array.from({ length: count }, generateMockRentCastPropertyForCreation);
};

// Guarded mock array export
export const mockRentCastProperties: RentCastProperty[] | false =
	NEXT_PUBLIC_APP_TESTING_MODE && generateMockRentCastProperties(100);
