import featureAccessConfig from "./featureAccess.json";
import type { FeatureGuardMode } from "@/constants/subscription/tiers";
import {
	ensureValidTier,
	type SubscriptionTier,
} from "@/constants/subscription/tiers";
import type {
	PermissionAction,
	PermissionResource,
	UserQuotas,
} from "@/types/user";

export type FeatureQuotaKey = keyof UserQuotas;

export interface FeatureAccessRule {
	requiredTier: SubscriptionTier;
	mode: FeatureGuardMode;
	permission?: {
		resource: PermissionResource;
		action: PermissionAction;
	};
	quota?: FeatureQuotaKey;
}

type LeafRule = {
	requiredTier?: string;
	mode?: FeatureGuardMode;
	permission?: {
		resource?: string;
		action?: string;
	};
	quota?: string;
};
type FeatureAccessRecord = Record<string, LeafRule | any>;

const CONFIG = featureAccessConfig as FeatureAccessRecord;

const quotaKeys = new Set<FeatureQuotaKey>(["ai", "leads", "skipTraces"]);

function normalizePermission(
	value: LeafRule["permission"],
): FeatureAccessRule["permission"] | undefined {
	if (!value) return undefined;
	const resource = value.resource as PermissionResource | undefined;
	const action = value.action as PermissionAction | undefined;
	if (!resource || !action) return undefined;
	return { resource, action };
}

function normalizeQuota(
	value: string | undefined,
): FeatureQuotaKey | undefined {
	if (!value) return undefined;
	const key = value as FeatureQuotaKey;
	return quotaKeys.has(key) ? key : undefined;
}

export function getFeatureAccessRule(
	featureKey: string,
): FeatureAccessRule | null {
	if (!featureKey) return null;
	const segments = featureKey.split(".").map((segment) => segment.trim());
	let node: FeatureAccessRecord | LeafRule = CONFIG;
	for (const segment of segments) {
		if (!segment) return null;
		const next = (node as FeatureAccessRecord)[segment];
		if (!next) return null;
		node = next;
	}
	const leaf = node as LeafRule;
	if (!leaf.requiredTier || !leaf.mode) return null;
	return {
		requiredTier: ensureValidTier(leaf.requiredTier),
		mode: leaf.mode,
		permission: normalizePermission(leaf.permission),
		quota: normalizeQuota(leaf.quota),
	};
}

export function featureAccessKeys(): string[] {
	const keys: string[] = [];
	const walk = (node: FeatureAccessRecord | LeafRule, prefix: string[]) => {
		const leaf = node as LeafRule;
		if (leaf.requiredTier && leaf.mode) {
			keys.push(prefix.join("."));
		}
		for (const entry of Object.entries(node as FeatureAccessRecord)) {
			const [segment, value] = entry;
			if (value && typeof value === "object") {
				walk(value as FeatureAccessRecord | LeafRule, [...prefix, segment]);
			}
		}
	};
	walk(CONFIG, []);
	return keys;
}

export type FeatureAccessConfig = typeof featureAccessConfig;
