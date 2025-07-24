import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import { createRealtorProperty } from "@/types/_dashboard/property";
import { generateMockRealtorProperty } from "./mockRealtor";

// Types for property-related data
interface AgentPhone {
	ext: string | null;
	number: string;
	primary: boolean;
	type: "Office" | "Mobile" | "Home" | "Fax" | "Other";
}

interface PropertyImage {
	url: string;
	isPrimary: boolean;
	label?: string;
}

// Constants for property generation
const PROPERTY_TYPES = [
	"SINGLE_FAMILY",
	"MULTI_FAMILY",
	"CONDO",
	"TOWNHOUSE",
	"APARTMENT",
] as const;
const PROPERTY_STYLES = [
	"Modern",
	"Victorian",
	"Colonial",
	"Contemporary",
	"Craftsman",
	"Ranch",
	"Tudor",
] as const;
const STATUS_TYPES = ["active", "pending", "sold", "off_market"] as const;
const SCHOOL_DISTRICTS = [
	"San Diego Unified School District",
	"Poway Unified School District",
	"San Dieguito Union High School District",
	"Del Mar Union Elementary School District",
	"La Jolla Country Day School District",
] as const;

// Helper functions for generating mock data
const generatePhoneNumber = (): string => faker.phone.number();

// Helper function to format phone number with extension
const formatPhoneWithExtension = (
	phone: string,
	ext?: string | null,
): string => {
	return ext ? `${phone} x${ext}` : phone;
};

const generateAgentPhones = (): AgentPhone[] => [
	{
		ext:
			faker.helpers.maybe(() => faker.string.numeric(4), {
				probability: 0.3,
			}) ?? null,
		number: generatePhoneNumber(),
		primary: true,
		type: faker.helpers.arrayElement(["Office", "Mobile", "Home", "Fax"]),
	},
	{
		ext:
			faker.helpers.maybe(() => faker.string.numeric(4), {
				probability: 0.2,
			}) ?? null,
		number: generatePhoneNumber(),
		primary: false,
		type: faker.helpers.arrayElement(["Mobile", "Home"]),
	},
];

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

const generateAddress = () => {
	const street = faker.location.streetAddress();
	const unit = faker.helpers.maybe(
		() =>
			`${faker.helpers.arrayElement(["Apt", "Unit", "#"])} ${faker.string.alphanumeric(3).toUpperCase()}`,
		{ probability: 0.3 },
	);

	const city = faker.location.city();
	const state = faker.location.state({ abbreviated: true });
	const zipCode = faker.location.zipCode();

	return {
		street,
		unit: unit || null,
		city,
		state,
		zipCode,
		fullStreetLine: unit ? `${street} ${unit}` : street,
		latitude: parseFloat(
			faker.location.latitude({ min: 32.7, max: 32.9 }).toFixed(6),
		),
		longitude: parseFloat(
			faker.location.longitude({ min: -117.3, max: -117.0 }).toFixed(6),
		),
	};
};

type MockProperty = ReturnType<typeof generateMockProperty>;

/**
 * Generates a single mock property with realistic real estate data
 */
const generateMockProperty = () => {
	// Generate a mock realtor property
	const realtorProperty = generateMockRealtorProperty();

	// Map the realtor property to our property structure
	const property = createRealtorProperty({
		id: uuidv4(),
		address: {
			street: realtorProperty.address.street,
			city: realtorProperty.address.city,
			state: realtorProperty.address.state,
			zipCode: realtorProperty.address.zipCode,
			fullStreetLine: `${realtorProperty.address.street}, ${realtorProperty.address.city}, ${realtorProperty.address.state} ${realtorProperty.address.zipCode}`,
			latitude: faker.location.latitude(),
			longitude: faker.location.longitude(),
		},
		details: {
			beds: realtorProperty.details.beds,
			fullBaths: realtorProperty.details.fullBaths,
			halfBaths: realtorProperty.details.halfBaths,
			sqft: realtorProperty.details.sqft,
			yearBuilt: realtorProperty.details.yearBuilt,
			lotSqft: realtorProperty.details.lotSqft,
			propertyType: realtorProperty.details.propertyType.toUpperCase(),
			stories: realtorProperty.details.stories,
			style: realtorProperty.details.style,
			construction: realtorProperty.details.construction,
			roof: realtorProperty.details.roof,
			parking: realtorProperty.details.parking,
		},
		metadata: {
			source: "realtor", // Required by PropertyRealtorMetadata
			lastUpdated: new Date().toISOString(),
			listPrice: realtorProperty.mls.originalListPrice,
			pricePerSqft: Math.round(
				(realtorProperty.mls.originalListPrice || 0) /
					(realtorProperty.details.sqft || 1),
			),
			status: realtorProperty.mls.status,
			mlsId: realtorProperty.mls.id,
			mls: realtorProperty.mls.mls,
			listDate: realtorProperty.mls.listDate,
			lastSoldDate: faker.date.past({ years: 5 }).toISOString(),
			daysOnMarket: realtorProperty.mls.daysOnMarket,
			hoaFee: realtorProperty.hoa?.fee,
			parkingGarage: realtorProperty.details.parking.includes("Garage") ? 1 : 0,
			nearbySchools:
				realtorProperty.schools?.[0]?.name ||
				"San Diego Unified School District",
			neighborhoods: [
				realtorProperty.address.city,
				realtorProperty.address.state,
			].join(", "),
			// Added agent and broker info to metadata
			agent: {
				name: realtorProperty.showing.contactName || "Agent Name",
				email: faker.internet.email(),
				phones: [
					{
						number:
							realtorProperty.showing.contactPhone || faker.phone.number(),
						primary: true,
						type: "Mobile",
						ext: null,
					},
				],
				broker: faker.company.name(),
			},
		},

		media: {
			images:
				realtorProperty.media?.photos?.map((photo) => ({
					url: photo.url,
					isPrimary: photo.isPrimary,
					label: photo.caption,
				})) || [],
			virtualTours:
				realtorProperty.media?.virtualTours?.map((tour) => ({
					url: tour.url,
					type: tour.type.toLowerCase(),
					thumbnail: tour.thumbnail,
				})) || [],
		},
		description: faker.lorem.paragraphs(3, "\n\n"),
		lastUpdated: new Date().toISOString(),
	});
	return property;
};

/**
 * Generates an array of mock properties
 * @param count Number of properties to generate (default: 10)
 * @returns Array of mock properties
 */
const generateMockProperties = (count: number = 10): MockProperty[] => {
	return Array.from({ length: count }, () => generateMockProperty());
};

export {
	generateMockProperty,
	generateMockProperties,
	type MockProperty,
	type AgentPhone,
	type PropertyImage,
};
