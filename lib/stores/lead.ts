import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import { toast } from "sonner";
import { create } from "zustand";

import { exportLeadsToExcel } from "../_utils/files/loopDownload/leadExports";
import { leadExcelColumns } from "@/components/tables/lead-tables/LeadColumns"; // * Import Excel columns for export
// Define the state and actions for managing leads
interface LeadState {
	leads: LeadTypeGlobal[]; // Holds the lead data
	filteredLeads: LeadTypeGlobal[]; // Holds the filtered lead data
	filterByStatus: (
		status: "all" | "New Lead" | "Contacted" | "Closed" | "Lost",
	) => void; // Filter by status
	filterByFollowUp: (startDate: string, endDate: string) => void; // Filter by follow-up date range
	filterByCampaignID: (campaignID: string) => void; // Filter by campaign ID
	resetFilters: () => void; // Reset all filters
	getNumberOfLeads: () => number; // Get the count of filtered leads
	exportFilteredLeadsToFile: () => Promise<void>; // New export function
}

// Create Zustand store for lead management
export const useLeadStore = create<LeadState>((set, get) => ({
	leads: MockUserProfile.companyInfo.leads, // Initial leads data
	// * Export filtered leads to Excel file
	exportFilteredLeadsToFile: async () => {
		try {
			const filteredLeads = get().filteredLeads;
			// * Use leadExcelColumns for export
			const buffer = await exportLeadsToExcel(
				filteredLeads,
				leadExcelColumns,
				`filtered_leads_${new Date().toISOString().slice(0, 10)}.xlsx`,
			);
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `filtered_leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
			toast.success("Filtered leads exported successfully!");
		} catch (error) {
			toast.error("Failed to export filtered leads.");
		}
	},
	filteredLeads: MockUserProfile.companyInfo.leads, // Start with no filter applied, showing all leads

	// Filter leads by status (New Lead, Contacted, Closed, Lost)
	filterByStatus: (status) => {
		const { leads } = get();
		let filteredLeads = leads;

		if (status !== "all") {
			filteredLeads = leads.filter((lead) => lead.status === status);
		}

		set({ filteredLeads });
	},

	// Filter leads by follow-up date range (inclusive)
	filterByFollowUp: (startDate, endDate) => {
		const { leads } = get();
		const filteredLeads = leads.filter((lead) => {
			if (lead.followUp) {
				const followUpDate = new Date(lead.followUp);
				const start = new Date(startDate);
				const end = new Date(endDate);
				return followUpDate >= start && followUpDate <= end;
			}
			return false; // Exclude leads without follow-up dates
		});

		// Check if no leads were found for today
		if (filteredLeads.length === 0) {
			toast("No leads found for today's follow-ups.");
			return;
		}

		set({ filteredLeads });
	},

	// Filter leads by campaign ID
	filterByCampaignID: (campaignID) => {
		const { leads } = get();
		const filteredLeads = leads.filter(
			(lead) => lead.campaignID === campaignID,
		);

		set({ filteredLeads });
	},

	// Reset all filters to show all leads
	resetFilters: () => {
		const { leads } = get();
		set({ filteredLeads: leads });
	},

	// Get the number of filtered leads
	getNumberOfLeads: () => {
		const { filteredLeads } = get();
		return filteredLeads.length;
	},
}));
