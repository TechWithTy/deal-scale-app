/**
 * Zustand store for tabbed list and drawer state.
 */
import { create } from "zustand";
import type {
	DrawerState,
	FilterSpec,
	Pagination,
	PropertySummary,
	SortSpec,
	TabKey,
	TabbedListState,
} from "../schemas/types";
import { DEFAULT_PAGE_SIZE } from "../data/constants";

interface Actions<T = PropertySummary> {
	setItems: (items: T[]) => void;
	setLoading: (v: boolean) => void;
	setError: (msg: string | null) => void;
	setPagination: (p: Pagination) => void;
	setSort: (s: SortSpec | null) => void;
	setFilters: (f: Partial<FilterSpec>) => void;
	toggleSelect: (id: string) => void;
	selectAll: (ids: string[]) => void;
	clearSelection: () => void;
	setActiveTab: (tab: TabKey) => void;
	openDrawer: (item: T) => void;
	closeDrawer: () => void;
	setCurrentItem: (item: T | null) => void;
}

export type TabbedListStore<T = PropertySummary> = TabbedListState<T> &
	Actions<T>;

export const useTabbedListStore = create<TabbedListStore>((set, get) => ({
	items: [],
	loading: false,
	error: null,
	pagination: { page: 0, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
	sort: null,
	filters: {},
	selectedIds: new Set<string>(),
	activeTab: "results",
	drawer: { open: false, currentItem: null } as DrawerState,

	setItems: (items) => set({ items }),
	setLoading: (v) => set({ loading: v }),
	setError: (msg) => set({ error: msg }),
	setPagination: (p) => set({ pagination: p }),
	setSort: (s) => set({ sort: s }),
	setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
	toggleSelect: (id) =>
		set((state) => {
			const next = new Set(state.selectedIds);
			next.has(id) ? next.delete(id) : next.add(id);
			return { selectedIds: next };
		}),
	selectAll: (ids) => set({ selectedIds: new Set(ids) }),
	clearSelection: () => set({ selectedIds: new Set() }),
	setActiveTab: (tab) => set({ activeTab: tab }),
	openDrawer: (item) => set({ drawer: { open: true, currentItem: item } }),
	closeDrawer: () =>
		set((state) => ({ drawer: { ...state.drawer, open: false } })),
	setCurrentItem: (item) =>
		set((state) => ({ drawer: { ...state.drawer, currentItem: item } })),
}));
