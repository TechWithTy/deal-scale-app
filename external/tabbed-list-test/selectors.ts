/**
 * Pure selectors for deriving state slices.
 */
import type { PropertySummary, TabbedListStore } from "./store";

export const selectItems = (s: TabbedListStore) => s.items;
export const selectLoading = (s: TabbedListStore) => s.loading;
export const selectPagination = (s: TabbedListStore) => s.pagination;
export const selectSelectedIds = (s: TabbedListStore) => s.selectedIds;
export const selectActiveTab = (s: TabbedListStore) => s.activeTab;
export const selectDrawer = (s: TabbedListStore) => s.drawer;

export const selectSelectedItems = (s: TabbedListStore) => {
	const set = s.selectedIds;
	return s.items.filter((i) => set.has((i as any).id));
};
