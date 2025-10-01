import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { LeadList } from "@/types/_dashboard/leadList";
import { toast } from "sonner";
import { create } from "zustand";
import { withAnalytics } from "./_middleware/analytics";
import { exportLeadListsToZip } from "../_utils/files/loopDownload/leadExports";
// Define the state and actions for managing lead lists
interface LeadListState {
	leadLists: LeadList[]; // Holds the lead list data
	filteredLeadLists: LeadList[]; // Holds the filtered lead list data
	filterByRecordsRange: (range: "all" | "0-500" | "500-1000" | "1000+") => void; // Filter by records range
	filterByUploadDate: (
		range: "all" | "Last 7 Days" | "Last 30 Days" | "Last 90 Days",
	) => void; // Filter by upload date
	resetFilters: () => void; // Reset all filters
	exportFilteredLeadListsToZip: () => Promise<void>; // New export function
	addLeadList: (list: Omit<LeadList, "id" | "uploadDate">) => void; // Add new lead list
}

// Create Zustand store for lead list management
export const useLeadListStore = create<LeadListState>(
	withAnalytics<LeadListState>("lead_lists", (set, get) => ({
		leadLists: MockUserProfile?.companyInfo.leadLists ?? [], // Fallback to empty when profile is unavailable
		filteredLeadLists: MockUserProfile?.companyInfo.leadLists ?? [], // Start with no filter applied, showing all lead lists

		// Add new lead list to the store
		addLeadList: (newList) => {
			console.log("🗂️ Adding lead list to store:", newList.listName);
			console.log("📋 Lead list data:", newList);
			const { leadLists } = get();
			const listWithMetadata: LeadList = {
				...newList,
				id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				uploadDate: new Date().toISOString(),
			};
			console.log("✨ Created lead list with metadata:", listWithMetadata);
			const updatedLists = [listWithMetadata, ...leadLists];
			console.log("📦 Updated lead lists count:", updatedLists.length);
			set({ leadLists: updatedLists, filteredLeadLists: updatedLists });
			toast.success(`Added new lead list: ${newList.listName}`);
		},

		// Filter lead lists by records range
		filterByRecordsRange: (range) => {
			const { leadLists } = get();
			let filteredLeadLists = leadLists;

			if (range !== "all") {
				filteredLeadLists = leadLists.filter((list) => {
					if (range === "0-500") return list.records <= 500;
					if (range === "500-1000")
						return list.records > 500 && list.records <= 1000;
					if (range === "1000+") return list.records > 1000;
				});
			}

			set({ filteredLeadLists });
		},

		// Filter lead lists by upload date range
		filterByUploadDate: (range) => {
			const { leadLists } = get();
			const filteredLeadLists = leadLists.filter((list) => {
				const uploadDate = new Date(list.uploadDate);
				const currentDate = new Date();

				if (range === "Last 7 Days") {
					return (
						uploadDate >=
						new Date(currentDate.setDate(currentDate.getDate() - 7))
					);
				}
				if (range === "Last 30 Days") {
					return (
						uploadDate >=
						new Date(currentDate.setDate(currentDate.getDate() - 30))
					);
				}
				if (range === "Last 90 Days") {
					return (
						uploadDate >=
						new Date(currentDate.setDate(currentDate.getDate() - 90))
					);
				}

				return true; // Default to no filtering (range === 'all')
			});

			set({ filteredLeadLists });
		},

		// Reset all filters to show all lead lists
		resetFilters: () => {
			const { leadLists } = get();
			set({ filteredLeadLists: leadLists });
		},

		// Export filtered lead lists to a ZIP file
		exportFilteredLeadListsToZip: async () => {
			const { filteredLeadLists } = get(); // Get the filtered lead lists from the state

			// Check if there are any lead lists to export
			if (filteredLeadLists.length === 0) {
				toast("No lead lists available for export.");
				return;
			}

			// Call the utility function to export the lead lists to a ZIP file
			const zipBuffer: Uint8Array =
				await exportLeadListsToZip(filteredLeadLists);
			if (!zipBuffer) {
				toast("Failed to generate ZIP file.");
				return;
			}
			// Create a Blob from the ZIP buffer and trigger download
			const arrayBuffer = zipBuffer.buffer as ArrayBuffer;
			const blob = new Blob([arrayBuffer], { type: "application/zip" });
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "lead_lists_export.zip"; // Set the ZIP file name
			document.body.appendChild(a);
			a.click(); // Trigger the download
			document.body.removeChild(a); // Remove the temporary link

			// Clean up the object URL after download
			window.URL.revokeObjectURL(url);
		},
	})),
);
