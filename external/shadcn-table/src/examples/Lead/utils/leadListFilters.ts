import type { DemoLead } from "../types";

export type LeadVerificationFilter =
	| "all"
	| "phone"
	| "email"
	| "address"
	| "social";

export interface LeadListFilterState {
	query: string;
	status: "all" | DemoLead["status"];
	verification: LeadVerificationFilter;
}

function getSocialText(lead: DemoLead) {
	if (!Array.isArray(lead.socials)) return "";
	return lead.socials
		.map((social) => `${social.label} ${social.url}`)
		.join(" ");
}

function matchesVerification(
	lead: DemoLead,
	verification: LeadVerificationFilter,
) {
	if (verification === "all") return true;
	if (verification === "phone") return lead.phoneVerified === true;
	if (verification === "email") return lead.emailVerified === true;
	if (verification === "address") return lead.addressVerified === true;
	return lead.socialVerified === true;
}

export function filterLeadList(
	leads: DemoLead[],
	{ query, status, verification }: LeadListFilterState,
) {
	const normalizedQuery = query.trim().toLowerCase();

	return leads.filter((lead) => {
		const matchesStatus = status === "all" || lead.status === status;
		if (!matchesStatus || !matchesVerification(lead, verification)) {
			return false;
		}

		if (!normalizedQuery) return true;

		const searchableText = [
			lead.name,
			lead.address,
			lead.associatedAddress,
			lead.email,
			lead.phone,
			lead.status,
			getSocialText(lead),
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();

		return searchableText.includes(normalizedQuery);
	});
}
