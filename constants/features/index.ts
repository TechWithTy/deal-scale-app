import featureAccessConfig from "./features";
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

// Break the circular reference by using a discriminated union
type FeatureAccessNode = {
	__type: 'node';
	children: Record<string, FeatureAccessNode | LeafRule>;
};

type FeatureAccessRecord = FeatureAccessNode | LeafRule;

// Transform the flat config into the discriminated union structure
function transformConfig(config: any): FeatureAccessRecord {
	if (config && typeof config === 'object' && config.requiredTier && config.mode) {
		// This is a leaf rule
		return config as LeafRule;
	}

	if (config && typeof config === 'object' && !Array.isArray(config)) {
		// This is a node - transform children recursively
		const node: FeatureAccessNode = {
			__type: 'node',
			children: {}
		};

		for (const [key, value] of Object.entries(config)) {
			if (value && typeof value === 'object') {
				node.children[key] = transformConfig(value);
			}
		}

		return node;
	}

	// Fallback - shouldn't happen with properly structured config
	return {} as LeafRule;
}

const CONFIG = transformConfig(featureAccessConfig);

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

// Helper function to check if a node is a FeatureAccessNode
function isFeatureAccessNode(node: FeatureAccessRecord): node is FeatureAccessNode {
	return '__type' in node && node.__type === 'node';
}

// Helper function to check if a node is a LeafRule
function isLeafRule(node: FeatureAccessRecord): node is LeafRule {
	return !isFeatureAccessNode(node);
}

export function getFeatureAccessRule(
	featureKey: string,
): FeatureAccessRule | null {
	if (!featureKey) return null;
	const segments = featureKey.split(".").map((segment) => segment.trim());
	let node: FeatureAccessRecord = CONFIG;

	for (const segment of segments) {
		if (!segment) return null;

		// Handle discriminated union - check if it's a node or leaf
		if (isFeatureAccessNode(node)) {
			const next: FeatureAccessRecord = node.children[segment];
			if (!next) return null;
			node = next;
		} else {
			// We've reached a leaf but there are more segments
			return null;
		}
	}

	// At this point, node should be a leaf
	if (isLeafRule(node)) {
		const leaf = node;
		if (!leaf.requiredTier || !leaf.mode) return null;
		return {
			requiredTier: ensureValidTier(leaf.requiredTier),
			mode: leaf.mode,
			permission: normalizePermission(leaf.permission),
			quota: normalizeQuota(leaf.quota),
		};
	}

	return null;
}

export function featureAccessKeys(): string[] {
	const keys: string[] = [];
	const walk = (node: FeatureAccessRecord, prefix: string[]) => {
		if (isLeafRule(node)) {
			const leaf = node;
			if (leaf.requiredTier && leaf.mode) {
				keys.push(prefix.join("."));
			}
		} else if (isFeatureAccessNode(node)) {
			for (const [segment, value] of Object.entries(node.children)) {
				if (value) {
					walk(value, [...prefix, segment]);
				}
			}
		}
	};
	walk(CONFIG, []);
	return keys;
}

export type FeatureAccessConfig = typeof featureAccessConfig;

export { featureAccessConfig };
