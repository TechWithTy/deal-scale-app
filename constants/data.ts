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
				lead.status === "Closed"
					? "high"
					: lead.status === "Contacted"
						? "medium"
						: "low";
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

export const staticMockLeadData: LeadTypeGlobal[] = [
	{
		id: "cash-buyer-dallas-001",
		contactInfo: {
			firstName: "Maya",
			lastName: "Patel",
			email: "maya.patel@patelcapitalhomes.com",
			phone: "214-555-0184",
			knownPhone: "214-555-0184",
			address: "2101 Cedar Springs Road",
			domain: "patelcapitalhomes.com",
			social: "https://linkedin.com/in/maya-patel-investor",
			emailVerified: true,
			socialVerified: true,
		},
		address1: {
			fullStreetLine: "2101 Cedar Springs Road",
			city: "Dallas",
			state: "TX",
			zipCode: "75201",
		},
		summary:
			"Repeat cash buyer focused on Dallas infill flips and landlord-ready rentals.",
		bed: 3,
		bath: 2,
		sqft: 1450,
		status: "Contacted",
		leadCategory: "cash-buyers",
		followUp: "2026-06-24",
		lastUpdate: "2026-06-17",
		leadSource: "Investor intake form",
		company: "Patel Capital Homes",
		jobTitle: "Managing Partner",
		propertyValue: 285000,
		tags: "cash buyer, dallas, fix-and-flip, rental",
		notes: "Prefers 72-hour decision windows and clean title packages.",
		communicationPreferences: ["sms", "email"],
		tcpaOptedIn: true,
		tcpaConsentDate: "2026-05-30T14:00:00.000Z",
		tcpaSource: "Investor intake form",
		cashBuyerProfile: {
			buyerPersonas: ["investor", "flipper", "landlord"],
			budgetMin: 180000,
			budgetMax: 475000,
			strategies: ["Fix and flip", "BRRRR", "Small multifamily"],
			buyBox: {
				states: ["TX"],
				counties: ["Dallas"],
				cities: ["Dallas", "Garland", "Mesquite"],
				zipCodes: ["75201", "75204", "75206", "75043", "75149"],
				propertyTypes: ["Single family", "Duplex", "Triplex"],
				occupancy: "any",
				priceMin: 150000,
				priceMax: 450000,
				bedroomsMin: 2,
				bathroomsMin: 1,
				sqftMin: 900,
				sqftMax: 2600,
				notes: "Wants light-to-medium rehab with ARV spread over 25%.",
			},
		},
		socials: {
			facebook: "https://facebook.com/patelcapitalhomes",
			linkedin: "https://linkedin.com/in/maya-patel-investor",
			instagram: "https://instagram.com/patelcapitalhomes",
			twitter: "https://x.com/patelcapital",
			tiktok: "https://tiktok.com/@patelcapitalhomes",
			youtube: "https://youtube.com/@patelcapitalhomes",
		},
	},
	{
		id: "cash-buyer-atlanta-001",
		contactInfo: {
			firstName: "Darius",
			lastName: "Coleman",
			email: "darius@peachtreeholdings.co",
			phone: "404-555-0119",
			knownPhone: "404-555-0119",
			address: "1180 West Peachtree Street NW",
			domain: "peachtreeholdings.co",
			social: "https://linkedin.com/in/darius-coleman-rei",
			emailVerified: true,
			socialVerified: true,
		},
		address1: {
			fullStreetLine: "1180 West Peachtree Street NW",
			city: "Atlanta",
			state: "GA",
			zipCode: "30309",
		},
		summary:
			"Atlanta cash buyer sourcing vacant homes, REO deals, and small multifamily.",
		bed: 4,
		bath: 2,
		sqft: 1880,
		status: "New Lead",
		leadCategory: "cash-buyers",
		followUp: "2026-06-22",
		lastUpdate: "2026-06-16",
		leadSource: "Webhook - Cash Buyers",
		company: "Peachtree Holdings",
		jobTitle: "Acquisitions Director",
		propertyValue: 335000,
		tags: "cash buyer, atlanta, reo, vacant",
		notes: "Needs photos, rehab scope, and seller timeline before offer call.",
		communicationPreferences: ["call", "email"],
		tcpaOptedIn: true,
		tcpaConsentDate: "2026-06-03T16:30:00.000Z",
		tcpaSource: "Webhook consent",
		cashBuyerProfile: {
			buyerPersonas: ["investor", "wholesaler", "flipper"],
			budgetMin: 125000,
			budgetMax: 650000,
			strategies: ["Wholesale assignment", "Fix and flip", "REO"],
			buyBox: {
				states: ["GA"],
				counties: ["Fulton", "DeKalb", "Cobb"],
				cities: ["Atlanta", "Decatur", "Marietta"],
				zipCodes: ["30309", "30310", "30315", "30030", "30060"],
				propertyTypes: ["Single family", "Townhome", "Duplex"],
				occupancy: "vacant",
				priceMin: 100000,
				priceMax: 600000,
				bedroomsMin: 2,
				bathroomsMin: 1,
				sqftMin: 850,
				sqftMax: 3200,
				notes: "Prioritizes vacant and code-violation properties near transit.",
			},
		},
		socials: {
			facebook: "https://facebook.com/peachtreeholdings",
			linkedin: "https://linkedin.com/in/darius-coleman-rei",
			instagram: "https://instagram.com/peachtreeholdings",
			twitter: "https://x.com/peachtreeholds",
			tiktok: "https://tiktok.com/@peachtreeholdings",
			youtube: "https://youtube.com/@peachtreeholdings",
		},
	},
	{
		id: "cash-buyer-phoenix-001",
		contactInfo: {
			firstName: "Elena",
			lastName: "Ramos",
			email: "elena@desertdoorproperties.com",
			phone: "602-555-0136",
			knownPhone: "602-555-0136",
			address: "40 North Central Avenue",
			domain: "desertdoorproperties.com",
			social: "https://linkedin.com/in/elena-ramos-landlord",
			emailVerified: true,
			socialVerified: true,
		},
		address1: {
			fullStreetLine: "40 North Central Avenue",
			city: "Phoenix",
			state: "AZ",
			zipCode: "85004",
		},
		summary:
			"Buy-and-hold cash buyer targeting rental-ready homes across Phoenix suburbs.",
		bed: 3,
		bath: 2,
		sqft: 1625,
		status: "Contacted",
		leadCategory: "cash-buyers",
		followUp: "2026-06-25",
		lastUpdate: "2026-06-18",
		leadSource: "Referral partner",
		company: "Desert Door Properties",
		jobTitle: "Portfolio Owner",
		propertyValue: 410000,
		tags: "cash buyer, phoenix, landlord, rental-ready",
		notes: "Prefers occupied rentals with clean ledgers and verified leases.",
		communicationPreferences: ["email", "sms"],
		tcpaOptedIn: true,
		tcpaConsentDate: "2026-06-10T19:15:00.000Z",
		tcpaSource: "Referral intake",
		cashBuyerProfile: {
			buyerPersonas: ["landlord", "investor"],
			budgetMin: 240000,
			budgetMax: 725000,
			strategies: ["Buy and hold", "Rental portfolio", "Turnkey rentals"],
			buyBox: {
				states: ["AZ"],
				counties: ["Maricopa"],
				cities: ["Phoenix", "Mesa", "Glendale", "Chandler"],
				zipCodes: ["85004", "85016", "85201", "85301", "85225"],
				propertyTypes: ["Single family", "Duplex", "Condo"],
				occupancy: "occupied",
				priceMin: 220000,
				priceMax: 700000,
				bedroomsMin: 2,
				bedroomsMax: 5,
				bathroomsMin: 1,
				sqftMin: 900,
				sqftMax: 3400,
				notes: "Needs rent roll, lease end dates, and capex history.",
			},
		},
		socials: {
			facebook: "https://facebook.com/desertdoorproperties",
			linkedin: "https://linkedin.com/in/elena-ramos-landlord",
			instagram: "https://instagram.com/desertdoorproperties",
			twitter: "https://x.com/desertdoorrei",
			tiktok: "https://tiktok.com/@desertdoorproperties",
			youtube: "https://youtube.com/@desertdoorproperties",
		},
	},
];

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
		title: "Connections",
		href: "/dashboard/connections",
		icon: "webhook",
		label: "Webhooks & Feeds",
		featureKey: "navigation.connections",
	},
	{
		title: "Analytics",
		href: "/dashboard/charts",
		icon: "chart",
		label: "Analytics",
		featureKey: "navigation.charts",
	},
	{
		title: "Calculators",
		href: "/dashboard/calculators",
		icon: "calculator",
		label: "Calculators",
		featureKey: "navigation.calculators",
	},
	{
		title: "Resources",
		href: "/dashboard/resources",
		icon: "bookOpen",
		label: "Resources",
		featureKey: "navigation.resources",
	},
	{
		title: "Deal Room",
		href: "/dashboard/deal-room",
		icon: "briefcase",
		label: "Deal Room",
		featureKey: "navigation.dealRoom",
	},
	{
		title: "Employee",
		href: "/dashboard/employee",
		icon: "employee",
		label: "Employees",
		featureKey: "navigation.employee",
	},
	{
		title: "separator",
		href: "#",
		icon: "separator",
		label: "separator",
	},
	{
		title: "Community",
		href: "https://discord.gg/BNrsYRPtFN",
		icon: "users",
		label: "Community",
		external: true,
		badge: "new",
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
