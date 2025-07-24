import { create } from 'zustand';

import { CallCampaign, SocialMediaCampaign } from '@/types/_dashboard/campaign';
import { EmailCampaign } from '@/types/goHighLevel/email';
import { GHLTextMessageCampaign } from '@/types/goHighLevel/text';
import { MockUserProfile } from '@/constants/_faker/profile/userProfile';
// Define the campaign state and actions for Zustand
interface CampaignState {
  currentCampaignType: 'email' | 'call' | 'text' | 'social'; // Track the current campaign type
  currentCampaign: (
    | EmailCampaign
    | CallCampaign
    | GHLTextMessageCampaign
    | SocialMediaCampaign
  )[]; // Holds the currently active campaign data
  filteredCampaigns: (
    | EmailCampaign
    | CallCampaign
    | GHLTextMessageCampaign
    | SocialMediaCampaign
  )[]; // Holds the filtered campaigns
  setCampaignType: (type: 'email' | 'call' | 'text' | 'social') => void;
  filterCampaignsByStatus: (
    status: 'all' | 'scheduled' | 'active' | 'completed'
  ) => void;
  getNumberOfCampaigns: () => number;
}

// Create Zustand store
export const useCampaignStore = create<CampaignState>((set, get) => ({
  currentCampaignType: 'call', // Default to 'call'
  currentCampaign: MockUserProfile.companyInfo.campaigns.callCampaigns, // Default campaign data (calls)
  filteredCampaigns: MockUserProfile.companyInfo.campaigns.callCampaigns, // Start with no filter applied, showing all campaigns

  // Action to set the current campaign type and update the campaign data accordingly
  setCampaignType: (type) => {
    let campaignData: (
      | EmailCampaign
      | CallCampaign
      | GHLTextMessageCampaign
      | SocialMediaCampaign
    )[] = [];

    // Update `currentCampaign` and `filteredCampaigns` based on selected type
    switch (type) {
      case 'email':
        campaignData = MockUserProfile.companyInfo.campaigns.emailCampaigns; // Email campaign data
        break;
      case 'call':
        campaignData = MockUserProfile.companyInfo.campaigns.callCampaigns; // Call campaign data
        break;
      case 'text':
        campaignData = MockUserProfile.companyInfo.campaigns.textCampaigns; // Text message campaign data
        break;
      case 'social':
        campaignData = MockUserProfile.companyInfo.campaigns.socialCampaigns; // Social media campaign data
        break;
      default:
        campaignData = [];
    }

    // Set the new campaign data for both `currentCampaign` and `filteredCampaigns`
    set({
      currentCampaignType: type,
      currentCampaign: campaignData,
      filteredCampaigns: campaignData
    });
  },

  // Action to filter campaigns by status
  filterCampaignsByStatus: (status) => {
    const { currentCampaign } = get();
    let filteredCampaigns = currentCampaign;

    // Apply filtering based on the status
    switch (status) {
      case 'scheduled':
        filteredCampaigns = currentCampaign.filter(
          (campaign) =>
            campaign.status === 'pending' || campaign.status === 'queued'
        );
        break;
      case 'active':
        filteredCampaigns = currentCampaign.filter(
          (campaign) => campaign.status === 'delivering'
        );
        break;
      case 'completed':
        filteredCampaigns = currentCampaign.filter(
          (campaign) => campaign.status === 'completed'
        );
        break;
      case 'all':
      default:
        // For 'all', we don't filter and just show all campaigns
        filteredCampaigns = currentCampaign;
        break;
    }

    // Set the filtered campaigns
    set({ filteredCampaigns });
  },

  // Getter for the number of campaigns in the current type
  getNumberOfCampaigns: () => {
    const { filteredCampaigns } = get();
    return filteredCampaigns.length || 0;
  }
}));
