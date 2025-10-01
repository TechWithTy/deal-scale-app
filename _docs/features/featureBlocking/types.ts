export type FeatureGuardMode = "overlay" | "disable" | "popover" | "hide" | "none";

export const FeatureGuardModes = {
	OVERLAY: "overlay" as FeatureGuardMode,
	DISABLE: "disable" as FeatureGuardMode,
	POPOVER: "popover" as FeatureGuardMode,
	HIDE: "hide" as FeatureGuardMode,
	NONE: "none" as FeatureGuardMode,
} as const;

export type FeatureBlockingConfiguration = {
	[key: string]: {
		requiredTier: SubscriptionTier;
		mode: FeatureGuardMode;
	};
};

export type FeatureQuotaKey = {
	featureKey: string;
	quotaAmount: number;
};

export type FeatureOverride = {
	resource: PermissionResource;
	action: PermissionAction;
};

export type SubscriptionTier = "Free" | "Starter" | "Enterprise";

export type PermissionResource = "campaigns" | "aiAssistants" | "userProfile" | "boards" | "navigation";

export type PermissionAction = "createCampaign" | "table" | "cloneVoice" | "page";
