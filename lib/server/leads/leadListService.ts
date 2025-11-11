import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import { leadListData } from "@/constants/dashboard/leadList";
import type { LeadList, LeadTypeGlobal } from "@/types/_dashboard/leads";

export function getLeadLists(): LeadList[] {
	if (Array.isArray(MockUserProfile?.companyInfo.leadLists)) {
		return MockUserProfile.companyInfo.leadLists;
	}
	return leadListData;
}

export function findLeadListById(
	listId: string,
	source: LeadList[] = getLeadLists(),
): LeadList | undefined {
	return source.find((list) => list.id === listId);
}

export function findLeadById(
	listId: string,
	leadId: string,
	source: LeadList[] = getLeadLists(),
): { list: LeadList; lead: LeadTypeGlobal } | undefined {
	const list = findLeadListById(listId, source);
	if (!list) return undefined;
	const lead = list.leads.find((entry) => entry.id === leadId);
	if (!lead) return undefined;
	return { list, lead };
}

export function buildLeadDetailPath(
	listId: string,
	leadId: string,
	params?: Record<string, string | number | boolean | undefined>,
): string {
	const base = `/dashboard/lead-list/${listId}/lead/${leadId}`;
	if (!params || Object.keys(params).length === 0) return base;
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		search.set(key, String(value));
	}
	const query = search.toString();
	return query ? `${base}?${query}` : base;
}

export async function fetchLeadDetail(
	listId: string,
	leadId: string,
): Promise<{ list: LeadList; lead: LeadTypeGlobal } | null> {
	const payload = findLeadById(listId, leadId);
	return payload ?? null;
}
