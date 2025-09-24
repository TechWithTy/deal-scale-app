import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { SavedSearch } from "@/types/userProfile";
import { useUserProfileStore } from "../userProfile";

interface SavedSearchesState {
  list: () => SavedSearch[];
  createSavedSearch: (input: {
    name: string;
    searchCriteria: Record<string, unknown>;
    priority?: boolean;
  }) => string; // returns id
  updateSavedSearch: (
    id: string,
    patch: Partial<Pick<SavedSearch, "name" | "searchCriteria" | "priority">>,
  ) => void;
  deleteSavedSearch: (id: string) => void;
  runSavedSearch: (id: string) => Record<string, unknown> | null;
}

export const useSavedSearchesStore = create<SavedSearchesState>(() => ({
  list: () => useUserProfileStore.getState().userProfile?.savedSearches ?? [],

  createSavedSearch: ({ name, searchCriteria, priority }) => {
    const id = uuidv4();
    const now = new Date();
    const current = useUserProfileStore.getState().userProfile?.savedSearches ?? [];
    const next: SavedSearch[] = [
      ...current,
      {
        id,
        name,
        searchCriteria,
        createdAt: now,
        updatedAt: now,
        ...(priority !== undefined ? { priority } : {}),
      },
    ];
    useUserProfileStore.getState().updateUserProfile({ savedSearches: next });
    return id;
  },

  updateSavedSearch: (id, patch) => {
    const current = useUserProfileStore.getState().userProfile?.savedSearches ?? [];
    const next = current.map((s) =>
      s.id === id
        ? {
            ...s,
            ...patch,
            updatedAt: new Date(),
          }
        : s,
    );
    useUserProfileStore.getState().updateUserProfile({ savedSearches: next });
  },

  deleteSavedSearch: (id) => {
    const current = useUserProfileStore.getState().userProfile?.savedSearches ?? [];
    const next = current.filter((s) => s.id !== id);
    useUserProfileStore.getState().updateUserProfile({ savedSearches: next });
  },

  runSavedSearch: (id) => {
    const s = useUserProfileStore
      .getState()
      .userProfile?.savedSearches.find((x) => x.id === id);
    return s?.searchCriteria ?? null;
  },
}));

