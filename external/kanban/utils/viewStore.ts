import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KanbanTask, Priority, Status } from "./types";

export type SortField =
	| "dueDate"
	| "scheduledDate"
	| "priority"
	| "title"
	| "status";
export type SortDirection = "asc" | "desc";

export interface ViewFilters {
	status: Status[]; // empty = no filter
	priority: Priority[]; // empty = no filter
	assignedToTeamMember: string[]; // empty = no filter
}

export interface ViewSort {
	field: SortField;
	direction: SortDirection;
}

export interface ViewState {
	searchQuery: string;
	filters: ViewFilters;
	sort: ViewSort;
	// Which fields to show on the card preview area (caller decides how to use this)
	previewFields: Array<keyof KanbanTask>;
	// Optional user-saved filters snapshot
	savedFilters?: ViewFilters | null;
}

interface Actions {
	setSearchQuery: (q: string) => void;
	setFilters: (filters: Partial<ViewFilters>) => void;
	clearFilters: () => void;
	// Force-write whatever the current filters are to persisted storage (mostly a UX affordance)
	saveFilters: () => void;
	// Save current filters to savedFilters snapshot
	saveCurrentFilters: () => void;
	// Load savedFilters snapshot into active filters (noop if none)
	loadSavedFilters: () => void;
	// Clear savedFilters snapshot
	clearSavedFilters: () => void;
	setSort: (sort: Partial<ViewSort>) => void;
	setPreviewFields: (fields: Array<keyof KanbanTask>) => void;
	resetView: () => void;
	// Derived helper that consumers can call to get visible tasks
	deriveVisibleTasks: (tasks: KanbanTask[]) => KanbanTask[];
}

const defaultState: ViewState = {
	searchQuery: "",
	filters: {
		status: [],
		priority: [],
		assignedToTeamMember: [],
	},
	sort: { field: "dueDate", direction: "asc" },
	previewFields: ["priority", "dueDate", "assignedToTeamMember"],
	savedFilters: null,
};

// Priority sort helper
const priorityRank: Record<Priority, number> = {
	low: 1,
	medium: 2,
	high: 3,
} as const;

function textIncludes(haystack: string | undefined, needle: string): boolean {
	if (!needle) return true;
	if (!haystack) return false;
	return haystack.toLowerCase().includes(needle.toLowerCase());
}

function applyFilters(tasks: KanbanTask[], v: ViewState): KanbanTask[] {
	const { filters, searchQuery } = v;
	return tasks.filter((t) => {
		// status
		if (filters.status.length > 0 && !filters.status.includes(t.status))
			return false;
		// priority
		if (
			filters.priority.length > 0 &&
			(!t.priority || !filters.priority.includes(t.priority))
		)
			return false;
		// assignee
		if (
			filters.assignedToTeamMember.length > 0 &&
			(!t.assignedToTeamMember ||
				!filters.assignedToTeamMember.includes(String(t.assignedToTeamMember)))
		)
			return false;
		// search (title + description)
		const matchesSearch =
			textIncludes(t.title, searchQuery) ||
			textIncludes(t.description, searchQuery);
		if (!matchesSearch) return false;
		return true;
	});
}

function applySort(tasks: KanbanTask[], sort: ViewSort): KanbanTask[] {
	const dir = sort.direction === "asc" ? 1 : -1;
	return [...tasks].sort((a, b) => {
		switch (sort.field) {
			case "title":
				return dir * a.title.localeCompare(b.title);
			case "status":
				return dir * String(a.status).localeCompare(String(b.status));
			case "priority": {
				const ap = a.priority ? priorityRank[a.priority] : 0;
				const bp = b.priority ? priorityRank[b.priority] : 0;
				return dir * (ap - bp);
			}
			case "scheduledDate": {
				const av = a.scheduledDate ? Date.parse(a.scheduledDate) : 0;
				const bv = b.scheduledDate ? Date.parse(b.scheduledDate) : 0;
				return dir * (av - bv);
			}
			case "dueDate":
			default: {
				const av = a.dueDate ? Date.parse(a.dueDate) : 0;
				const bv = b.dueDate ? Date.parse(b.dueDate) : 0;
				return dir * (av - bv);
			}
		}
	});
}

export const useKanbanView = create<ViewState & Actions>()(
	persist(
		(set, get) => ({
			...defaultState,
			setSearchQuery: (q) => set({ searchQuery: q }),
			setFilters: (filters) =>
				set((s) => ({
					filters: {
						status: filters.status ?? s.filters.status,
						priority: filters.priority ?? s.filters.priority,
						assignedToTeamMember:
							filters.assignedToTeamMember ?? s.filters.assignedToTeamMember,
					},
				})),
			clearFilters: () =>
				set((s) => ({ filters: { ...defaultState.filters } })),
			saveFilters: () => set((s) => ({ filters: { ...s.filters } })),
			saveCurrentFilters: () =>
				set((s) => ({ savedFilters: { ...s.filters } })),
			loadSavedFilters: () =>
				set((s) => ({
					filters: s.savedFilters ? { ...s.savedFilters } : { ...s.filters },
				})),
			clearSavedFilters: () => set({ savedFilters: null }),
			setSort: (sort) =>
				set((s) => ({
					sort: {
						field: sort.field ?? s.sort.field,
						direction: sort.direction ?? s.sort.direction,
					},
				})),
			setPreviewFields: (fields) => set({ previewFields: fields }),
			resetView: () => set({ ...defaultState }),
			deriveVisibleTasks: (tasks) => {
				const v = get();
				const filtered = applyFilters(tasks, v);
				const sorted = applySort(filtered, v.sort);
				return sorted;
			},
		}),
		{ name: "external-kanban-view-store" },
	),
);
