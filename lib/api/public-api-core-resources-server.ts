import { publicApiServerFetch } from "@/lib/api/public-api-server";

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

export function getLeadListServer(leadListId: string, token?: string) {
	return publicApiServerFetch<unknown>(
		`/api/v1/lead-lists/${encodeId(leadListId)}`,
		{ token },
	);
}

export function getLeadListLeadsServer(
	leadListId: string,
	params?: QueryParams,
	token?: string,
) {
	return publicApiServerFetch<unknown>(
		withQuery(`/api/v1/lead-lists/${encodeId(leadListId)}/leads`, params),
		{ token },
	);
}

export function getLeadServer(leadId: string, token?: string) {
	return publicApiServerFetch<unknown>(`/api/v1/leads/${encodeId(leadId)}`, {
		token,
	});
}

export function getPropertyServer(propertyId: string, token?: string) {
	return publicApiServerFetch<unknown>(
		`/api/v1/properties/${encodeId(propertyId)}`,
		{ token },
	);
}
