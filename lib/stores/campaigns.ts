import { createWithEqualityFn } from "zustand/traditional";
import { withAnalytics } from "./_middleware/analytics";

import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { CallCampaign } from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import type { DirectMailCampaign } from "external/shadcn-table/src/examples/DirectMail/utils/mock";

type CampaignChannel = "email" | "call" | "text" | "social" | "direct";

type CampaignCollections = {
	call: CallCampaign[];
	text: CallCampaign[];
	social: CallCampaign[];
	email: EmailCampaign[];
	direct: DirectMailCampaign[];
};

type CampaignRecord = CampaignCollections[keyof CampaignCollections][number];

type RegisterPayload =
	| { channel: "call"; campaign: CallCampaign }
	| { channel: "text"; campaign: CallCampaign }
	| { channel: "social"; campaign: CallCampaign }
	| { channel: "email"; campaign: EmailCampaign }
	| { channel: "direct"; campaign: DirectMailCampaign };

interface CampaignState {
	currentCampaignType: CampaignChannel;
	campaignsByType: CampaignCollections;
	currentCampaign: CampaignRecord[];
	filteredCampaigns: CampaignRecord[];
	setCampaignType: (type: CampaignChannel) => void;
	filterCampaignsByStatus: (
		status: "all" | "scheduled" | "active" | "completed",
	) => void;
	getNumberOfCampaigns: () => number;
	registerLaunchedCampaign: (payload: RegisterPayload) => void;
	reset: () => void;
}

const profile = MockUserProfile;
const baseCampaignData: CampaignCollections = {
	call: Array.isArray(profile?.companyInfo.campaigns.callCampaigns)
		? [...profile.companyInfo.campaigns.callCampaigns]
		: [],
	text: [],
	social: [],
	email: Array.isArray(profile?.companyInfo.campaigns.emailCampaigns)
		? [...profile.companyInfo.campaigns.emailCampaigns]
		: [],
	direct: [],
};

const createInitialState = (): CampaignState => {
	const campaignsByType: CampaignCollections = {
		call: [...baseCampaignData.call],
		text: [...baseCampaignData.text],
		social: [...baseCampaignData.social],
		email: [...baseCampaignData.email],
		direct: [...baseCampaignData.direct],
	};
	const defaultType: CampaignChannel = "call";
	const defaultCampaigns = campaignsByType[defaultType];

	return {
		currentCampaignType: defaultType,
		campaignsByType,
		currentCampaign: [...defaultCampaigns],
		filteredCampaigns: [...defaultCampaigns],
		setCampaignType: () => undefined,
		filterCampaignsByStatus: () => undefined,
		getNumberOfCampaigns: () => 0,
		registerLaunchedCampaign: () => undefined,
		reset: () => undefined,
	} as CampaignState;
};

const mergeById = <T extends { id: string }>(
	existing: T[],
	incoming: T,
): T[] => {
	const withoutIncoming = existing.filter((entry) => entry.id !== incoming.id);
	return [...withoutIncoming, incoming];
};

// Create Zustand store
export const useCampaignStore = createWithEqualityFn<CampaignState>()(
	withAnalytics<CampaignState>("campaigns", (set, get) => {
		const initial = createInitialState();

		return {
			...initial,
			setCampaignType: (type) => {
				const campaigns = get().campaignsByType[type] ?? [];
				set({
					currentCampaignType: type,
					currentCampaign: [...campaigns],
					filteredCampaigns: [...campaigns],
				});
			},
			filterCampaignsByStatus: (status) => {
				const { currentCampaign } = get();
				let filteredCampaigns = currentCampaign;

				switch (status) {
					case "scheduled":
						filteredCampaigns = currentCampaign.filter(
							(campaign) =>
								campaign.status === "pending" || campaign.status === "queued",
						);
						break;
					case "active":
						filteredCampaigns = currentCampaign.filter(
							(campaign) => campaign.status === "delivering",
						);
						break;
					case "completed":
						filteredCampaigns = currentCampaign.filter(
							(campaign) => campaign.status === "completed",
						);
						break;
					default:
						filteredCampaigns = currentCampaign;
						break;
				}

				set({ filteredCampaigns });
			},
			getNumberOfCampaigns: () => get().filteredCampaigns.length || 0,
			registerLaunchedCampaign: ({ channel, campaign }) => {
				set((state) => {
					const nextCollection: CampaignCollections = {
						...state.campaignsByType,
					};

					switch (channel) {
						case "call":
							nextCollection.call = mergeById(
								state.campaignsByType.call,
								campaign,
							);
							break;
						case "text":
							nextCollection.text = mergeById(
								state.campaignsByType.text,
								campaign,
							);
							break;
						case "social":
							nextCollection.social = mergeById(
								state.campaignsByType.social,
								campaign,
							);
							break;
						case "email":
							nextCollection.email = mergeById(
								state.campaignsByType.email,
								campaign,
							);
							break;
						case "direct":
							nextCollection.direct = mergeById(
								state.campaignsByType.direct,
								campaign,
							);
							break;
					}

					const updates: Partial<CampaignState> = {
						campaignsByType: nextCollection,
					};

					if (state.currentCampaignType === channel) {
						const nextCampaigns = nextCollection[channel] as CampaignRecord[];
						updates.currentCampaign = [...nextCampaigns];
						updates.filteredCampaigns = [...nextCampaigns];
					}

					return updates;
				});
			},
			reset: () => {
				const next = createInitialState();
				set({
					currentCampaignType: next.currentCampaignType,
					campaignsByType: next.campaignsByType,
					currentCampaign: next.currentCampaign,
					filteredCampaigns: next.filteredCampaigns,
				});
			},
		};
	}),
	Object.is,
);
