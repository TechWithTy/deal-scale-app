export type LeadStatus = "New Lead" | "Contacted" | "Closed" | "Lost";

export type SocialLinks = {
	facebook: string;
	linkedin: string;
	instagram: string;
	twitter: string;
};

export type LeadTypeGlobal = {
	id: string; // Unique identifier for the lead
	firstName: string; // First name of the lead
	lastName: string; // Last name of the lead
	email: string;
	phone: string; // Phone number
	summary: string; // Summary of the interaction or lead
	bed: number; // Number of bedrooms in the property
	bath: number; // Number of bathrooms in the property
	sqft: number; // Square footage of the property
	status: LeadStatus; // Lead status (e.g., "New Lead", "Contacted", "Closed", "Lost")
	followUp: string | null; // Follow-up date (can be null if none is set)
	lastUpdate: string; // Last update timestamp
	address1: string; // Address of the lead (optional)
	campaignID?: string;
	socials?: SocialLinks; // Social media links
};
