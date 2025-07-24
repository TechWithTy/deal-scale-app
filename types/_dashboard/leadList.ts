import type { LeadTypeGlobal } from "./leads";

export type LeadList = {
	id: number; // Unique identifier for the lead list
	listName: string; // Name of the list
	uploadDate: string; // Date when the list was uploaded
	leads: LeadTypeGlobal[];
	records: number; // Number of records in the list
	phone: number; // Number of phone numbers in the list
	dataLink: string; // Where the list is stored
	socials: SocialsCount; // Social media account counts
	emails: number; // Number of email addresses in the list
};

export type SocialsCount = {
	facebook?: number; // Number of Facebook accounts in the list
	linkedin?: number; // Number of LinkedIn accounts in the list
	instagram?: number; // Number of Instagram accounts in the list
	twitter?: number; // Number of Twitter accounts in the list
};
