import { create } from "zustand";
import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { LeadStatus, LeadTypeGlobal } from "@/types/_dashboard/leads";

type StatusCounts = Record<LeadStatus, number>;

interface DNCFlagsBreakdown {
  smsOptOut: number;
  emailOptOut: number;
  callOptOut: number;
  dmOptOut: number;
}

interface DNCSummary {
  totalDNC: number;
  byFlag: DNCFlagsBreakdown;
  bySource: Record<string, number>; // e.g., "Text Opt-out": 10
}

interface LeadsReportsState {
  statusCounts: () => StatusCounts;
  dncSummary: () => DNCSummary;
  perCampaignCounts: () => Record<string, number>;
}

function seedLeads(): LeadTypeGlobal[] {
  return (MockUserProfile?.companyInfo?.leads as LeadTypeGlobal[] | undefined) ?? [];
}

export const useUserLeadsReportsStore = create<LeadsReportsState>(() => ({
  statusCounts: () => {
    const leads = seedLeads();
    const counts: StatusCounts = {
      "New Lead": 0,
      Contacted: 0,
      Closed: 0,
      Lost: 0,
    };
    for (const l of leads) {
      const s = l.status as LeadStatus;
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  },

  dncSummary: () => {
    const leads = seedLeads();
    const byFlag: DNCFlagsBreakdown = {
      smsOptOut: 0,
      emailOptOut: 0,
      callOptOut: 0,
      dmOptOut: 0,
    };
    const bySource: Record<string, number> = {};
    let totalDNC = 0;
    for (const l of leads) {
      const hadFlag = Boolean(
        l.smsOptOut || l.emailOptOut || l.callOptOut || l.dmOptOut || l.dncList,
      );
      if (hadFlag) totalDNC += 1;
      if (l.smsOptOut) byFlag.smsOptOut += 1;
      if (l.emailOptOut) byFlag.emailOptOut += 1;
      if (l.callOptOut) byFlag.callOptOut += 1;
      if (l.dmOptOut) byFlag.dmOptOut += 1;
      const src = l.dncSource;
      if (src) bySource[src] = (bySource[src] ?? 0) + 1;
    }
    return { totalDNC, byFlag, bySource };
  },

  perCampaignCounts: () => {
    const leads = seedLeads();
    const acc: Record<string, number> = {};
    for (const l of leads) {
      const id = l.campaignID;
      if (!id) continue;
      acc[id] = (acc[id] ?? 0) + 1;
    }
    return acc;
  },
}));

