"use client";

import { useMemo } from "react";
import {
	ensureValidTier,
	hasRequiredTier,
	type FeatureGuardMode,
	type SubscriptionTier,
	type TierInput,
} from "@/constants/subscription/tiers";
import {
	getFeatureAccessRule,
	type FeatureAccessRule,
	type FeatureQuotaKey,
} from "@/constants/features";
import { useUserSubscriptionStore } from "@/lib/stores/user/subscription";
import type { PermissionAction, PermissionResource } from "@/types/user";

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
