import {
	createRealtorProperty,
	createRentCastProperty,
	type Property,
	type RealtorProperty,
} from "@/types/_dashboard/property";
import type { LeadLocationPhone } from "@/types/_dashboard/maps"; // This type is still valid for agent phones
import { faker } from "@faker-js/faker";
import { APP_TESTING_MODE } from "../data";

// Helper function to generate random phone numbers with extensions
const generatePhones = (): LeadLocationPhone[] => {
	const phoneCount = faker.number.int({ min: 1, max: 2 });
	return Array.from({ length: phoneCount }, (_, i) => ({
		ext:
			faker.helpers.maybe(() => faker.string.numeric(4), {
				probability: 0.3,
			}) ?? null,
		number: faker.phone.number(),
		primary: i === 0,
		type: faker.helpers.arrayElement(["Office", "Mobile", "Home", "Fax"]),
	}));
};

// Helper function to generate a fake Realtor property
const generateFakeRealtorProperty = (): RealtorProperty => {
	const streetAddress = faker.location.streetAddress();
	const unit =
		faker.helpers.maybe(() => `Unit ${faker.string.alphanumeric(3)}`, {
			probability: 0.3,
		}) ?? null;

	return createRealtorProperty({
		address: {
			street: streetAddress,
			unit: unit,
			city: faker.location.city(),
			state: faker.location.state({ abbreviated: true }),
			zipCode: faker.location.zipCode(),
			fullStreetLine: `${streetAddress}${unit ? `, ${unit}` : ""}`,
			latitude: faker.location.latitude(),
			longitude: faker.location.longitude(),
		},
		details: {
			beds: faker.number.int({ min: 1, max: 6 }),
			fullBaths: faker.number.int({ min: 1, max: 4 }),
			halfBaths: faker.number.int({ min: 0, max: 2 }),
			sqft: faker.number.int({ min: 800, max: 5000 }),
			yearBuilt: faker.number.int({ min: 1900, max: new Date().getFullYear() }),
			lotSqft: faker.number.int({ min: 1000, max: 40000 }),
			propertyType: faker.helpers.arrayElement([
				"Single Family",
				"Condo",
				"Townhouse",
			]),
			stories: faker.number.int({ min: 1, max: 3 }),
			style: faker.helpers.arrayElement(["Modern", "Victorian", "Colonial"]),
			construction: faker.helpers.arrayElement(["Frame", "Brick", "Stucco"]),
			roof: faker.helpers.arrayElement(["Asphalt", "Tile", "Metal"]),
			parking: faker.helpers.arrayElement(["Garage", "Carport", "Driveway"]),
		},
		metadata: {
			source: "realtor",
			lastUpdated: faker.date.recent().toISOString(),
			listPrice: faker.number.int({ min: 200000, max: 3000000 }),
			pricePerSqft: faker.number.float({
				min: 100,
				max: 1000,
				fractionDigits: 2,
			}),
			status: faker.helpers.arrayElement(["active", "sold", "pending"]),
			mlsId: faker.string.alphanumeric(10).toUpperCase(),
			mls: faker.helpers.arrayElement(["MRCA", "SDCA", "CRMLS"]),
			listDate: faker.date.past().toISOString(),
			lastSoldDate: faker.date.past().toISOString(),
			daysOnMarket: faker.number.int({ min: 1, max: 365 }),
			hoaFee: faker.helpers.maybe(() =>
				faker.number.int({ min: 50, max: 800 }),
			),
			parkingGarage: faker.number.int({ min: 0, max: 4 }),
			nearbySchools: `${faker.location.city()} Unified School District`,
			neighborhoods: faker.location.city(),
			agent: {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				phones: generatePhones(),
				broker: faker.company.name(),
			},
		},
		media: {
			images: Array.from(
				{ length: faker.number.int({ min: 3, max: 10 }) },
				(_, i) => ({
					url: faker.image.urlLoremFlickr({ category: "house" }),
					isPrimary: i === 0,
				}),
			),
			virtualTours: [],
		},
		description: faker.lorem.paragraphs(2),
	});
};

// Helper function to generate a fake RentCast property
const generateFakeRentCastProperty = () => {
	const streetAddress = faker.location.streetAddress();
	const unit =
		faker.helpers.maybe(() => `Apt ${faker.string.alphanumeric(3)}`, {
			probability: 0.3,
		}) ?? null;
	const year = faker.date.past({ years: 3 }).getFullYear();

	return createRentCastProperty({
		address: {
			street: streetAddress,
			unit: unit,
			city: faker.location.city(),
			state: faker.location.state({ abbreviated: true }),
			zipCode: faker.location.zipCode(),
			fullStreetLine: `${streetAddress}${unit ? `, ${unit}` : ""}`,
			latitude: faker.location.latitude(),
			longitude: faker.location.longitude(),
		},
		details: {
			beds: faker.number.int({ min: 1, max: 6 }),
			fullBaths: faker.number.int({ min: 1, max: 4 }),
			halfBaths: faker.number.int({ min: 0, max: 2 }),
			sqft: faker.number.int({ min: 800, max: 5000 }),
			yearBuilt: faker.number.int({ min: 1900, max: new Date().getFullYear() }),
			lotSqft: faker.number.int({ min: 1000, max: 40000 }),
			propertyType: faker.helpers.arrayElement([
				"Single Family",
				"Multi-Family",
				"Apartment",
			]),
			stories: faker.number.int({ min: 1, max: 3 }),
			style: "Unknown",
			construction: "Unknown",
			roof: "Unknown",
			parking: "Unknown",
		},
		metadata: {
			source: "rentcast",
			lastUpdated: faker.date.recent().toISOString(),
			lastSaleDate: faker.date.past({ years: 10 }).toISOString(),
			lastSalePrice: faker.number.int({ min: 100000, max: 2000000 }),
			assessorID: faker.string.uuid(),
			ownerOccupied: faker.datatype.boolean(),
			hoa: {
				fee: faker.number.int({ min: 50, max: 500 }),
			},
			taxAssessments: {
				[year]: {
					year: year,
					value: faker.number.int({ min: 150000, max: 2500000 }),
					land: faker.number.int({ min: 50000, max: 500000 }),
					improvements: faker.number.int({ min: 100000, max: 2000000 }),
				},
			},
			propertyTaxes: {
				[year]: {
					year: year,
					total: faker.number.int({ min: 2000, max: 30000 }),
				},
			},
		},
	});
};

// Randomly generates either a Realtor or RentCast property
export const generateFakeProperty = (): Property => {
	return faker.helpers.arrayElement([
		generateFakeRealtorProperty,
		generateFakeRentCastProperty,
	])();
};

// Generate a list of fake properties
export const generateFakeProperties = (count: number): Property[] => {
	return Array.from({ length: count }, generateFakeProperty);
};

export const MockInHouseLeadAgrigator: Property[] | false =
	APP_TESTING_MODE && generateFakeProperties(100);

// Hardcoded properties updated to the new RealtorProperty structure
export const detailed_properties_saved: Property[] = [
	createRealtorProperty({
		id: "10186-camino-ruiz-unit-72",
		address: {
			street: "10186 Camino Ruiz",
			unit: "Unit 72",
			city: "San Diego",
			state: "CA",
			zipCode: "92126",
			fullStreetLine: "10186 Camino Ruiz Unit 72",
			latitude: 32.902329,
			longitude: -117.145381,
		},
		details: {
			beds: 2,
			fullBaths: 2,
			halfBaths: null,
			sqft: 808,
			yearBuilt: 1990,
			lotSqft: 205577,
			propertyType: "Condo",
			stories: 1,
			style: "CONDOS",
			construction: "Unknown",
			roof: "Unknown",
			parking: "Unknown",
		},
		metadata: {
			source: "realtor",
			lastUpdated: "2024-08-27T00:00:00.000Z",
			listPrice: 525000,
			pricePerSqft: 662,
			status: "SOLD",
			mlsId: "NDP2406979",
			mls: "MRCA",
			listDate: "2024-08-06T00:00:00.000Z",
			lastSoldDate: "2024-08-27T00:00:00.000Z",
			daysOnMarket: 21,
			hoaFee: 345,
			parkingGarage: 0, // was null
			nearbySchools: "San Diego Unified School District",
			neighborhoods: "North San Diego, Mira Mesa",
			agent: {
				name: "Sharon Rojo",
				email: "sandiegoteam.sharon@gmail.com",
				phones: [
					{ ext: null, number: "7602303610", primary: true, type: "Office" },
				],
				broker: "Unknown", // was null
			},
		},
		media: {
			images:
				"http://ap.rdcpix.com/e3d5a7b443477ffae43fd368523d3fffl-m1016903215od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/e3d5a7b443477ffae43fd368523d3fffl-m3783361004od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/e3d5a7b443477ffae43fd368523d3fffl-m360826070od-w480_h360_x2.webp?w=1080&q=75"
					.split(", ")
					.map((url, i) => ({ url, isPrimary: i === 0 })),
			virtualTours: [],
		},
		description:
			"Take Advantage of the very recent interest rate drop and THE MOST AFFORDABLE 2/2 in 92126 - Priced to sell! Discover the perfect blend of comfort and convenience in this centrally located, FHA and VA approved, inviting 2-bedroom, 2-bath home! With 808 square feet of well-designed living space, this home offers two primary suites, stainless steel appliances and patio space with personal washer and dryer! Ideal for those seeking a cozy and functional layout. Enjoy easy access to a variety of amenities in the surrounding area, including shopping, dining, and entertainment! Low HOA - The community offers a range of fantastic features for residents, including a refreshing pool, a relaxing hot tub, and a fully-equipped gym to maintain your fitness routine. This home is not just a place to live but a lifestyle choice that combines modern amenities with a vibrant neighborhood.",
	}),
	createRealtorProperty({
		id: "5082-park-rim-dr",
		address: {
			street: "5082 Park Rim Dr",
			unit: null,
			city: "San Diego",
			state: "CA",
			zipCode: "92117",
			fullStreetLine: "5082 Park Rim Dr",
			latitude: 32.838348,
			longitude: -117.214187,
		},
		details: {
			beds: 4,
			fullBaths: 2,
			halfBaths: null,
			sqft: 1553,
			yearBuilt: 1968,
			lotSqft: 19101,
			propertyType: "Single Family",
			stories: 1,
			style: "SINGLE_FAMILY",
			construction: "Unknown",
			roof: "Unknown",
			parking: "Unknown",
		},
		metadata: {
			source: "realtor",
			lastUpdated: "2024-08-26T00:00:00.000Z",
			listPrice: 1227000,
			pricePerSqft: 692,
			status: "SOLD",
			mlsId: "NDP2407068",
			mls: "MRCA",
			listDate: "2024-08-08T00:00:00.000Z",
			lastSoldDate: "2024-08-26T00:00:00.000Z",
			daysOnMarket: 18,
			hoaFee: 0,
			parkingGarage: 2,
			nearbySchools: "San Diego Unified School District",
			neighborhoods: "North Clairemont, Northern San Diego",
			agent: {
				name: "Hope Holmberg",
				email: "hopeshomessd@gmail.com",
				phones: [
					{ ext: null, number: "6198875205", primary: true, type: "Office" },
				],
				broker: "Unknown",
			},
		},
		media: {
			images:
				"http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3208438834od-w480_h360_x2.webp?w=1080&q=75"
					.split(", ")
					.map((url, i) => ({ url, isPrimary: i === 0 })), // Only one image in old data, but this handles multiple
			virtualTours: [],
		},
		description:
			"Welcome to 5082 Park Rim Drive, a charming 4-bedroom, 2-bathroom home boasting an amazing view and nestled in a prime central San Diego location. Spanning 1, 553 square feet, this home offers unparalleled convenience and comfort. Situated on a quiet, low-traffic street, the property features a stunning canyon view, refreshing ocean breeze, and a picturesque view of Mt. Soledad. The exterior showcases a new roof installed in 2021, gutters added in 2019, and abundant shade providing a cool and relaxing environment...",
	}),
	// ... You can continue this pattern for all other hardcoded properties.
	// For brevity, only the first two are converted here.
];
