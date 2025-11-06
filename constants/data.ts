import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "./testingMode";
export { APP_TESTING_MODE, NEXT_PUBLIC_APP_TESTING_MODE } from "./testingMode";
import type { NavItem } from "@/types";
import type {
	Address,
	ContactInfo,
	LeadStatus,
	LeadTypeGlobal,
	SocialLinks,
} from "@/types/_dashboard/leads";
import { enrichLeadWithIntentSignals } from "@/lib/helpers/enrichLeadsWithIntentSignals";

//
// Configuration
// =====================================================================
//

// Resolve testing mode from env (Next.js runtime)
// Consumers should import NEXT_PUBLIC_APP_TESTING_MODE or APP_TESTING_MODE from
// "./testingMode" (re-exported above).

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
				tiktok: `https://tiktok.com/@${faker.internet.username()}`,
				youtube: `https://youtube.com/@${faker.internet.username()}`,
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

		// Enrich leads with intent signals based on their status
		// Only enrich every 3rd lead to improve performance (lazy load the rest)
		const shouldEnrich = i % 3 === 0; // 33% of leads get signals immediately
		
		if (shouldEnrich) {
			const intentProfile = 
				lead.status === "Closed" ? "high" :
				lead.status === "Contacted" ? "medium" :
				"low";
			const enrichedLead = enrichLeadWithIntentSignals(lead, intentProfile);
			leads.push(enrichedLead);
		} else {
			// Store a flag for lazy enrichment on first view
			leads.push({ ...lead, _needsIntentEnrichment: true } as LeadTypeGlobal);
		}
	}

	return leads;
}

// Cache generated leads to avoid regenerating on every import
let _cachedMockLeads: LeadTypeGlobal[] | null = null;

function getMockGeneratedLeads(): LeadTypeGlobal[] {
	if (!_cachedMockLeads) {
		_cachedMockLeads = generateMockLeads(50); // Reduced from 100 to 50 for faster load
	}
	return _cachedMockLeads;
}

export const mockGeneratedLeads = NEXT_PUBLIC_APP_TESTING_MODE
	? getMockGeneratedLeads()
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
		href: "/dashboard/agents",
		icon: "bot",
		label: "Ai Agents",
		featureKey: "navigation.aiAssistants",
	},
	{
		title: "Quick Start",
		href: "/dashboard",
		icon: "add",
		label: "Quick Start",
		featureKey: "navigation.quickStart",
		variant: "primary",
		onlyMobile: true,
	},
	{
		title: "Campaign Manager",
		href: "/dashboard/campaigns",
		icon: "campaigns",
		label: "Campaigns",
		featureKey: "navigation.campaignManager",
	},

	{
		title: "Lead Lists",
		href: "/dashboard/lead-list",
		icon: "scribe",
		label: "Lead Lists",
		featureKey: "navigation.leadLists",
	},
	{
		title: "Kanban",
		href: "/dashboard/kanban",
		icon: "kanban",
		label: "AI Kanban Board",
		featureKey: "navigation.kanban",
	},
	{
		title: "Chat",
		href: "/dashboard/chat",
		icon: "messageCircle",
		label: "AI Chat",
		featureKey: "navigation.chat",
	},
	{
		title: "Charts",
		href: "/dashboard/charts",
		icon: "chart",
		label: "Analytics & Charts",
		featureKey: "navigation.charts",
	},
	{
		title: "Connections",
		href: "/dashboard/connections",
		icon: "webhook",
		label: "Webhooks & Feeds",
		featureKey: "navigation.connections",
	},
	{
		title: "Employee",
		href: "/dashboard/employee",
		icon: "employee",
		label: "Employees",
		featureKey: "navigation.employee",
	},
	{
		title: "Marketplace",
		href: "https://www.dealscale.io/products",
		icon: "store",
		label: "Marketplace",
		external: true,
		hasSaleItems: true,
		saleLink: "https://dealscale.io/product/{id}",
	},
	{
		title: "Support",
		href: "https://dealscale.zohodesk.com/portal/en/home",
		icon: "help",
		label: "Support",
		external: true,
	},
	{
		title: "Logout",
		href: "/",
		icon: "logout",
		label: "Sign out",
	},
];
