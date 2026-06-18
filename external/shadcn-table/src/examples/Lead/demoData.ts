import {
	generateIntentSignalProfile,
	generateMockIntentSignals,
} from "../../../../../constants/_faker/intentSignals";
import { calculateIntentScore } from "../../../../../lib/scoring/intentScoring";
import type {
	CashBuyerPersona,
	LeadStatus,
} from "../../../../../types/_dashboard/leads";
import type { ActivityEvent, DemoLead, DemoRow } from "./types";

const DEMO_LISTS = [
	"Austin Leads",
	"Dallas Buyers",
	"Houston Sellers",
	"Direct Mail Outreach",
	"Phone Sweep",
] as const;
const DEFAULT_LEADS_PER_LIST = 10;
type CashBuyerListSeed = {
	list: string;
	city: string;
	state: string;
	zipCodes: string[];
	personas: CashBuyerPersona[];
	strategies: string[];
	budgetMin: number;
	budgetMax: number;
	propertyTypes: string[];
	occupancy: "vacant" | "occupied" | "any";
};

const CASH_BUYER_LISTS: CashBuyerListSeed[] = [
	{
		list: "Dallas Cash Buyers - Buy Box Ready",
		city: "Dallas",
		state: "TX",
		zipCodes: ["75201", "75204", "75206", "75043"],
		personas: ["investor", "flipper", "landlord"],
		strategies: ["Fix and flip", "BRRRR", "Small multifamily"],
		budgetMin: 180000,
		budgetMax: 475000,
		propertyTypes: ["Single family", "Duplex", "Triplex"],
		occupancy: "any",
	},
	{
		list: "Atlanta Cash Buyers - Flip / REO",
		city: "Atlanta",
		state: "GA",
		zipCodes: ["30309", "30310", "30315", "30030"],
		personas: ["investor", "wholesaler", "flipper"],
		strategies: ["Wholesale assignment", "Fix and flip", "REO"],
		budgetMin: 125000,
		budgetMax: 650000,
		propertyTypes: ["Single family", "Townhome", "Duplex"],
		occupancy: "vacant",
	},
	{
		list: "Phoenix Cash Buyers - Landlord Rentals",
		city: "Phoenix",
		state: "AZ",
		zipCodes: ["85004", "85016", "85201", "85301"],
		personas: ["landlord", "investor"],
		strategies: ["Buy and hold", "Rental portfolio", "Turnkey rentals"],
		budgetMin: 240000,
		budgetMax: 725000,
		propertyTypes: ["Single family", "Duplex", "Condo"],
		occupancy: "occupied",
	},
];

const FIRST = [
	"Ruth",
	"Hollie",
	"Jennie",
	"Marcus",
	"Angela",
	"Tom",
	"Sara",
	"Peter",
] as const;
const LAST = [
	"Paucek",
	"Schaden",
	"Kunde",
	"Smith",
	"Johnson",
	"Lee",
	"Brown",
	"Nguyen",
] as const;
const STREETS = [
	"Bath Road",
	"Constance Spring",
	"Allen Valley",
	"King St",
	"2nd Ave",
] as const;
const ACTIVITY_SEQUENCE: Array<{
	kind: ActivityEvent["kind"];
	summary: (ctx: {
		first: string;
		address: string;
		listName: string;
	}) => string;
}> = [
	{
		kind: "call",
		summary: ({ first, address }) =>
			`Phone call connected with ${first} about ${address}`,
	},
	{
		kind: "text",
		summary: ({ first }) => `Text message sent to ${first} with offer details`,
	},
	{
		kind: "email",
		summary: ({ first }) => `Email sent to ${first} with valuation worksheet`,
	},
	{
		kind: "social",
		summary: ({ first }) =>
			`Viewed ${first}'s LinkedIn profile and recent posts`,
	},
	{
		kind: "outreach",
		summary: ({ first, listName }) =>
			`Added ${first} to ${listName} outreach sequence`,
	},
	{
		kind: "voicemail",
		summary: ({ first }) => `Left voicemail for ${first} after missed call`,
	},
	{
		kind: "note",
		summary: ({ first }) =>
			`Added note: ${first} asked for follow-up next week`,
	},
	{
		kind: "call",
		summary: ({ first }) => `Phone call attempted for ${first} - no answer`,
	},
	{
		kind: "text",
		summary: ({ first }) => `${first} replied to SMS asking for property comps`,
	},
	{
		kind: "email",
		summary: ({ first }) => `${first} opened investment criteria email`,
	},
	{
		kind: "social",
		summary: ({ first }) => `${first} followed Facebook property update`,
	},
	{
		kind: "outreach",
		summary: ({ first }) => `Scheduled direct mail follow-up for ${first}`,
	},
	{
		kind: "call",
		summary: ({ first }) => `Phone call completed with ${first} for 4 minutes`,
	},
	{
		kind: "email",
		summary: ({ first }) => `Follow-up email queued for ${first}`,
	},
	{
		kind: "text",
		summary: ({ first }) => `SMS reminder sent to ${first}`,
	},
	{
		kind: "social",
		summary: ({ first }) => `Checked Instagram activity for ${first}`,
	},
	{
		kind: "outreach",
		summary: ({ first }) => `Marked ${first} as active outreach prospect`,
	},
	{
		kind: "note",
		summary: ({ first }) => `Updated buying timeline note for ${first}`,
	},
];

export function pick<T>(arr: readonly T[]): T {
	const i = Math.floor(Math.random() * arr.length);
	const item = arr[i];
	if (item === undefined)
		throw new Error(`Array is empty or item at ${i} is undefined`);
	return item;
}

export const randPhone = (): string => {
	const a = Math.floor(100 + Math.random() * 900);
	const b = Math.floor(100 + Math.random() * 900);
	const c = Math.floor(1000 + Math.random() * 9000);
	return `${a}-${b}-${c}`;
};

function makeActivityEvents(
	name: string,
	address: string,
	leadIndex: number,
	listName: string,
): ActivityEvent[] {
	const first = name.split(" ")[0] ?? "Lead";
	const now = Date.now();
	const eventCount = 18 + (leadIndex % 5);

	return Array.from({ length: eventCount }, (_, eventIndex) => {
		const sequence =
			ACTIVITY_SEQUENCE[(eventIndex + leadIndex) % ACTIVITY_SEQUENCE.length] ??
			ACTIVITY_SEQUENCE[0];
		const kind = sequence?.kind ?? "note";
		const daysAgo = eventIndex + Math.floor(eventIndex / 3) + (leadIndex % 4);
		const timestamp = new Date(now - daysAgo * 86_400_000);
		timestamp.setHours(9 + (eventIndex % 8), (eventIndex * 7) % 60, 0, 0);
		const summary =
			sequence?.summary({ first, address, listName }) ??
			`Updated ${listName} activity for ${first}`;

		return {
			ts: timestamp.toISOString(),
			kind,
			summary:
				eventIndex % 6 === 0
					? `${summary} from ${listName} workflow (#${eventIndex + 1})`
					: `${summary} (#${eventIndex + 1})`,
		};
	}).sort((a, b) => b.ts.localeCompare(a.ts));
}

// Cache for demo leads to avoid regenerating
const _leadCache = new Map<string, DemoLead[]>();

// Clear cache on module reload (development only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	_leadCache.clear();
}

export function makeLeads(n: number, listName: string): DemoLead[] {
	// Check cache first
	const cacheKey = `${listName}-${n}`;
	const cached = _leadCache.get(cacheKey);
	const cachedKinds = new Set(
		cached?.[0]?.activity?.map((event) => event.kind),
	);
	if (
		cached &&
		cached.length > 0 &&
		cached[0]?.intentSignals &&
		cachedKinds.has("text") &&
		cachedKinds.has("outreach")
	) {
		// Only use cache if it has valid data with intent signals and rich activity.
		return cached;
	}

	const leads = Array.from({ length: n }).map((_, i) => {
		const name = `${pick(FIRST)} ${pick(LAST)}`;
		const address = `${Math.floor(10 + Math.random() * 9900)} ${pick(STREETS)}`;
		const email = `${name.replace(/\s+/g, "_")}${i}@example.com`;
		const baseHandle = name.replace(/\s+/g, "").toLowerCase();
		const activity = makeActivityEvents(name, address, i, listName);

		const [firstName, lastName] = name.split(" ");
		const status = pick([
			"New Lead",
			"Contacted",
			"Closed",
			"Lost",
		] as LeadStatus[]);
		const phone = randPhone();

		// Generate intent signals based on status
		const intentProfile =
			status === "Closed" ? "high" : status === "Contacted" ? "medium" : "low";
		const baseIntentSignals = generateIntentSignalProfile(intentProfile);
		const intentSignals =
			baseIntentSignals.length >= 14
				? baseIntentSignals
				: [
						...baseIntentSignals,
						...generateMockIntentSignals(14 - baseIntentSignals.length, 21),
					].sort(
						(a, b) =>
							new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
					);
		const intentScore = calculateIntentScore(intentSignals);
		const lastIntentActivity =
			intentSignals.length > 0 ? intentSignals[0]?.timestamp : undefined;

		return {
			// LeadTypeGlobal required fields
			id: `${listName}-${i + 1}`,
			contactInfo: {
				firstName: firstName || "Unknown",
				lastName: lastName || "User",
				email,
				phone,
				address,
				domain: "example.com",
				social: `https://linkedin.com/in/${baseHandle}`,
			},
			// Compatibility fields for LeadRowCarouselPanel
			name,
			address,
			email,
			phone,
			socials: [
				{
					label: "Facebook",
					url: `https://facebook.com/${baseHandle}`,
					verified: Math.random() < 0.5,
				},
				{
					label: "LinkedIn",
					url: `https://linkedin.com/in/${baseHandle}`,
					verified: Math.random() < 0.6,
				},
				{
					label: "Instagram",
					url: `https://instagram.com/${(name?.split?.(" ")[0] ?? "").toLowerCase()}`,
					verified: Math.random() < 0.4,
				},
			],
			address1: {
				fullStreetLine: address,
				city: "Unknown",
				state: "TX",
				zipCode: "00000",
			},
			summary: `Lead from ${listName}`,
			bed: Math.floor(Math.random() * 4) + 1,
			bath: Math.floor(Math.random() * 3) + 1,
			sqft: Math.floor(Math.random() * 2000) + 800,
			status,
			followUp: null,
			lastUpdate: new Date().toISOString().split("T")[0] || "",
			// Intent signals
			intentSignals,
			intentScore,
			lastIntentActivity,
			// Demo-specific fields
			isIphone: Math.random() < 0.5,
			possiblePhones: Array.from(
				{ length: Math.floor(Math.random() * 3) },
				() => randPhone(),
			),
			possibleEmails: Array.from(
				{ length: Math.floor(Math.random() * 2) },
				(_, k) => `${name.replace(/\s+/g, ".").toLowerCase()}${k}@altmail.com`,
			),
			possibleHandles: [
				{
					platform: "Facebook",
					username: baseHandle,
					url: `https://facebook.com/${baseHandle}`,
				},
				{
					platform: "LinkedIn",
					username: `${baseHandle}`,
					url: `https://linkedin.com/in/${baseHandle}`,
				},
				{
					platform: "Instagram",
					username: (name?.split?.(" ")?.[0] ?? "").toLowerCase(),
					url: `https://instagram.com/${typeof name === "string" && name.split ? (name.split(" ")[0] || "").toLowerCase() : ""}`,
				},
				{
					platform: "Twitter",
					username: `${baseHandle.slice(0, 12)}`,
					url: `https://x.com/${baseHandle.slice(0, 12)}`,
				},
			],
			activity,
			phoneVerified: Math.random() < 0.6,
			emailVerified: Math.random() < 0.7,
			socialVerified: Math.random() < 0.5,
			associatedAddress: `${address} Apt ${Math.floor(1 + Math.random() * 20)}`,
			addressVerified: Math.random() < 0.65,
		} as DemoLead;
	});

	// Cache the results
	_leadCache.set(cacheKey, leads);

	return leads;
}

function makeCashBuyerLeads(n: number, seed: CashBuyerListSeed): DemoLead[] {
	return makeLeads(n, seed.list).map((lead, index) => {
		const zipCode = seed.zipCodes[index % seed.zipCodes.length] ?? "00000";
		const budgetSpread = seed.budgetMax - seed.budgetMin;
		const priceMin = Math.round(seed.budgetMin * 0.85);
		const priceMax = Math.round(seed.budgetMax * 0.95);

		return {
			...lead,
			id: `${seed.list}-cash-buyer-${index + 1}`,
			leadCategory: "cash-buyers",
			status: index % 3 === 0 ? "Contacted" : lead.status,
			summary: `${seed.city} cash buyer for ${seed.strategies.join(", ").toLowerCase()} opportunities.`,
			leadSource: "Cash buyer intake",
			company: `${seed.city} Buyer Group ${index + 1}`,
			jobTitle: seed.personas.includes("landlord")
				? "Portfolio Buyer"
				: "Acquisitions Buyer",
			tags: `cash buyer, ${seed.city.toLowerCase()}, ${seed.strategies.join(", ").toLowerCase()}`,
			notes: `Budget range $${seed.budgetMin.toLocaleString()}-$${seed.budgetMax.toLocaleString()} with defined buy box.`,
			propertyValue: seed.budgetMin + Math.round(budgetSpread * 0.6),
			address1: {
				...lead.address1,
				city: seed.city,
				state: seed.state,
				zipCode,
			},
			cashBuyerProfile: {
				buyerPersonas: seed.personas,
				budgetMin: seed.budgetMin,
				budgetMax: seed.budgetMax,
				strategies: seed.strategies,
				buyBox: {
					states: [seed.state],
					cities: [seed.city],
					zipCodes: seed.zipCodes,
					propertyTypes: seed.propertyTypes,
					occupancy: seed.occupancy,
					priceMin,
					priceMax,
					bedroomsMin: 2,
					bedroomsMax: 5,
					bathroomsMin: 1,
					bathroomsMax: 4,
					sqftMin: 850,
					sqftMax: 3500,
					notes: `Prefers ${seed.propertyTypes.join(", ").toLowerCase()} properties for ${seed.strategies[0]?.toLowerCase() ?? "cash offers"}.`,
				},
			},
		} satisfies DemoLead;
	});
}

export function makeRow(i: number): DemoRow {
	const cashBuyerSeed = CASH_BUYER_LISTS[i];
	if (cashBuyerSeed) {
		const leads = makeCashBuyerLeads(DEFAULT_LEADS_PER_LIST, cashBuyerSeed);

		return {
			id: `cash-buyer-${i + 1}`,
			list: cashBuyerSeed.list,
			uploadDate: new Date(Date.now() - i * 86_400_000).toISOString(),
			records: leads.length,
			phone: leads.filter((lead) => Boolean(lead.phone)).length,
			emails: leads.filter((lead) => Boolean(lead.email)).length,
			socials: leads.filter((lead) => (lead.socials?.length ?? 0) > 0).length,
			leads,
		} satisfies DemoRow;
	}

	const list = DEMO_LISTS[i % DEMO_LISTS.length] as string;
	const leads = makeLeads(DEFAULT_LEADS_PER_LIST, list);

	return {
		id: `${i + 1}`,
		list,
		uploadDate: new Date(Date.now() - i * 86_400_000).toISOString(),
		records: leads.length,
		phone: leads.filter((lead) => Boolean(lead.phone)).length,
		emails: leads.filter((lead) => Boolean(lead.email)).length,
		socials: leads.filter((lead) => (lead.socials?.length ?? 0) > 0).length,
		leads,
	} satisfies DemoRow;
}

export const makeData = (count = 123): DemoRow[] => {
	return Array.from({ length: count }, (_, i) => makeRow(i));
};
