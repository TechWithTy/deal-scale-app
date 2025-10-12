"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { SavedSearch } from "@/types/userProfile";

interface QuickStartSavedSearchHandlers {
	readonly savedSearches: SavedSearch[];
	readonly deleteSavedSearch: (id: string) => void;
	readonly setSearchPriority: (id: string) => void;
	readonly handleStartNewSearch: () => void;
	readonly handleOpenSavedSearches: () => void;
	readonly handleCloseSavedSearches: () => void;
	readonly handleSelectSavedSearch: (search: SavedSearch) => void;
	readonly savedSearchModalOpen: boolean;
}

export const useQuickStartSavedSearches = (): QuickStartSavedSearchHandlers => {
	const [savedSearchModalOpen, setSavedSearchModalOpen] = useState(false);
	const router = useRouter();
	const {
		savedSearches,
		deleteSavedSearch,
		selectSavedSearch,
		setSearchPriority,
	} = useLeadSearchStore();

	const handleStartNewSearch = useCallback(() => {
		router.push("/dashboard");
	}, [router]);

	const handleOpenSavedSearches = useCallback(() => {
		setSavedSearchModalOpen(true);
	}, []);

	const handleCloseSavedSearches = useCallback(() => {
		setSavedSearchModalOpen(false);
	}, []);

	const handleSelectSavedSearch = useCallback(
		(search: SavedSearch) => {
			selectSavedSearch(search);
			setSavedSearchModalOpen(false);
			router.push("/dashboard");
		},
		[router, selectSavedSearch],
	);

	return {
		savedSearches,
		deleteSavedSearch,
		setSearchPriority,
		handleStartNewSearch,
		handleOpenSavedSearches,
		handleCloseSavedSearches,
		handleSelectSavedSearch,
		savedSearchModalOpen,
	};
};
