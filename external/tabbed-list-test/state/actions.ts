/**
 * Async actions that orchestrate services, adapters, and the store.
 */
import { useTabbedListStore } from "./store";
import type { FilterSpec, SortSpec } from "../schemas/types";
import { fetchProperties } from "../data/services";
import { toPropertySummary } from "../data/adapters";

/**
 * Load property list with current store params, override via args.
 */
export async function loadProperties(opts?: {
	page?: number;
	pageSize?: number;
	sort?: SortSpec | null;
	filters?: Partial<FilterSpec>;
}) {
	const s = useTabbedListStore.getState();
	s.setLoading(true);
	s.setError(null);
	try {
		if (opts?.filters) s.setFilters(opts.filters);
		if (
			typeof opts?.page !== "undefined" ||
			typeof opts?.pageSize !== "undefined"
		) {
			s.setPagination({
				...s.pagination,
				page: opts.page ?? s.pagination.page,
				pageSize: opts.pageSize ?? s.pagination.pageSize,
				total: s.pagination.total,
			});
		}
		if (typeof opts?.sort !== "undefined") s.setSort(opts.sort ?? null);

		const { items, pagination } = await fetchProperties({
			page: s.pagination.page,
			pageSize: s.pagination.pageSize,
			sort: s.sort,
			filters: s.filters,
		});
		const mapped = items.map(toPropertySummary);
		s.setItems(mapped);
		s.setPagination({ ...pagination, total: pagination.total });
	} catch (e: any) {
		s.setError(e?.message ?? "Failed to load properties");
	} finally {
		s.setLoading(false);
	}
}

/**
 * Example action: open drawer for a given id if present in items.
 */
export function openDrawerById(id: string) {
	const s = useTabbedListStore.getState();
	const item = s.items.find((i) => (i as any).id === id) || null;
	if (item) s.openDrawer(item as any);
}
