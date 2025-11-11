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
import { useUserStore } from "@/lib/stores/userStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
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
	const userStoreTier = useUserStore((state) => state.tier);
	const sessionStoreTier = useSessionStore((state) => state.user?.tier);

	return useMemo(() => {
		const tierCandidates: TierInput[] = [
			planName,
			userStoreTier,
			sessionStoreTier,
			fallbackTier,
		];
		const resolvedTierInput =
			tierCandidates.find(
				(candidate) =>
					typeof candidate === "string" && candidate.trim().length > 0,
			) ?? planName;
		const userTier = ensureValidTier(resolvedTierInput);
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
	}, [
		featureKey,
		fallbackMode,
		fallbackTier,
		planName,
		userStoreTier,
		sessionStoreTier,
	]);
}

export type { FeatureGuardMode };
