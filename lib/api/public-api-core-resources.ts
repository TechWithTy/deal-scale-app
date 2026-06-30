import { publicApiFetch } from "@/lib/api/public-api-client";

type QueryValue = boolean | number | string | undefined;
type QueryParams = Record<string, QueryValue>;

function withQuery(pathname: string, params?: QueryParams) {
	if (!params) return pathname;
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === "") continue;
		search.set(key, String(value));
	}
	const query = search.toString();
	return query ? `${pathname}?${query}` : pathname;
}

function encodeId(id: string) {
	return encodeURIComponent(id);
}

export function getCashbuyers(params?: QueryParams, token?: string) {
	return publicApiFetch<unknown>(withQuery("/api/v1/cashbuyers", params), {
		token,
	});
}

export function getCashbuyer(cashbuyerId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/cashbuyers/${encodeId(cashbuyerId)}`,
		{
			token,
		},
	);
}

export function getLeadLists(params?: QueryParams, token?: string) {
	return publicApiFetch<unknown>(withQuery("/api/v1/lead-lists", params), {
		token,
	});
}

export function getLeadList(leadListId: string, token?: string) {
	return publicApiFetch<unknown>(`/api/v1/lead-lists/${encodeId(leadListId)}`, {
		token,
	});
}

export function getLeadListLeads(
	leadListId: string,
	params?: QueryParams,
	token?: string,
) {
	return publicApiFetch<unknown>(
		withQuery(`/api/v1/lead-lists/${encodeId(leadListId)}/leads`, params),
		{ token },
	);
}

export function getLead(leadId: string, token?: string) {
	return publicApiFetch<unknown>(`/api/v1/leads/${encodeId(leadId)}`, {
		token,
	});
}

export function updateLead(leadId: string, body: unknown, token?: string) {
	return publicApiFetch<unknown>(`/api/v1/leads/${encodeId(leadId)}`, {
		body,
		method: "PATCH",
		token,
	});
}

export function deleteLead(leadId: string, token?: string) {
	return publicApiFetch<unknown>(`/api/v1/leads/${encodeId(leadId)}`, {
		method: "DELETE",
		token,
	});
}

export function getProperty(propertyId: string, token?: string) {
	return publicApiFetch<unknown>(`/api/v1/properties/${encodeId(propertyId)}`, {
		token,
	});
}

export function getCampaigns(params?: QueryParams, token?: string) {
	return publicApiFetch<unknown>(withQuery("/api/v1/campaigns", params), {
		token,
	});
}

export function getCampaign(campaignId: string, token?: string) {
	return publicApiFetch<unknown>(`/api/v1/campaigns/${encodeId(campaignId)}`, {
		token,
	});
}

export function updateCampaign(
	campaignId: string,
	body: unknown,
	token?: string,
) {
	return publicApiFetch<unknown>(`/api/v1/campaigns/${encodeId(campaignId)}`, {
		body,
		method: "PATCH",
		token,
	});
}

export function cancelCampaign(campaignId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/campaigns/${encodeId(campaignId)}/cancel`,
		{ method: "POST", token },
	);
}

export function deleteCampaign(campaignId: string, token?: string) {
	return publicApiFetch<unknown>(`/api/v1/campaigns/${encodeId(campaignId)}`, {
		method: "DELETE",
		token,
	});
}
