import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import type {
	PriceHistoryEvent,
	PropertyMedia,
	RealtorProperty,
} from "../../types/_dashboard/realtor_on_market";
import { APP_TESTING_MODE } from "../data";

// Constants
const STATUS_TYPES = ["active", "pending", "sold", "off_market"] as const;
const SCHOOL_TYPES = ["Elementary", "Middle", "High", "Other"] as const;
const SCHOOL_GRADES = ["K-5", "6-8", "9-12", "PK-5", "6-12"] as const;

// Helper functions
const generatePhoneNumber = (): string => faker.phone.number();

const generateAddress = () => ({
	street: faker.location.streetAddress(),
	unit:
		faker.helpers.maybe(
			() =>
				`${faker.helpers.arrayElement(["Apt", "Unit", "#"])} ${faker.string.alphanumeric(3).toUpperCase()}`,
			{ probability: 0.3 },
		) ?? null,
	city: faker.location.city(),
	state: faker.location.state({ abbreviated: true }),
	zipCode: faker.location.zipCode(),
	latitude: Number.parseFloat(
		faker.location.latitude({ min: 32.7, max: 32.9 }).toFixed(6),
	),
	longitude: Number.parseFloat(
		faker.location.longitude({ min: -117.3, max: -117.0 }).toFixed(6),
	),
});

const generateAgent = () => ({
	id: `agent_${uuidv4().substring(0, 8)}`,
	name: faker.person.fullName(),
	email: faker.internet.email(),
	phone: generatePhoneNumber(),
	photoUrl: faker.image.avatar(),
	title: faker.helpers.arrayElement(["Realtor", "Agent", "Broker"]),
	bio: faker.lorem.paragraph(),
	website: faker.internet.url(),
	languages: faker.helpers.arrayElements(
		["English", "Spanish", "Mandarin", "Tagalog"],
		{ min: 1, max: 3 },
	),
});

const generateMlsInfo = (
	status: string,
	listDate: string,
	listPrice: number,
) => ({
	id: `MLS${faker.string.numeric(7)}`,
	mls: faker.helpers.arrayElement(["SDAR", "CRMLS", "CRISNET"]),
	listingId: `L${faker.string.alphanumeric(8).toUpperCase()}`,
	status,
	daysOnMarket: faker.number.int({ min: 1, max: 365 }),
	propertyUrl: faker.internet.url(),
	listDate,
	pendingDate:
		status === "pending"
			? faker.date.between({ from: listDate, to: new Date() }).toISOString()
			: undefined,
	isNewConstruction: faker.datatype.boolean({ probability: 0.2 }),
	originalListPrice: listPrice,
	priceChanges: faker.helpers.maybe(
		() =>
			Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
				date: faker.date
					.between({ from: listDate, to: new Date() })
					.toISOString(),
				price: faker.number.int({
					min: listPrice - 50000,
					max: listPrice + 10000,
				}),
				priceChange: faker.number.int({ min: -50000, max: 10000 }),
			})),
		{ probability: 0.7 },
	),
});
const generateMedia = (): PropertyMedia => {
	const photos = Array.from(
		{ length: faker.number.int({ min: 5, max: 15 }) },
		(_, i) => ({
			url: faker.image.urlLoremFlickr({
				category: "house,interior,kitchen,bathroom,bedroom,backyard",
				width: 800,
				height: 600,
			}),
			caption: faker.helpers.arrayElement([
				"Living Room",
				"Kitchen",
				"Master Bedroom",
				"Bathroom",
				"Backyard",
			]),
			isPrimary: i === 0,
			width: 800,
			height: 600,
		}),
	);

	const virtualTours = faker.helpers.maybe(
		() => [
			{
				type: faker.helpers.arrayElement([
					"Matterport",
					"Video",
					"Other",
				] as const),
				url: faker.internet.url(),
				thumbnail: faker.image.urlLoremFlickr({
					category: "house",
					width: 300,
					height: 200,
				}),
			},
		],
		{ probability: 0.6 },
	);

	return {
		photos,
		virtualTours: virtualTours ? [...virtualTours] : undefined,
	};
};

const generatePriceHistory = (
	listPrice: number,
	listDate: string,
	status: string,
) => {
	const history: Array<{
		date: string;
		price: number;
		event: PriceHistoryEvent;
		priceChange?: number;
		source: string;
	}> = [
		{
			date: listDate,
			price: listPrice,
			event: "Listed" as const,
			source: "MLS",
		},
	];

	if (status === "sold") {
		const pendingDate = faker.date.between({ from: listDate, to: new Date() });
		const soldDate = faker.date.between({ from: pendingDate, to: new Date() });

		history.push(
			{
				date: pendingDate.toISOString(),
				price: listPrice,
				event: "Pending" as const,
				source: "MLS",
			},
			{
				date: soldDate.toISOString(),
				price: listPrice,
				event: "Sold" as const,
				source: "MLS",
			},
		);
	}

	return history;
};

// Main generator function
export const generateMockRealtorProperty = (): RealtorProperty => {
	const id = uuidv4();
	const listPrice = faker.number.int({ min: 300000, max: 3000000 });
	const sqft = faker.number.int({ min: 800, max: 5000 });
	const beds = faker.number.int({ min: 1, max: 6 });
	const fullBaths = faker.number.int({ min: 1, max: Math.max(3, beds - 1) });
	const halfBaths = faker.number.int({ min: 0, max: 2 });
	const status = faker.helpers.arrayElement(STATUS_TYPES);
	const listDate = faker.date.recent({ days: 90 }).toISOString();
	const lastUpdated = faker.date.recent({ days: 3 }).toISOString();
	const address = generateAddress();
	const fullStreetLine = `${address.street}${address.unit ? ` ${address.unit}` : ""}, ${address.city}, ${address.state} ${address.zipCode}`;
	const yearBuilt = faker.number.int({ min: 1950, max: 2023 });
	const stories = faker.number.int({ min: 1, max: 3 });

	return {
		id,
		source: "realtor",
		lastUpdated,
		address: {
			...address,
			fullStreetLine,
		},
		details: {
			beds,
			fullBaths,
			halfBaths: halfBaths || null,
			sqft,
			yearBuilt,
			stories, // Moved inside details
			lotSqft:
				faker.helpers.maybe(() => faker.number.int({ min: 2000, max: 10000 }), {
					probability: 0.7,
				}) ?? null,
			propertyType: faker.helpers.arrayElement([
				"Single Family",
				"Condo",
				"Townhouse",
				"Multi-Family",
				"Other",
			]),
			style: faker.helpers.arrayElement([
				"Traditional",
				"Modern",
				"Mediterranean",
				"Craftsman",
			]),
			construction: faker.helpers.arrayElement([
				"Stucco",
				"Wood",
				"Brick",
				"Stone",
			]),
			roof: faker.helpers.arrayElement([
				"Composition",
				"Tile",
				"Shingle",
				"Flat",
			]),
			parking: faker.helpers.arrayElement([
				"Garage",
				"Carport",
				"Driveway",
				"Street",
			]),
		},

		mls: generateMlsInfo(status, listDate, listPrice),
		showing: {
			appointmentRequired: faker.datatype.boolean(),
			contactName: faker.person.fullName(),
			contactPhone: generatePhoneNumber(),
			contactType: faker.helpers.arrayElement([
				"Listing Agent",
				"Showing Service",
			]),
			instructions: faker.helpers.maybe(() => faker.lorem.sentences(2), {
				probability: 0.7,
			}),
		},
		features: {
			interior: faker.helpers.arrayElements(
				["Hardwood Floors", "Walk-In Closet", "Vaulted Ceilings"],
				3,
			),
			exterior: faker.helpers.arrayElements(["Deck", "Fenced Yard", "Pool"], 2),
			community: faker.helpers.arrayElements(["Pool", "Gym", "Playground"], 2),
			appliances: faker.helpers.arrayElements(
				["Refrigerator", "Dishwasher", "Washer/Dryer"],
				3,
			),
			heatingCooling: ["Central Air", "Forced Air"],
			parking: ["Garage", "Driveway"],
			utilities: ["Water", "Sewer", "Electricity"],
			greenFeatures:
				faker.helpers.maybe(() => ["Solar Panels"], { probability: 0.3 }) || [],
			accessibility: [],
		},

		schools: Array.from({ length: 3 }, (_, i) => ({
			name: `${faker.person.lastName()} ${SCHOOL_TYPES[i % SCHOOL_TYPES.length]} School`,
			type: SCHOOL_TYPES[i % SCHOOL_TYPES.length],
			distance: `${faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 })} mi`,
			rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
			grades: SCHOOL_GRADES[i % SCHOOL_GRADES.length],
		})),
		tax: {
			annualAmount: faker.number.int({ min: 2000, max: 20000 }),
			taxYear: faker.number.int({ min: 2020, max: 2023 }),
			assessment: {
				land: faker.number.int({ min: 50000, max: 500000 }),
				improvements: faker.number.int({ min: 100000, max: 1000000 }),
				total: 0, // Will be calculated
			},
			exemptions:
				faker.helpers.maybe(() => ["Homestead"], { probability: 0.5 }) || [],
		},
		hoa: faker.helpers.maybe(
			() => ({
				fee: faker.number.float({ min: 100, max: 600, fractionDigits: 2 }),
				frequency: faker.helpers.arrayElement([
					"Monthly",
					"Quarterly",
					"Annually",
				]),
				name: `${faker.location.city()} HOA`,
				amenities: ["Pool", "Clubhouse"],
				contact: {
					name: faker.person.fullName(),
					phone: generatePhoneNumber(),
					email: faker.internet.email(),
				},
			}),
			{ probability: 0.6 },
		),
		media: generateMedia(),
		listingAgent: generateAgent(),
		listingOffice: {
			id: `office_${uuidv4().substring(0, 8)}`,
			name: `${faker.company.name()} Real Estate`,
			phone: generatePhoneNumber(),
			email: faker.internet.email(),
			address: generateAddress(),
			website: faker.internet.url(),
		},
		priceHistory: generatePriceHistory(listPrice, listDate, status),
		marketStats: {
			medianDaysOnMarket: faker.number.int({ min: 1, max: 120 }),
			avgPricePerSqft: Math.floor(listPrice / Math.max(sqft, 1)),
			similarHomesForSale: faker.number.int({ min: 5, max: 50 }),
			similarHomesSold: faker.number.int({ min: 10, max: 100 }),
			priceReductionPct: faker.number.float({
				min: 0,
				max: 15,
				fractionDigits: 1,
			}),
		},
	};
};

// Generate multiple properties
export const generateMockRealtorProperties = (
	count: number,
): RealtorProperty[] =>
	Array.from({ length: count }, () => generateMockRealtorProperty());

// Guarded mock array export
export const mockRealtorProperties: RealtorProperty[] | false =
	APP_TESTING_MODE && generateMockRealtorProperties(100);
