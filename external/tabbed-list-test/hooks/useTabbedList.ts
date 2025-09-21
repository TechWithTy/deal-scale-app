/**
 * useTabbedList: UI hook exposing list state and common actions.
 */
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { loadProperties } from "../state/actions";
import { useTabbedListStore } from "../state/store";

export function useTabbedList(autoLoad: boolean = true) {
	const state = useTabbedListStore(
		useShallow((s) => ({
			items: s.items,
			loading: s.loading,
			error: s.error,
			pagination: s.pagination,
			sort: s.sort,
			filters: s.filters,
			selectedIds: s.selectedIds,
			activeTab: s.activeTab,
			drawer: s.drawer,
		})),
	);

	useEffect(() => {
		if (autoLoad) {
			void loadProperties();
		}
	}, [autoLoad]);

	return {
		...state,
		actions: {
			reload: () => loadProperties(),
			setPage: (page: number) => loadProperties({ page }),
			setPageSize: (pageSize: number) => loadProperties({ pageSize }),
			setSort: (sort: any) => loadProperties({ sort }),
			setFilters: (filters: any) => loadProperties({ filters }),
			toggleSelect: (id: string) =>
				useTabbedListStore.getState().toggleSelect(id),
			clearSelection: () => useTabbedListStore.getState().clearSelection(),
			setActiveTab: (tab: any) =>
				useTabbedListStore.getState().setActiveTab(tab),
			openDrawer: (item: any) => useTabbedListStore.getState().openDrawer(item),
			closeDrawer: () => useTabbedListStore.getState().closeDrawer(),
		},
	};
}
