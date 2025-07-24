import type { SavedSearch } from "@/types/userProfile";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
import { create } from "zustand";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";

const initialFilters: MapFormSchemaType = {
	location: "",
	marketStatus: undefined,
	beds: undefined,
	baths: undefined,
	propertyType: undefined,
	advanced: {},
};

interface LeadSearchState {
	filters: MapFormSchemaType;
	savedSearches: SavedSearch[];
	setFilters: (filters: Partial<MapFormSchemaType>) => void;
	addSavedSearch: (name: string) => void;
	deleteSavedSearch: (id: string) => void;
	selectSavedSearch: (search: SavedSearch) => void;
	setSearchPriority: (id: string) => void;
	initializeFromUrl: (query: URLSearchParams) => void;
}

export const useLeadSearchStore = create<LeadSearchState>((set, get) => ({
	filters: initialFilters,
	savedSearches: mockUserProfile.savedSearches || [],

	setFilters: (filters) =>
		set((state) => ({ filters: { ...state.filters, ...filters } })),

	addSavedSearch: (name) => {
		const { filters, savedSearches } = get();
		const newSearch: SavedSearch = {
			id: Date.now().toString(),
			name,
			createdAt: new Date(),
			searchCriteria: filters,
			updatedAt: new Date(),
			priority: false,
		};
		set({ savedSearches: [newSearch, ...savedSearches] });
	},

	deleteSavedSearch: (id) => {
		set((state) => ({
			savedSearches: state.savedSearches.filter((s) => s.id !== id),
		}));
	},

	selectSavedSearch: (search) => {
		set({ filters: search.searchCriteria as MapFormSchemaType });
	},

	setSearchPriority: (id) => {
		set((state) => ({
			savedSearches: state.savedSearches.map((s) => ({
				...s,
				priority: s.id === id,
			})),
		}));
	},

	initializeFromUrl: (query) => {
		const urlFilters: Partial<MapFormSchemaType> = {};
		const advancedFilters: Partial<MapFormSchemaType["advanced"]> = {};

		for (const [key, value] of query.entries()) {
			const keyTyped = key as keyof MapFormSchemaType;
			const advancedKeyTyped = key as keyof MapFormSchemaType["advanced"];

			if (
				initialFilters.advanced &&
				advancedKeyTyped in initialFilters.advanced
			) {
				switch (advancedKeyTyped) {
					case "mlsOnly":
					case "foreclosure":
					case "extraPropertyData":
					case "excludePending":
						advancedFilters[advancedKeyTyped] = value === "true";
						break;
					default:
						advancedFilters[advancedKeyTyped] = value;
				}
			} else if (keyTyped in initialFilters) {
				urlFilters[keyTyped as keyof MapFormSchemaType] = value;
			}
		}

		if (Object.keys(advancedFilters).length > 0) {
			urlFilters.advanced = advancedFilters;
		}

		get().setFilters(urlFilters);
	},
}));
