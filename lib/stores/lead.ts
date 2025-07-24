import { create } from 'zustand';
import { exportLeadsToExcel } from '../_utils/files/loopDownloadTableData';
import { toast } from 'sonner';
import { LeadTypeGlobal } from '@/types/_dashboard/leads';
import { MockUserProfile } from '@/constants/_faker/profile/userProfile';

// Define the state and actions for managing leads
interface LeadState {
  leads: LeadTypeGlobal[]; // Holds the lead data
  filteredLeads: LeadTypeGlobal[]; // Holds the filtered lead data
  filterByStatus: (
    status: 'all' | 'New Lead' | 'Contacted' | 'Closed' | 'Lost'
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
  filteredLeads: MockUserProfile.companyInfo.leads, // Start with no filter applied, showing all leads

  // Filter leads by status (New Lead, Contacted, Closed, Lost)
  filterByStatus: (status) => {
    const { leads } = get();
    let filteredLeads = leads;

    if (status !== 'all') {
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
      (lead) => lead.campaignID === campaignID
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

  // New function to export filtered leads to a ZIP file
  // New function to export filtered leads to a single Excel file
  exportFilteredLeadsToFile: async () => {
    const { filteredLeads } = get(); // Get the filtered leads from the state

    // Define the columns for the Excel export
    const columns = [
      { header: 'Lead ID', accessorKey: 'id' as keyof LeadTypeGlobal },
      {
        header: 'First Name',
        accessorKey: 'firstName' as keyof LeadTypeGlobal
      },
      { header: 'Last Name', accessorKey: 'lastName' as keyof LeadTypeGlobal },
      { header: 'Phone', accessorKey: 'phone' as keyof LeadTypeGlobal },
      { header: 'Email', accessorKey: 'email' as keyof LeadTypeGlobal },
      { header: 'Status', accessorKey: 'status' as keyof LeadTypeGlobal },
      { header: 'Follow Up', accessorKey: 'followUp' as keyof LeadTypeGlobal },
      {
        header: 'Campaign ID',
        accessorKey: 'campaignID' as keyof LeadTypeGlobal
      },
      { header: 'Address', accessorKey: 'address1' as keyof LeadTypeGlobal },
      { header: 'Social Media Profiles', accessorKey: 'socials' } // Single column for combined social links
    ];

    // Check if there are any leads to export
    if (filteredLeads.length === 0) {
      toast('No leads available for export.');
      return;
    }

    // Call the utility function to create the Excel file
    const excelBuffer = await exportLeadsToExcel(
      filteredLeads, // Pass the filtered leads
      columns, // Pass the column definitions
      'filtered_leads_export.xlsx' // This will be the filename
    );

    // Create a Blob from the Excel buffer and trigger download
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_leads_export.xlsx'; // Set the Excel file name
    document.body.appendChild(a);
    a.click(); // Trigger the download
    document.body.removeChild(a); // Remove the temporary link

    // Clean up the object URL after download
    window.URL.revokeObjectURL(url);
  }
}));
