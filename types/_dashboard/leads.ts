import type { RealtorOnMarketProperty } from "./realtor_com";
import type { RentCastOffMarketProperty } from "./rentcast";

export type LeadStatus =
	| "New Lead"
	| "Contacted"
	| "Qualified"
	| "Proposal Sent"
	| "Negotiation"
	| "Closed Won"
	| "Closed Lost"
	| "Nurture";

export type LeadSource =
	| "Website"
	| "Referral"
	| "Cold Call"
	| "Social Media"
	| "Email Campaign"
	| "Events"
	| "Direct Mail"
	| "Paid Ads"
	| "Other";

export type CommunicationPreference = "Email" | "Phone" | "Text" | "Mail";

export type SocialLinks = {
	facebook?: string;
	linkedin?: string;
	instagram?: string;
	twitter?: string;
	zillow?: string;
	redfin?: string;
	realtor?: string;
};

export type LeadAddress = {
	street: string;
	street2?: string;
	city: string;
	state: string;
	zipCode: string;
	county?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	fullAddress?: string;
};

export type LeadProperty = {
	// Basic property info
	id: string;
	address: LeadAddress;
	propertyType?: string;
	yearBuilt?: number;
	lotSize?: number; // in square feet
	livingArea?: number; // in square feet
	bedrooms?: number;
	bathrooms?: number;

	// Property features from RentCast

	// Ownership details
	isOwnerOccupied?: boolean;
	currentOwner?: {
		name: string;
		phone?: string;
		email?: string;
		mailingAddress?: LeadAddress;
	};

	// Financials
	estimatedValue?: number;
	lastSalePrice?: number;
	lastSaleDate?: string; // ISO date string
	estimatedRent?: number;
	estimatedTaxes?: number;
	hoaFee?: number;

	// Additional metadata
	mlsNumber?: string;
	parcelId?: string;
	notes?: string;

	// Raw RentCast data if available
	rentCastOffMarketData?: RentCastOffMarketProperty;
	realtorOnMarketData?: RealtorOnMarketProperty;
};

export type LeadActivity = {
	id: string;
	type: "Call" | "Email" | "Meeting" | "Note" | "SMS" | "Task" | "Other";
	timestamp: string; // ISO date string
	title: string;
	description?: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	metadata?: Record<string, unknown>;
};

export type LeadTypeGlobal = {
	// Core lead information
	id: string;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string

	// Contact information
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
	alternatePhone?: string;
	company?: string;
	title?: string;
	preferredContactMethod?: CommunicationPreference[];
	doNotContact?: boolean;
	summary?: string;
	// Lead details
	status: LeadStatus;
	source: LeadSource;
	sourceDetails?: string;
	assignedTo?: {
		id: string;
		name: string;
		email: string;
	};

	// Property information
	properties: LeadProperty[];
	preferredPropertyTypes?: string[];
	preferredLocations?: string[];
	budgetRange?: {
		min?: number;
		max?: number;
	};

	// Timeline
	lastContacted?: string; // ISO date string
	followUpDate?: string; // ISO date string

	// Communication history
	activities: LeadActivity[];

	// Notes and tags
	notes?: string;
	tags: string[];

	// Social and online presence
	socialLinks?: SocialLinks;

	// Additional metadata
	customFields?: Record<string, unknown>;
	metadata?: {
		ipAddress?: string;
		userAgent?: string;
		campaign?: {
			name?: string;
			source?: string;
			medium?: string;
			term?: string;
			content?: string;
			id?: string; // campaignID moved here
		};
		// Legacy fields for backward compatibility
		lastUpdate?: string; // Last update timestamp
		address1?: string; // Address of the lead (deprecated, use properties[0].address instead)
	};
};
