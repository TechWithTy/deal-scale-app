export const SUBSCRIPTION_TIERS = ["Basic", "Starter", "Enterprise"] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export type TierInput = SubscriptionTier | string | null | undefined;

const tierOrder = new Map<SubscriptionTier, number>(
	SUBSCRIPTION_TIERS.map((tier, index) => [tier, index] as const),
);

export function normalizeTier(input: TierInput): SubscriptionTier {
	if (typeof input === "string") {
		const normalized = input.trim().toLowerCase();
		for (const tier of SUBSCRIPTION_TIERS) {
			if (tier.toLowerCase() === normalized) {
				return tier;
			}
		}
	}
	if (SUBSCRIPTION_TIERS.includes(input as SubscriptionTier)) {
		return input as SubscriptionTier;
	}
	return SUBSCRIPTION_TIERS[0];
}

export function compareTiers(a: TierInput, b: TierInput): number {
	const normalizedA = normalizeTier(a);
	const normalizedB = normalizeTier(b);
	return (
		(tierOrder.get(normalizedA) ?? 0) - (tierOrder.get(normalizedB) ?? 0)
	);
}

export function hasRequiredTier(
	userTier: TierInput,
	requiredTier: TierInput,
): boolean {
	return compareTiers(userTier, requiredTier) >= 0;
}

export type FeatureGuardMode = "hide" | "disable" | "overlay";

export type GuardBehaviorKey =
	| "allowed"
	| "hidden"
	| "disabled"
	| "overlay-blocked";

export function resolveGuardBehavior(
	allowed: boolean,
	mode: FeatureGuardMode,
): GuardBehaviorKey {
	if (allowed) return "allowed";
	switch (mode) {
		case "hide":
			return "hidden";
		case "disable":
			return "disabled";
		case "overlay":
		default:
			return "overlay-blocked";
	}
}

export function ensureValidTier(tier: TierInput): SubscriptionTier {
	return normalizeTier(tier);
}
