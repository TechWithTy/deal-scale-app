import type { FeatureGuardMode, SubscriptionTier } from "@/constants/subscription/tiers";

export type FeatureAccessLeaf = {
	requiredTier: SubscriptionTier | string;
	mode: FeatureGuardMode;
};

export type FeatureAccessConfig = {
	[key: string]: FeatureAccessLeaf | FeatureAccessConfig;
};

export const featureAccessConfig: FeatureAccessConfig = {
	campaigns: {
		createCampaign: {
			directMail: {
				requiredTier: "Enterprise",
				mode: "overlay",
			},
			socialMedia: {
				requiredTier: "Starter",
				mode: "overlay",
			},
		},
		table: {
			directMail: {
				requiredTier: "Enterprise",
				mode: "overlay",
			},
			socialMedia: {
				requiredTier: "Starter",
				mode: "overlay",
			},
		},
	},
	userProfile: {
		cloneVoice: {
			requiredTier: "Starter",
			mode: "overlay",
		},
	},
	navigation: {
		aiAssistants: {
			requiredTier: "Starter",
			mode: "disable",
		},
		propertySearch: {
			requiredTier: "Starter",
			mode: "none",
		},
		kanban: {
			requiredTier: "Enterprise",
			mode: "overlay",
		},
		campaignManager: {
			requiredTier: "Enterprise",
			mode: "none",
		},
		leadLists: {
			requiredTier: "Starter",
			mode: "none",
		},
		chat: {
			requiredTier: "Starter",
			mode: "overlay",
		},
		calculators: {
			requiredTier: "Starter",
			mode: "none",
		},
		employee: {
			requiredTier: "Enterprise",
			mode: "none",
		},
		quickStart: {
			requiredTier: "Basic",
			mode: "none",
		},
	},
};

export default featureAccessConfig;
