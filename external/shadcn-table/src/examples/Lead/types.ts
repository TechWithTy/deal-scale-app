import type { LeadTypeGlobal } from "../../../../../types/_dashboard/leads";

export type SocialLink = { label: string; url: string };
export type SocialHandle = { platform: string; username: string; url?: string };
export type ActivityEvent = {
	ts: string; // ISO timestamp
	kind: "call" | "email" | "social" | "note";
	summary: string;
};

// Use LeadTypeGlobal as the base, with additional demo-specific fields
export type DemoLead = Omit<LeadTypeGlobal, "socials"> & {
	// Override socials to support both array format (for LeadRowCarouselPanel) and object format
	socials?: SocialLink[] | LeadTypeGlobal["socials"];
	// Compatibility fields for existing LeadRowCarouselPanel component
	name?: string;
	address?: string;
	email?: string;
	phone?: string;
	// Demo-specific fields
	possiblePhones?: string[];
	possibleEmails?: string[];
	possibleHandles?: SocialHandle[];
	activity?: ActivityEvent[];
	phoneVerified?: boolean;
	emailVerified?: boolean;
	socialVerified?: boolean;
	associatedAddress?: string;
	addressVerified?: boolean;
};

export type DemoRow = {
	id: string;
	list: string;
	uploadDate: string;
	records: number;
	phone: number;
	emails: number;
	socials: number;
	leads: DemoLead[];
};
