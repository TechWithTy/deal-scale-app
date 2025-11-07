"use client";

import {
	type FeatureAccessRule,
	type FeatureQuotaKey,
	getFeatureAccessRule,
} from "@/constants/features";
import {
	type FeatureGuardMode,
	type SubscriptionTier,
	type TierInput,
	ensureValidTier,
	hasRequiredTier,
} from "@/constants/subscription/tiers";
import { useUserSubscriptionStore } from "@/lib/stores/user/subscription";
import type { PermissionAction, PermissionResource } from "@/types/user";
import { useMemo } from "react";

export interface UseFeatureAccessGuardOptions {
	fallbackMode?: FeatureGuardMode;
	fallbackTier?: TierInput;
}

export interface UseFeatureAccessGuardResult {
	allowed: boolean;
	mode: FeatureGuardMode;
	requiredTier: SubscriptionTier;
	userTier: SubscriptionTier;
	rule: FeatureAccessRule | null;
	isUpgradeRequired: boolean;
	permissionRequirement?: {
		resource: PermissionResource;
		action: PermissionAction;
	};
	quotaKey?: FeatureQuotaKey;
}

const DEFAULT_MODE: FeatureGuardMode = "overlay";

export function useFeatureAccessGuard(
	featureKey: string,
	{
		fallbackMode = DEFAULT_MODE,
		fallbackTier,
	}: UseFeatureAccessGuardOptions = {},
): UseFeatureAccessGuardResult {
	const planName = useUserSubscriptionStore((state) => state.planName());

	return useMemo(() => {
		const userTier = ensureValidTier(planName);
		const rule = getFeatureAccessRule(featureKey);
		const effectiveMode = rule?.mode ?? fallbackMode;
		const requiredTier = rule
			? ensureValidTier(rule.requiredTier)
			: ensureValidTier(fallbackTier ?? userTier);
		const allowed =
			effectiveMode === "none" ? true : hasRequiredTier(userTier, requiredTier);
		return {
			allowed,
			mode: effectiveMode,
			requiredTier,
			userTier,
			rule,
			isUpgradeRequired: effectiveMode === "none" ? false : !allowed,
			permissionRequirement: rule?.permission,
			quotaKey: rule?.quota,
		};
	}, [featureKey, fallbackMode, fallbackTier, planName]);
}

export type { FeatureGuardMode };
