import type { LeadList, LeadTypeGlobal } from "@/types/_dashboard/leads";

type PublicApiDemoLead = LeadTypeGlobal & {
	address?: string;
	email?: string;
	name?: string;
	phone?: string;
};

export type PublicApiDemoRow = {
	emails: number;
	id: string;
	leads: PublicApiDemoLead[];
	list: string;
	phone: number;
	records: number;
	socials: number;
	uploadDate: string;
};

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asArray(payload: unknown, keys: string[]) {
	if (Array.isArray(payload)) return payload;
	const record = asRecord(payload);
	for (const key of keys) {
		const value = record[key];
		if (Array.isArray(value)) return value;
	}
	return [];
}

function text(value: unknown, fallback = "") {
	return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value: unknown, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function firstText(
	record: Record<string, unknown>,
	keys: string[],
	fallback = "",
) {
	for (const key of keys) {
		const value = text(record[key]);
		if (value) return value;
	}
	return fallback;
}

export function normalizePublicApiLead(
	item: unknown,
	index = 0,
): PublicApiDemoLead {
	const record = asRecord(item);
	const address = asRecord(record.address ?? record.property_address);
	const contact = asRecord(record.contact ?? record.contact_info);
	const property = asRecord(record.property);
	const firstName = firstText(
		record,
		["first_name", "firstName"],
		text(contact.first_name, "Lead"),
	);
	const lastName = firstText(
		record,
		["last_name", "lastName"],
		text(contact.last_name, String(index + 1)),
	);
	const street = firstText(
		record,
		["street", "street_address", "address"],
		text(address.street),
	);
	const city = firstText(record, ["city"], text(address.city));
	const state = firstText(record, ["state"], text(address.state));
	const zipCode = firstText(
		record,
		["zip", "zip_code", "zipCode"],
		text(address.zip_code ?? address.zipCode),
	);
	const email = firstText(record, ["email"], text(contact.email));
	const phone = firstText(record, ["phone"], text(contact.phone));

	return {
		address: street,
		address1: { city, fullStreetLine: street, state, zipCode },
		bath: number(record.baths ?? record.bathrooms ?? property.baths),
		bed: number(record.beds ?? record.bedrooms ?? property.beds),
		contactInfo: {
			address: street,
			domain: firstText(record, ["domain"], text(contact.domain)),
			email,
			firstName,
			lastName,
			phone,
			social: firstText(
				record,
				["social", "social_handle"],
				text(contact.social),
			),
		},
		email,
		followUp: null,
		id: firstText(
			record,
			["id", "lead_id", "uuid"],
			`public-api-lead-${index + 1}`,
		),
		lastUpdate: firstText(
			record,
			["updated_at", "last_activity_at"],
			new Date().toISOString(),
		),
		leadCategory: "cash-buyers",
		leadSource: firstText(record, ["source"], "Public API"),
		name: `${firstName} ${lastName}`.trim(),
		phone,
		propertyValue: number(record.property_value ?? property.value),
		sqft: number(record.sqft ?? record.square_feet ?? property.sqft),
		status: "New Lead",
		summary: firstText(
			record,
			["summary", "description"],
			"Lead from the Deal Scale public API.",
		),
		tags: firstText(record, ["tags"]),
		yearBuilt: number(record.year_built ?? property.year_built),
	};
}

export function normalizePublicApiLeadList(
	item: unknown,
	index = 0,
): PublicApiDemoRow {
	const record = asRecord(item);
	const embeddedLeads = asArray(record.leads, ["leads", "items", "results"]);
	const leads = embeddedLeads.map(normalizePublicApiLead);
	const records = number(
		record.lead_count ?? record.records ?? record.total,
		leads.length,
	);

	return {
		emails: number(
			record.email_count ?? record.emails,
			leads.filter((lead) => Boolean(lead.email)).length,
		),
		id: firstText(
			record,
			["id", "list_id", "uuid"],
			`public-api-list-${index + 1}`,
		),
		leads,
		list: firstText(
			record,
			["name", "list_name", "listName"],
			`Public API Lead List ${index + 1}`,
		),
		phone: number(
			record.phone_count ?? record.phone,
			leads.filter((lead) => Boolean(lead.phone)).length,
		),
		records,
		socials: number(record.social_count ?? record.socials),
		uploadDate: firstText(
			record,
			["created_at", "updated_at"],
			new Date().toISOString(),
		),
	};
}

export function normalizePublicApiLeadLists(
	payload: unknown,
): PublicApiDemoRow[] {
	return asArray(payload, [
		"lead_lists",
		"lists",
		"items",
		"results",
		"data",
	]).map(normalizePublicApiLeadList);
}

export function normalizePublicApiLeads(payload: unknown): PublicApiDemoLead[] {
	return asArray(payload, ["leads", "items", "results", "data"]).map(
		normalizePublicApiLead,
	);
}

export function toLeadList(row: PublicApiDemoRow): LeadList {
	return {
		dataLink: `/dashboard/lead-list/${row.id}`,
		emails: row.emails,
		id: row.id,
		leads: row.leads as LeadTypeGlobal[],
		listName: row.list,
		phone: row.phone,
		records: row.records,
		socials: { facebook: row.socials },
		uploadDate: row.uploadDate,
	};
}
