export type LeadStatus = "New Lead" | "Contacted" | "Closed" | "Lost";

export type SocialLinks = {
	facebook: string;
	linkedin: string;
	instagram: string;
	twitter: string;
	tiktok: string;
	youtube: string;
};

export type Address = {
	fullStreetLine: string;
	city: string;
	state: string;
	zipCode: string;
};

export type ContactInfo = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	// Optional pre-validated or known good phone number
	knownPhone?: string;
	address: string;
	domain: string;
	// Generic social tag/handle (e.g., @username)
	social: string;
	// Additional contact verification
	emailVerified?: boolean;
	socialVerified?: boolean;
	// Possible alternative contact information
	possiblePhones?: string;
	possibleEmails?: string;
};

// LeadTypeGlobal - Single source of truth for lead data structure
// SYNC REQUIREMENT: Keep FieldMappingStep.tsx fieldConfigs in sync with this type
// Required fields: firstName, lastName, streetAddress, city, state, dncStatus, tcpaOptedIn
// Conditional fields: dncSource (required if dncList is true), tcpaSource (required if tcpaOptedIn is true)
// All other fields are optional for CSV mapping
export type LeadTypeGlobal = {
	id: string; // Unique identifier for the lead

	contactInfo: ContactInfo;

	summary: string; // Summary of the interaction or lead
	bed: number; // Number of bedrooms in the property
	bath: number; // Number of bathrooms in the property
	sqft: number; // Square footage of the property
	status: LeadStatus; // Lead status (e.g., "New Lead", "Contacted", "Closed", "Lost")
	followUp: string | null; // Follow-up date (can be null if none is set)
	lastUpdate: string; // Last update timestamp
	address1: Address; // Address of the lead (optional)
	campaignID?: string;
	// Social media links
	socials?: SocialLinks;
	// Additional social data
	socialHandle?: string; // e.g., @username
	socialSummary?: string; // short blurb/notes about social presence
	// Device/phone details
	isIphone?: boolean;
	// Preferred channels, e.g. ["sms", "email", "call"]
	communicationPreferences?: string[];
	// Optional Do Not Call list flag
	dncList?: boolean;
	/** Optional explicit DNC source label (e.g., "Text Opt-out", "Email Unsubscribe") */
	dncSource?: string;
	/** Channel-specific opt-out flags to infer DNC Source when label is not present */
	smsOptOut?: boolean;
	emailOptOut?: boolean;
	callOptOut?: boolean;
	dmOptOut?: boolean;
	/** TCPA (Telephone Consumer Protection Act) compliance - whether lead has opted in */
	tcpaOptedIn?: boolean;
	/** Timestamp when TCPA consent was obtained */
	tcpaConsentDate?: string;
	tcpaSource?: string;
	// Property information
	propertyValue?: number;
	yearBuilt?: number;
	// Lead metadata
	leadSource?: string;
	notes?: string;
	tags?: string;
	priority?: string;
	// Professional information
	company?: string;
	jobTitle?: string;
	domain?: string;
	birthday?: string;
	anniversary?: string;
};

// Lead List Types
export type SocialsCount = {
	facebook?: number; // Number of Facebook accounts in the list
	linkedin?: number; // Number of LinkedIn accounts in the list
	instagram?: number; // Number of Instagram accounts in the list
	twitter?: number; // Number of Twitter accounts in the list
	tiktok?: number; // Number of TikTok accounts in the list
	youtube?: number; // Number of YouTube accounts in the list
};

export type LeadList = {
	id: string; // Unique identifier for the lead list
	listName: string; // Name of the list
	uploadDate: string; // Date when the list was uploaded
	leads: LeadTypeGlobal[];
	records: number; // Number of records in the list
	phone: number; // Number of phone numbers in the list
	dataLink: string; // Where the list is stored
	socials: SocialsCount; // Social media account counts
	emails: number; // Number of email addresses in the list
};

// Contact Field Types (for field mapping)
export type ContactFieldType =
	| "firstName"
	| "lastName"
	| "address"
	| "email"
	| "phone"
	| "social"
	| "domain";

export interface ContactField {
	id: string;
	type: ContactFieldType;
	value: string;
	label: string;
}
