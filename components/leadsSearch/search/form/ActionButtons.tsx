import SavedSearchModal from "@/components/reusables/modals/SavedSearchModal";
import { useLeadSearchStore } from "@/lib/stores/leadSearch/leadSearch";
import type { SavedSearch } from "@/types/userProfile";
import { Save } from "lucide-react";
import { useState } from "react";
import QuickSaveModal from "../../steps/QuickSaveModal";

interface ActionButtonsProps {
	isValid: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ isValid }) => {
	const [quickSaveOpen, setQuickSaveOpen] = useState(false);
	const [saveModalOpen, setSaveModalOpen] = useState(false);

	const {
		savedSearches,
		addSavedSearch,
		deleteSavedSearch,
		selectSavedSearch,
		setSearchPriority,
	} = useLeadSearchStore();

	const handleQuickSave = (name: string) => {
		addSavedSearch(name);
		setQuickSaveOpen(false);
	};

	const handleSelectSearch = (search: SavedSearch) => {
		selectSavedSearch(search);
		setSaveModalOpen(false);
	};

	return (
		<div className="mt-6 flex w-full flex-row flex-wrap items-center justify-center gap-3">
			{/* Save Search Button with Validation */}
			<div className="group relative flex">
				<button
					type="button"
					className={`flex items-center gap-2 rounded bg-orange-600 px-4 py-2 font-medium text-sm text-white shadow-sm transition dark:bg-orange-700 dark:text-white dark:hover:bg-orange-800 ${!isValid ? "cursor-not-allowed opacity-60" : "hover:bg-orange-700"}`}
					onClick={() => setQuickSaveOpen(true)}
					disabled={!isValid}
					aria-disabled={!isValid}
				>
					<Save size={18} />
					Save Search
				</button>
				{!isValid && (
					<span className="-bottom-8 -translate-x-1/2 pointer-events-none absolute left-1/2 z-10 w-max rounded bg-gray-800 px-3 py-1 text-white text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
						Enter valid search criteria to save
					</span>
				)}
			</div>
			{savedSearches.length > 0 && (
				<button
					type="button"
					className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 text-sm shadow-sm transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
					onClick={() => setSaveModalOpen(true)}
				>
					<Save size={18} />
					Saved Searches
				</button>
			)}

			<QuickSaveModal
				open={quickSaveOpen}
				onClose={() => setQuickSaveOpen(false)}
				onSave={handleQuickSave}
			/>
			<SavedSearchModal
				open={saveModalOpen}
				onClose={() => setSaveModalOpen(false)}
				savedSearches={savedSearches}
				onDelete={deleteSavedSearch}
				onSelect={handleSelectSearch}
				onSetPriority={setSearchPriority}
			/>
		</div>
	);
};

export default ActionButtons;
