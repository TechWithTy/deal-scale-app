// Lead Property Types

export interface PropertyBasicInfo {
	property_url: string;
	property_id: string;
	listing_id: string;
	mls: string;
	mls_id: string;
	status: string;
}
export interface PropertyMedia {
	photos: Array<{
		url: string;
		caption?: string;
		isPrimary: boolean;
		width: number;
		height: number;
	}>;
	virtualTours?: Array<{
		type: "Matterport" | "Video" | "Other";
		url: string;
		thumbnail: string;
	}>;
	floorPlans?: Array<{
		url: string;
		level: string;
		sqft: number;
		beds: number;
		baths: number;
	}>;
}
export interface PropertyAddressDetails {
	street: string;
	unit?: string | null;
	city: string;
	state: string;
	zip_code: string;
}

export interface PropertyDescription {
	style: string;
	beds: number;
	full_baths: number;
	half_baths?: number | null;
	sqft?: number | null;
	year_built: number;
	stories: number;
	garage?: number | null;
	lot_sqft?: number | null;
}

export interface PropertyListingDetails {
	days_on_mls: number;
	list_price: number;
	list_price_min?: number | null;
	list_price_max?: number | null;
	list_date: string;
	pending_date?: string | null;
	sold_price?: number | null;
	last_sold_date?: string | null;
	price_per_sqft?: number | null;
	new_construction?: boolean;
	hoa_fee?: number | null;
}

export interface PropertyTaxAssessment {
	building?: number | null;
	land?: number | null;
	total: number;
}

export interface PropertyTaxInfo {
	year: number;
	tax: number;
	assessment: PropertyTaxAssessment;
}
export type PriceHistoryEvent =
	| "Listed"
	| "Pending"
	| "Sold"
	| "Price Change"
	| "Delisted";
export interface PropertyLocationDetails {
	latitude: number;
	longitude: number;
	nearby_schools?: string | null;
}

export interface PropertyAgentInfo {
	agent_id: string;
	agent_name: string;
	agent_email: string;
	agent_phone: string;
}

export interface PropertyBrokerInfo {
	broker_id: string;
	broker_name: string;
}

export interface PropertyBuilderInfo {
	builder_id: string;
	builder_name: string;
}

export interface PropertyOfficeInfo {
	office_id: string;
	office_name: string;
	office_phones: string[];
	office_email: string;
}

export interface RealtorOnMarketProperty {
	basic: PropertyBasicInfo;
	address: PropertyAddressDetails;
	description: PropertyDescription;
	listing: PropertyListingDetails;
	tax?: PropertyTaxInfo;
	location: PropertyLocationDetails;
	agent: PropertyAgentInfo;
	broker?: PropertyBrokerInfo;
	builder?: PropertyBuilderInfo;
	office?: PropertyOfficeInfo;
}

import type { BaseProperty } from "./property";

/**
 * MLS (Multiple Listing Service) specific information for on-market properties
 */
export interface MlsInfo {
	/** Unique MLS identifier */
	id: string;
	/** MLS system name (e.g., 'SDMLS', 'CRMLS') */
	mls: string;
	/** MLS listing ID */
	listingId: string;
	/** Current listing status (e.g., 'Active', 'Pending', 'Sold') */
	status: string;
	/** Number of days the property has been on market */
	daysOnMarket: number;
	/** URL to the property listing */
	propertyUrl: string;
	/** Date the property was listed */
	listDate: string;
	/** Date the property went pending (if applicable) */
	pendingDate?: string | null;
	/** Whether the property is new construction */
	isNewConstruction: boolean;
	/** Original listing price */
	originalListPrice: number;
	/** Price changes history */
	priceChanges?: Array<{
		date: string;
		price: number;
		priceChange: number;
	}>;
	/** Showing instructions */
	showingInstructions?: string;
	/** Special listing conditions */
	specialListingConditions?: string[];
	/** Virtual tour URL */
	virtualTourUrl?: string;
	/** Documents available for the listing */
	documents?: Array<{
		type: string;
		url: string;
		name: string;
	}>;
}

/**
 * Showing and appointment information
 */
export interface ShowingInfo {
	/** Whether the property requires an appointment */
	appointmentRequired: boolean;
	/** Showing contact name */
	contactName?: string;
	/** Showing contact phone */
	contactPhone?: string;
	/** Showing contact type (e.g., 'Listing Agent', 'Office') */
	contactType?: string;
	/** Showing instructions */
	instructions?: string;
	/** Available showing times */
	availableTimes?: Array<{
		date: string;
		slots: string[];
	}>;
}

/**
 * Open house information
 */
export interface OpenHouse {
	/** Start date and time */
	start: string;
	/** End date and time */
	end: string;
	/** Whether it's a virtual open house */
	isVirtual: boolean;
	/** Virtual open house URL if applicable */
	virtualUrl?: string;
	/** Host name */
	hostName?: string;
	/** Host phone */
	hostPhone?: string;
	/** Host email */
	hostEmail?: string;
	/** Special instructions */
	instructions?: string;
}

/**
 * Realtor-specific property information for on-market properties
 */
export interface RealtorProperty extends BaseProperty {
	/** Source is always 'realtor' for on-market properties */
	source: "realtor";

	/** MLS information */
	mls: MlsInfo;

	/** Showing information */
	showing: ShowingInfo;

	/** Open house schedule */
	openHouses?: OpenHouse[];

	/** Property features and amenities */
	features: {
		/** Interior features */
		interior: string[];
		/** Exterior features */
		exterior: string[];
		/** Community features */
		community: string[];
		/** Appliances included */
		appliances: string[];
		/** Heating and cooling */
		heatingCooling: string[];
		/** Parking information */
		parking: string[];
		/** Utilities included */
		utilities: string[];
		/** Green/energy efficient features */
		greenFeatures: string[];
		/** Accessibility features */
		accessibility: string[];
	};

	/** School information */
	schools: Array<{
		name: string;
		type: "Elementary" | "Middle" | "High" | "Other";
		distance: string;
		rating?: number;
		grades?: string;
	}>;

	/** Tax information */
	tax: {
		/** Annual property tax amount */
		annualAmount: number;
		/** Tax year */
		taxYear: number;
		/** Tax assessment */
		assessment: {
			land: number;
			improvements: number;
			total: number;
		};
		/** Tax exemptions */
		exemptions: string[];
	};

	/** HOA (Homeowners Association) information */
	hoa?: {
		/** HOA fee amount */
		fee: number;
		/** Payment frequency (e.g., 'Monthly', 'Quarterly') */
		frequency: string;
		/** HOA name */
		name: string;
		/** HOA contact information */
		contact?: {
			name: string;
			phone: string;
			email: string;
		};
		/** HOA amenities */
		amenities: string[];
		/** HOA rules and restrictions */
		rules?: string[];
	};

	/** Media (photos, videos, 3D tours) */
	media: {
		/** Property photos */
		photos: Array<{
			url: string;
			caption?: string;
			isPrimary: boolean;
			width: number;
			height: number;
		}>;
		/** Virtual tours */
		virtualTours?: Array<{
			type: "Matterport" | "Video" | "Other";
			url: string;
			thumbnail: string;
		}>;
		/** Floor plans */
		floorPlans?: Array<{
			url: string;
			level: string;
			sqft: number;
			beds: number;
			baths: number;
		}>;
	};

	/** Listing agent information */
	listingAgent: {
		/** Agent ID */
		id: string;
		/** Agent name */
		name: string;
		/** Agent email */
		email: string;
		/** Agent phone */
		phone: string;
		/** Agent photo URL */
		photoUrl?: string;
		/** Agent title/position */
		title?: string;
		/** Agent bio */
		bio?: string;
		/** Agent website */
		website?: string;
		/** Agent languages */
		languages?: string[];
	};

	/** Listing office information */
	listingOffice: {
		/** Office ID */
		id: string;
		/** Office name */
		name: string;
		/** Office phone */
		phone: string;
		/** Office email */
		email: string;
		/** Office address */
		address: {
			street: string;
			city: string;
			state: string;
			zipCode: string;
		};
		/** Office logo URL */
		logoUrl?: string;
		/** Office website */
		website?: string;
	};

	/** Price history */
	priceHistory: Array<{
		date: string;
		price: number;
		event: "Listed" | "Price Change" | "Sold" | "Pending" | "Delisted";
		priceChange?: number;
		source: string;
	}>;

	/** Comparable properties */
	comparables?: Array<{
		id: string;
		address: string;
		price: number;
		sqft: number;
		beds: number;
		baths: number;
		distance: number;
		yearBuilt: number;
		lastSoldDate: string;
		lastSoldPrice: number;
	}>;

	/** Market statistics */
	marketStats: {
		/** Median days on market for similar properties */
		medianDaysOnMarket: number;
		/** Average price per square foot for similar properties */
		avgPricePerSqft: number;
		/** Number of similar properties for sale */
		similarHomesForSale: number;
		/** Number of similar properties sold recently */
		similarHomesSold: number;
		/** Price reduction percentage */
		priceReductionPct: number;
	};
}
