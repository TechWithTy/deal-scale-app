import { generateMockRentCastProperty } from "@/constants/dashboard/mockRentCast";
import { REAL_ADDRESSES } from "@/constants/dashboard/realAddresses";
import {
	type RentCastProperty,
	createRentCastProperty,
} from "@/types/_dashboard/property";
import type {
	RentCastListing,
	RentCastListingHistory,
} from "@/types/_dashboard/rentcast_listing";
import { v4 as uuidv4 } from "uuid";

// Minimal state to FIPS mapping for demos (fallback '00')
const STATE_FIPS: Record<string, string> = {
	CA: "06",
	MA: "25",
	NY: "36",
	TX: "48",
	WA: "53",
};
const DEFAULT_COUNTY_FIPS = "001";

// Create a RentCast on-market mock with an Active listing snapshot
export function createOnMarketRentCastMock(): RentCastProperty {
	const base = generateMockRentCastProperty();
	// Select a real address to ensure demo accuracy
	const addr =
		REAL_ADDRESSES[Math.floor(Math.random() * REAL_ADDRESSES.length)];
	const withRealAddress: RentCastProperty = {
		...base,
		address: {
			street: addr.street,
			city: addr.city,
			state: addr.state,
			zipCode: addr.zipCode,
			fullStreetLine: addr.fullStreetLine,
			latitude: addr.latitude,
			longitude: addr.longitude,
			// unit intentionally omitted (optional)
		},
	};

	const listedISO = new Date().toISOString();
	const history: RentCastListingHistory = {
		[listedISO]: {
			event: "Sale Listing",
			price: Math.max(withRealAddress.metadata.lastSalePrice ?? 350000, 250000),
			listingType: "Standard",
			listedDate: listedISO,
			removedDate: null,
			daysOnMarket: null,
		},
	};

	const listing: RentCastListing = {
		id: uuidv4(),
		formattedAddress: withRealAddress.address.fullStreetLine,
		addressLine1: withRealAddress.address.street,
		addressLine2: withRealAddress.address.unit ?? null,
		city: withRealAddress.address.city,
		state: withRealAddress.address.state,
		stateFips: STATE_FIPS[withRealAddress.address.state] || "00",
		zipCode: withRealAddress.address.zipCode,
		county: `${withRealAddress.address.city} County`,
		countyFips: DEFAULT_COUNTY_FIPS,
		latitude: withRealAddress.address.latitude,
		longitude: withRealAddress.address.longitude,
		propertyType: withRealAddress.details.propertyType,
		bedrooms: withRealAddress.details.beds,
		bathrooms:
			(withRealAddress.details.fullBaths ?? 0) +
			(withRealAddress.details.halfBaths ?? 0) * 0.5,
		squareFootage: withRealAddress.details.sqft ?? undefined,
		lotSize: withRealAddress.details.lotSqft ?? undefined,
		yearBuilt: withRealAddress.details.yearBuilt,
		hoa: withRealAddress.metadata.hoa ?? null,
		status: "Active",
		price: Math.max(withRealAddress.metadata.lastSalePrice ?? 350000, 250000),
		listingType: "Standard",
		listedDate: listedISO,
		removedDate: null,
		createdDate: listedISO,
		lastSeenDate: listedISO,
		mlsName: "RentCast MLS",
		mlsNumber: `MLS-${String(Math.floor(Math.random() * 1e7)).padStart(7, "0")}`,
		daysOnMarket: Math.floor(Math.random() * 60) + 5,
		listingAgent: {
			name: "Alex Johnson",
			phone: "5551234567",
			email: "alex.johnson@example.com",
			website: "https://example-agent.com",
		},
		listingOffice: {
			name: "Prime Realty",
			phone: "5559876543",
			email: "contact@primerealty.com",
			website: "https://primerealty.example.com",
		},
		// Occasionally include builder to demonstrate UI
		builder:
			Math.random() < 0.4
				? {
						name: "Sunrise Builders",
						development: "Hillside Estates",
						phone: "5552228899",
						website: "https://sunrisebuilders.example.com",
					}
				: undefined,
		history,
	};

	return createRentCastProperty({
		...withRealAddress,
		listing,
		onMarket: true,
		lastKnownPrice: listing.price,
	});
}

// Create a RentCast off-market mock (no active listing, use last known sale)
export function createOffMarketRentCastMock(): RentCastProperty {
	const base = generateMockRentCastProperty();
	const addr =
		REAL_ADDRESSES[Math.floor(Math.random() * REAL_ADDRESSES.length)];
	const withRealAddress: RentCastProperty = {
		...base,
		address: {
			street: addr.street,
			city: addr.city,
			state: addr.state,
			zipCode: addr.zipCode,
			fullStreetLine: addr.fullStreetLine,
			latitude: addr.latitude,
			longitude: addr.longitude,
		},
	};

	const lastSaleISO =
		withRealAddress.metadata.lastSaleDate ?? new Date().toISOString();
	const removedISO = new Date().toISOString();
	const history: RentCastListingHistory = {
		[lastSaleISO]: {
			event: "Sale Listing",
			price: withRealAddress.metadata.lastSalePrice ?? 0,
			listingType: "Standard",
			listedDate: lastSaleISO,
			removedDate: removedISO,
			daysOnMarket: Math.floor(Math.random() * 15) + 1,
		},
	};

	const listing: RentCastListing = {
		id: uuidv4(),
		formattedAddress: withRealAddress.address.fullStreetLine,
		addressLine1: withRealAddress.address.street,
		addressLine2: withRealAddress.address.unit ?? null,
		city: withRealAddress.address.city,
		state: withRealAddress.address.state,
		zipCode: withRealAddress.address.zipCode,
		county: `${withRealAddress.address.city} County`,
		latitude: withRealAddress.address.latitude,
		longitude: withRealAddress.address.longitude,
		propertyType: withRealAddress.details.propertyType,
		bedrooms: withRealAddress.details.beds,
		bathrooms:
			(withRealAddress.details.fullBaths ?? 0) +
			(withRealAddress.details.halfBaths ?? 0) * 0.5,
		squareFootage: withRealAddress.details.sqft ?? undefined,
		lotSize: withRealAddress.details.lotSqft ?? undefined,
		yearBuilt: withRealAddress.details.yearBuilt,
		hoa: withRealAddress.metadata.hoa ?? null,
		status: "Inactive",
		price: withRealAddress.metadata.lastSalePrice ?? 0,
		listingType: "Standard",
		listedDate: lastSaleISO,
		removedDate: removedISO,
		createdDate: lastSaleISO,
		lastSeenDate: removedISO,
		mlsName: undefined,
		mlsNumber: undefined,
		daysOnMarket: undefined,
		listingAgent: {
			name: "Taylor Brooks",
			phone: "5554455667",
			email: "taylor.brooks@example.com",
			website: "https://example-agent-2.com",
		},
		listingOffice: {
			name: "Metro Realty",
			phone: "5551122334",
			email: "hello@metrorealty.com",
			website: "https://metrorealty.example.com",
		},
		history,
	};

	return createRentCastProperty({
		...withRealAddress,
		listing,
		onMarket: false,
		lastKnownPrice: withRealAddress.metadata.lastSalePrice,
		removedDate: listing.removedDate,
	});
}
