// RentCast Listing Types based on Property Listings | RentCast API docs
// These types model both sale and rental listing records

export type RentCastListingStatus = "Active" | "Inactive";
export type RentCastListingType =
	| "Standard"
	| "New Construction"
	| "Foreclosure"
	| "Short Sale";

export interface RentCastListingAgent {
	name?: string;
	phone?: string; // 10 digits
	email?: string;
	website?: string;
}

export interface RentCastListingOffice {
	name?: string;
	phone?: string;
	email?: string;
	website?: string;
}

export interface RentCastListingHistoryEntry {
	event: "Sale Listing" | "Rental Listing";
	price: number;
	listingType: RentCastListingType;
	listedDate: string | null; // ISO
	removedDate: string | null; // ISO
	daysOnMarket: number | null;
}

// History is keyed by YYYY-MM-DD
export type RentCastListingHistory = Record<
	string,
	RentCastListingHistoryEntry
>;

export interface RentCastListing {
	id: string;
	formattedAddress: string;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string; // 2-char
	stateFips?: string; // 2-digit
	zipCode: string; // 5-digit
	county: string;
	countyFips?: string; // 3-digit
	latitude: number;
	longitude: number;

	propertyType: string; // e.g. "Single Family"
	bedrooms?: number;
	bathrooms?: number; // can be decimal like 2.5
	squareFootage?: number;
	lotSize?: number;
	yearBuilt?: number;

	hoa?: { fee?: number } | null;

	status: RentCastListingStatus; // Active | Inactive
	price: number; // listed price or rent
	listingType: RentCastListingType;

	listedDate: string | null; // ISO
	removedDate: string | null; // ISO
	createdDate?: string; // ISO first seen
	lastSeenDate?: string; // ISO last seen active
	daysOnMarket?: number;

	mlsName?: string;
	mlsNumber?: string;

	listingAgent?: RentCastListingAgent;
	listingOffice?: RentCastListingOffice;

	// Only present for new construction listings
	builder?: {
		name?: string;
		development?: string;
		phone?: string;
		website?: string;
	};

	history?: RentCastListingHistory;
}

export interface OnMarketResult {
	on_market: boolean;
	last_known_price?: number;
	removed_date?: string | null;
	reason?: string;
}
