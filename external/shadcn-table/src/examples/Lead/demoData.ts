import type { ActivityEvent, DemoLead, DemoRow } from "./types";
import { generateIntentSignalProfile } from "../../../../../constants/_faker/intentSignals";
import { calculateIntentScore } from "../../../../../lib/scoring/intentScoring";
import type { LeadStatus } from "../../../../../types/_dashboard/leads";

const DEMO_LISTS = [
	"Austin Leads",
	"Dallas Buyers",
	"Houston Sellers",
	"Direct Mail Outreach",
	"Phone Sweep",
] as const;

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
const KINDS: ActivityEvent["kind"][] = ["call", "email", "social", "note"];

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
	if (cached && cached.length > 0 && cached[0]?.intentSignals) {
		// Only use cache if it has valid data with intent signals
		return cached;
	}

	const leads = Array.from({ length: n }).map((_, i) => {
		const name = `${pick(FIRST)} ${pick(LAST)}`;
		const address = `${Math.floor(10 + Math.random() * 9900)} ${pick(STREETS)}`;
		const email = `${name.replace(/\s+/g, "_")}${i}@example.com`;
		const baseHandle = name.replace(/\s+/g, "").toLowerCase();
		const now = Date.now();
		const activity: ActivityEvent[] = Array.from(
			{ length: Math.floor(Math.random() * 7) + 5 },
			() => {
				const daysAgo = Math.floor(Math.random() * 90);
				const ts = new Date(now - daysAgo * 86_400_000).toISOString();
				const kind = pick(KINDS);
				const summaryBase = {
					call: "Phone call",
					email: "Email",
					social: "Social touch",
					note: "Note",
				}[kind];
				return {
					ts,
					kind,
					summary: `${summaryBase} with ${name.split(" ")[0]}`,
				};
			},
		).sort((a, b) => a.ts.localeCompare(b.ts));

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
		const intentSignals = generateIntentSignalProfile(intentProfile);
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
				},
				{
					label: "LinkedIn",
					url: `https://linkedin.com/in/${baseHandle}`,
				},
				{
					label: "Instagram",
					url: `https://instagram.com/${(name?.split?.(" ")[0] ?? "").toLowerCase()}`,
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

	// Debug log for first lead
	if (leads.length > 0 && typeof window !== "undefined") {
		console.log(`✅ Generated ${listName}:`, {
			count: leads.length,
			firstLead: {
				name: leads[0]?.name,
				hasIntentSignals: !!leads[0]?.intentSignals,
				signalCount: leads[0]?.intentSignals?.length || 0,
				hasScore: !!leads[0]?.intentScore,
				score: leads[0]?.intentScore?.total,
			},
		});
	}

	return leads;
}

export function makeRow(i: number): DemoRow {
	const list = DEMO_LISTS[i % DEMO_LISTS.length] as string;
	const leads = makeLeads(3, list);

	// Debug first row only
	if (i === 0 && typeof window !== "undefined") {
		console.log(`🔍 makeRow Debug - First Row (${list}):`, {
			rowId: `${i + 1}`,
			listName: list,
			leadsCount: leads.length,
			firstLeadSample: {
				id: leads[0]?.id,
				name: leads[0]?.name,
				hasIntentSignals: !!leads[0]?.intentSignals,
				signalCount: leads[0]?.intentSignals?.length,
				hasScore: !!leads[0]?.intentScore,
				score: leads[0]?.intentScore?.total,
			},
		});
	}

	return {
		id: `${i + 1}`,
		list,
		uploadDate: new Date(Date.now() - i * 86_400_000).toISOString(),
		records: Math.floor(Math.random() * 5000) + 100,
		phone: Math.floor(Math.random() * 2000),
		emails: Math.floor(Math.random() * 1500),
		socials: Math.floor(Math.random() * 800),
		leads,
	} satisfies DemoRow;
}

export const makeData = (count = 123): DemoRow[] => {
	const rows = Array.from({ length: count }, (_, i) => makeRow(i));

	// Debug log
	if (typeof window !== "undefined" && rows.length > 0) {
		console.log(`📊 makeData called:`, {
			totalRows: rows.length,
			firstRowHasLeads: rows[0]?.leads?.length > 0,
			firstLeadInFirstRow: rows[0]?.leads?.[0],
		});
	}

	return rows;
};
