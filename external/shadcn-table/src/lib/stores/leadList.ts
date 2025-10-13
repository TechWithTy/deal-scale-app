import { create } from "zustand";
import { LEAD_LISTS_MOCK } from "../../constants/leadLists.mock";

// Define the state and actions for managing lead lists
interface LeadListState {
	leadLists: Array<{
		id: string;
		listName: string;
		records: number;
		leads?: Array<any>;
	}>;
}

// Create Zustand store for lead list management
export const useLeadListStore = create<LeadListState>((set, get) => ({
	// Initialize with mock data since this is a standalone submodule
	leadLists: LEAD_LISTS_MOCK.map((mock) => ({
		id: mock.id,
		listName: mock.name,
		records: 0, // Default to 0 records for mock data
		leads: [], // Empty leads array for mock data
	})),
}));
