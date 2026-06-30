import { auth } from "@/auth";
import {
	getLeadListLeadsServer,
	getLeadListServer,
	getLeadServer,
} from "@/lib/api/public-api-core-resources-server";
import {
	normalizePublicApiLead,
	normalizePublicApiLeadList,
	normalizePublicApiLeads,
	toLeadList,
} from "@/lib/leads/public-api-lead-normalizers";
import type { LeadList, LeadTypeGlobal } from "@/types/_dashboard/leads";

async function getToken() {
	const session = await auth();
	return session?.publicApi?.accessToken;
}

export async function fetchPublicApiLeadList(
	listId: string,
): Promise<LeadList | null> {
	const token = await getToken();
	if (!token) return null;
	try {
		const [listPayload, leadsPayload] = await Promise.all([
			getLeadListServer(listId, token),
			getLeadListLeadsServer(listId, { limit: 100 }, token),
		]);
		const row = normalizePublicApiLeadList(listPayload);
		const leads = normalizePublicApiLeads(leadsPayload);
		return toLeadList({ ...row, leads, records: leads.length || row.records });
	} catch {
		return null;
	}
}

export async function fetchPublicApiLeadDetail(
	leadId: string,
): Promise<LeadTypeGlobal | null> {
	const token = await getToken();
	if (!token) return null;
	try {
		return normalizePublicApiLead(
			await getLeadServer(leadId, token),
		) as LeadTypeGlobal;
	} catch {
		return null;
	}
}
