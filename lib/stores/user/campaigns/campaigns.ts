import { create } from "zustand";
import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { SocialMediaCampaign, CallCampaign } from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import type { GHLTextMessageCampaign } from "@/types/goHighLevel/text";

type CampaignTypeKey = "text" | "call" | "social" | "dm"; // dm = direct mail (alias for email)

type AnyCampaign = EmailCampaign | CallCampaign | GHLTextMessageCampaign | SocialMediaCampaign;

interface UserCampaignsState {
  currentType: CampaignTypeKey;
  items: AnyCampaign[];
  filtered: AnyCampaign[];
  setType: (t: CampaignTypeKey) => void;
  filterByStatus: (status: "all" | "scheduled" | "active" | "completed") => void;
  count: () => number;
}

function seedByType(t: CampaignTypeKey): AnyCampaign[] {
  const c = MockUserProfile?.companyInfo?.campaigns;
  switch (t) {
    case "text":
      return (c?.textCampaigns as GHLTextMessageCampaign[] | undefined) ?? [];
    case "call":
      return (c?.callCampaigns as CallCampaign[] | undefined) ?? [];
    case "social":
      return (c?.socialCampaigns as SocialMediaCampaign[] | undefined) ?? [];
    case "dm":
      // direct mail -> use email dataset
      return (c?.emailCampaigns as EmailCampaign[] | undefined) ?? [];
    default:
      return [];
  }
}

export const useUserCampaignsStore = create<UserCampaignsState>((set, get) => ({
  currentType: "call",
  items: seedByType("call"),
  filtered: seedByType("call"),

  setType: (t) => {
    const items = seedByType(t);
    set({ currentType: t, items, filtered: items });
  },

  filterByStatus: (status) => {
    const { items } = get();
    if (status === "all") {
      set({ filtered: items });
      return;
    }
    const filtered = items.filter((campaign) => {
      switch (status) {
        case "scheduled":
          return campaign.status === "pending" || campaign.status === "queued";
        case "active":
          return campaign.status === "delivering";
        case "completed":
          return campaign.status === "completed";
        default:
          return true;
      }
    });
    set({ filtered });
  },

  count: () => get().filtered.length,
}));

