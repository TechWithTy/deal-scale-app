import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import type { NavItem } from "@/types";
import type {
	Address,
	ContactInfo,
	LeadStatus,
	LeadTypeGlobal,
	SocialLinks,
} from "@/types/_dashboard/leads";

//
// Configuration
// =====================================================================
//

// Resolve testing mode from env (Next.js runtime)
export const NEXT_PUBLIC_APP_TESTING_MODE =
	String(process.env.NEXT_PUBLIC_APP_TESTING_MODE ?? "")
		.toLowerCase()
		.trim() === "true";

//
// Mock Data Generation
// =====================================================================
//

/**
 * Generates a specified number of mock leads.
 * @param count - The number of mock leads to generate.
 * @returns An array of `LeadTypeGlobal` objects.
 */
export function generateMockLeads(count: number): LeadTypeGlobal[] {
	const leads: LeadTypeGlobal[] = [];

	for (let i = 0; i < count; i++) {
		const streetAddress = faker.location.streetAddress();
		const city = faker.location.city();
		const state = faker.location.state({ abbreviated: true });
		const zipCode = faker.location.zipCode();

		const lead: LeadTypeGlobal = {
			id: uuid(),
			contactInfo: {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				email: faker.internet.email(),
				phone: faker.phone.number(),
				address: streetAddress,
				domain: faker.internet.domainName(),
				social: `https://linkedin.com/in/${faker.internet.username()}`,
			},
			address1: {
				fullStreetLine: streetAddress,
				city,
				state,
				zipCode,
			},
			summary: faker.lorem.sentence(),
			bed: faker.number.int({ min: 1, max: 5 }),
			bath: faker.number.int({ min: 1, max: 4 }),
			sqft: faker.number.int({ min: 500, max: 5000 }),
			status: faker.helpers.arrayElement<LeadStatus>([
				"New Lead",
				"Contacted",
				"Closed",
				"Lost",
			]),
			followUp:
				faker.helpers.maybe(
					() => faker.date.future().toISOString().split("T")[0],
					{ probability: 0.5 },
				) || null,
			lastUpdate: faker.date.recent().toISOString().split("T")[0],
			campaignID: faker.helpers.maybe(() => faker.string.uuid(), {
				probability: 0.8,
			}),
			socials: {
				facebook: `https://facebook.com/${faker.internet.username()}`,
				linkedin: `https://linkedin.com/in/${faker.internet.username()}`,
				instagram: `https://instagram.com/${faker.internet.username()}`,
				twitter: `https://twitter.com/${faker.internet.username()}`,
			},
			// Channel-specific opt-out flags (low probabilities)
			smsOptOut: faker.datatype.boolean(0.08),
			emailOptOut: faker.datatype.boolean(0.06),
			callOptOut: faker.datatype.boolean(0.04),
			dmOptOut: faker.datatype.boolean(0.03),
		};

		// Aggregate DNC and derive a friendly source label
		const flags = {
			sms: Boolean(lead.smsOptOut),
			email: Boolean(lead.emailOptOut),
			call: Boolean(lead.callOptOut),
			dm: Boolean(lead.dmOptOut),
		};
		lead.dncList =
			flags.sms || flags.email || flags.call || flags.dm || undefined;
		if (lead.dncList) {
			// Priority: Text -> Email -> Call -> DM
			lead.dncSource = flags.sms
				? "Text Opt-out"
				: flags.email
					? "Email Unsubscribe"
					: flags.call
						? "Call Blocked"
						: "DM Opt-out";
		}

		leads.push(lead);
	}

	return leads;
}

export const mockGeneratedLeads = NEXT_PUBLIC_APP_TESTING_MODE
	? generateMockLeads(100)
	: [];

//
// Static Mock Data (Corrected)
// =====================================================================
//

export const staticMockLeadData: LeadTypeGlobal[] = [];

//
// Other Types and Data
// =====================================================================
//

export type Employee = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	gender: string;
	date_of_birth: string; // Consider using a proper date type if possible
	street: string;
	city: string;
	state: string;
	country: string;
	zipcode: string;
	longitude?: number; // Optional field
	latitude?: number; // Optional field
	job: string;
	profile_picture?: string | null; // Profile picture can be a string (URL) or null
};

export const navItems: NavItem[] = [
	{
		title: "Assistants",
		href: "/dashboard/assistants",
		icon: "bot",
		label: "assistants",
	},
	{
		title: "Property Search",
		href: "/dashboard",
		icon: "search",
		label: "searchProperties",
	},
	{
		title: "Campaign Manager",
		href: "/dashboard/campaigns",
		icon: "campaigns",
		label: "campaigns",
	},
	{
		title: "Leads",
		href: "/dashboard/lead",
		icon: "user",
		label: "leads",
	},
	{
		title: "Lead Lists",
		href: "/dashboard/leadList",
		icon: "scribe",
		label: "lead-lists",
	},
	{
		title: "Kanban",
		href: "/dashboard/kanban",
		icon: "kanban",
		label: "kanban",
	},
	{
		title: "Chat",
		href: "/dashboard/chat",
		icon: "messageCircle",
		label: "chat",
	},
	{
		title: "Employee",
		href: "/dashboard/employee",
		icon: "employee",
		label: "employee",
	},
	{
		title: "Logout",
		href: "/",
		icon: "logout",
		label: "logout",
	},
];
