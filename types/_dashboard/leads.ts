export type LeadStatus = "New Lead" | "Contacted" | "Closed" | "Lost";

export type SocialLinks = {
	facebook: string;
	linkedin: string;
	instagram: string;
	twitter: string;
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
};

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
};
