import { create } from "zustand";
import type {
	DrawerItem,
	LoadMoreArgs,
	LoadMoreResult,
	ModalState,
} from "../types";

interface DrawerFlowState {
	isOpen: boolean;
	height: number | undefined;
	searchTerm: string;
	selectedIds: string[];
	items: DrawerItem[];
	hasMore: boolean;
	cursor: string | null;
	isLoading: boolean;
	pageSize: number;
	pageSizeOptions: number[];
	listNames: string[];
	modal: ModalState;
	// actions
	setOpen: (open: boolean) => void;
	setHeight: (h?: number) => void;
	setSearch: (q: string) => void;
	toggleSelect: (id: string) => void;
	selectAll: (ids: string[]) => void;
	clearSelected: () => void;
	setPageSize: (n: number) => void;
	loadInitial: (items?: DrawerItem[]) => void;
	loadMore: (
		fn: (args: LoadMoreArgs) => Promise<LoadMoreResult>,
	) => Promise<void>;
	setListNames: (names: string[]) => void;
	openModal: (mode: "create" | "add") => void;
	closeModal: () => void;
	setModalPending: (p: boolean) => void;
}

export const useDrawerFlowStore = create<DrawerFlowState>((set, get) => ({
	isOpen: false,
	height: undefined,
	searchTerm: "",
	selectedIds: [],
	items: [],
	hasMore: false,
	cursor: null,
	isLoading: false,
	pageSize: 12,
	pageSizeOptions: [12, 24, 48, 96],
	listNames: [],
	modal: { open: false, mode: "create", pending: false },

	setOpen: (open) => set({ isOpen: open }),
	setHeight: (h) => set({ height: h }),
	setSearch: (q) => set({ searchTerm: q }),
	toggleSelect: (id) => {
		const { selectedIds } = get();
		set({
			selectedIds: selectedIds.includes(id)
				? selectedIds.filter((x) => x !== id)
				: [...selectedIds, id],
		});
	},
	selectAll: (ids) => set({ selectedIds: [...ids] }),
	clearSelected: () => set({ selectedIds: [] }),
	setPageSize: (n) => set({ pageSize: n }),
	loadInitial: (items) =>
		set({ items: items ?? [], hasMore: !!items && items.length > 0 }),
	loadMore: async (fn) => {
		const { isLoading, pageSize, cursor, items } = get();
		if (isLoading) return;
		set({ isLoading: true });
		try {
			const res = await fn({ pageSize, cursor: cursor ?? undefined });
			set({
				items: [...items, ...res.items],
				hasMore: res.hasMore,
				cursor: res.cursor ?? null,
			});
		} finally {
			set({ isLoading: false });
		}
	},
	setListNames: (names) => set({ listNames: names }),
	openModal: (mode) => set({ modal: { open: true, mode, pending: false } }),
	closeModal: () =>
		set({ modal: { open: false, mode: "create", pending: false } }),
	setModalPending: (p) => set((s) => ({ modal: { ...s.modal, pending: p } })),
}));
