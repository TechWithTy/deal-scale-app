/**
 * Data services for fetching properties and lists. These are UI-agnostic.
 */
import type { FilterSpec, Pagination, SortSpec } from "./types";
import { DEFAULT_PAGE_SIZE } from "./constants";

export interface FetchParams {
	page?: number;
	pageSize?: number;
	sort?: SortSpec | null;
	filters?: FilterSpec;
	signal?: AbortSignal;
}

export interface PagedResult<T> {
	items: T[];
	pagination: Pagination;
}

/**
 * Fetch properties from the app API. Base URL comes from NEXT_PUBLIC_API_URL.
 */
export async function fetchProperties(
	params: FetchParams = {},
): Promise<PagedResult<any>> {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
	const page = params.page ?? 0;
	const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

	const url = new URL(
		`${baseUrl}/properties`,
		typeof window === "undefined" ? "http://localhost" : window.location.origin,
	);
	url.searchParams.set("page", String(page));
	url.searchParams.set("pageSize", String(pageSize));
	if (params.sort) {
		url.searchParams.set("sortField", params.sort.field);
		url.searchParams.set("sortDirection", params.sort.direction);
	}
	if (params.filters?.query) url.searchParams.set("q", params.filters.query);
	if (params.filters?.city) url.searchParams.set("city", params.filters.city);
	if (params.filters?.state)
		url.searchParams.set("state", params.filters.state);

	const res = await fetch(url.toString(), {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		signal: params.signal,
		// cache/revalidate can be managed at callsite if needed
	});
	if (!res.ok) throw new Error(`Failed to fetch properties: ${res.statusText}`);
	const json = await res.json();

	return {
		items: Array.isArray(json.items) ? json.items : json,
		pagination: {
			page,
			pageSize,
			total: Number(json.total ?? json.length ?? 0),
		},
	};
}
