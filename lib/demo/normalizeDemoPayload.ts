import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import type { SubscriptionTier } from "@/constants/subscription/tiers";
import { ensureValidTier } from "@/constants/subscription/tiers";
import type { DemoConfig, UserQuotas } from "@/types/user";
import type { QuickStartDefaults } from "@/types/userProfile";

type Nullable<T> = T | null | undefined;

interface DeriveQuickStartDefaultsParams {
	readonly demoConfig?: Nullable<DemoConfig>;
	readonly fallback?: Nullable<QuickStartDefaults>;
}

interface GoalRule {
	readonly personaId: QuickStartPersonaId;
	readonly goalId: QuickStartGoalId;
	readonly matchers: readonly (readonly string[])[];
}

const CLIENT_TYPE_TO_PERSONA: Record<string, QuickStartPersonaId> = {
	investor: "investor",
	wholesaler: "wholesaler",
	agent: "agent",
	loan_officer: "loan_officer",
};

const GOAL_RULES: readonly GoalRule[] = [
	{
		personaId: "agent",
		goalId: "agent-sphere",
		matchers: [
			["sphere"],
			["past", "client"],
			["nurture", "lead"],
			["generate", "lead"],
		],
	},
	{
		personaId: "agent",
		goalId: "agent-expansion",
		matchers: [
			["expand", "team"],
			["recruit"],
			["buyer", "team"],
			["listing", "appointment"],
		],
	},
	{
		personaId: "wholesaler",
		goalId: "wholesaler-dispositions",
		matchers: [["vip", "buyer"], ["disposition"], ["distribute", "contract"]],
	},
	{
		personaId: "wholesaler",
		goalId: "wholesaler-acquisitions",
		matchers: [
			["source", "inventory"],
			["motivated", "seller"],
			["acquisition"],
			["acquire", "deal"],
		],
	},
	{
		personaId: "investor",
		goalId: "investor-market",
		matchers: [
			["research", "market"],
			["market", "analysis"],
			["model", "deal"],
		],
	},
	{
		personaId: "investor",
		goalId: "investor-pipeline",
		matchers: [
			["pipeline"],
			["deal", "flow"],
			["seller", "outreach"],
			["off", "market"],
		],
	},
	{
		personaId: "loan_officer",
		goalId: "lender-fund-fast",
		matchers: [["loan"], ["fund"], ["deploy", "capital"], ["close", "loan"]],
	},
];

const cleanText = (value: string | undefined): string =>
	(value ?? "")
		.toLowerCase()
		.replace(/[\u2019']/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();

const matchesRule = (text: string, rule: GoalRule): boolean =>
	rule.matchers.some((group) =>
		group.every((keyword) => text.includes(keyword)),
	);

const derivePersonaFromClientType = (
	clientType: Nullable<DemoConfig["clientType"]>,
): QuickStartPersonaId | null => {
	if (!clientType) return null;
	const normalized = clientType.toString().toLowerCase().trim();
	return CLIENT_TYPE_TO_PERSONA[normalized] ?? null;
};

const deriveGoalFromText = (
	text: string,
): { personaId: QuickStartPersonaId; goalId: QuickStartGoalId } | null => {
	if (!text) return null;
	for (const rule of GOAL_RULES) {
		if (matchesRule(text, rule)) {
			return { personaId: rule.personaId, goalId: rule.goalId };
		}
	}
	return null;
};

const mergeDefaults = (
	derived: QuickStartDefaults | null,
	fallback: Nullable<QuickStartDefaults>,
): QuickStartDefaults | null => {
	if (!derived || !Object.keys(derived).length) {
		return fallback ?? null;
	}

	const result: QuickStartDefaults = {};
	if (derived.personaId) {
		result.personaId = derived.personaId;
	} else if (fallback?.personaId) {
		result.personaId = fallback.personaId;
	}
	if (derived.goalId) {
		result.goalId = derived.goalId;
	} else if (fallback?.goalId) {
		result.goalId = fallback.goalId;
	}

	return Object.keys(result).length ? result : (fallback ?? null);
};

export function deriveQuickStartDefaults({
	demoConfig,
	fallback,
}: DeriveQuickStartDefaultsParams): QuickStartDefaults | null {
	if (!demoConfig) {
		return fallback ?? null;
	}

	const personaFromClient = derivePersonaFromClientType(demoConfig.clientType);
	const goalMatch = deriveGoalFromText(cleanText(demoConfig.goal));

	const derivedPersona = goalMatch?.personaId ?? personaFromClient;
	const derived: QuickStartDefaults = {};
	if (derivedPersona) {
		derived.personaId = derivedPersona;
	}
	if (goalMatch?.goalId) {
		derived.goalId = goalMatch.goalId;
	}

	return mergeDefaults(derived, fallback);
}

export interface NormalizeTesterFlagsInput {
	readonly isBetaTester?: unknown;
	readonly isPilotTester?: unknown;
	readonly fallback?: {
		isBetaTester?: boolean;
		isPilotTester?: boolean;
	} | null;
}

export const normalizeTesterFlags = ({
	isBetaTester,
	isPilotTester,
	fallback,
}: NormalizeTesterFlagsInput): {
	isBetaTester: boolean;
	isPilotTester: boolean;
} => {
	const coerceBoolean = (value: unknown, fallbackValue: boolean): boolean => {
		if (typeof value === "boolean") return value;
		if (typeof value === "number") {
			return !Number.isNaN(value) && value !== 0;
		}
		if (typeof value === "string") {
			const normalized = value.trim().toLowerCase();
			if (!normalized) return fallbackValue;
			if (["true", "1", "yes", "on"].includes(normalized)) return true;
			if (["false", "0", "no", "off"].includes(normalized)) return false;
		}
		return fallbackValue;
	};

	const beta = coerceBoolean(isBetaTester, Boolean(fallback?.isBetaTester));
	const pilot = coerceBoolean(isPilotTester, Boolean(fallback?.isPilotTester));

	return { isBetaTester: beta, isPilotTester: pilot };
};

export interface NormalizeQuotaOverridesInput {
	readonly base: UserQuotas;
	readonly overrides?: {
		readonly aiAllotted?: unknown;
		readonly aiUsed?: unknown;
		readonly leadsAllotted?: unknown;
		readonly leadsUsed?: unknown;
		readonly skipAllotted?: unknown;
		readonly skipUsed?: unknown;
	};
}

const coerceNumber = (value: unknown): number | undefined => {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value >= 0 ? value : undefined;
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed) return undefined;
		const parsed = Number(trimmed);
		if (Number.isFinite(parsed) && parsed >= 0) {
			return parsed;
		}
	}
	return undefined;
};

export const mergeQuotaOverrides = ({
	base,
	overrides,
}: NormalizeQuotaOverridesInput): UserQuotas => {
	if (!overrides) {
		return base;
	}

	const clamp = (used: number | undefined, allotted: number | undefined) => {
		if (allotted === undefined || used === undefined) return used;
		return Math.min(used, allotted);
	};

	const aiAllotted = coerceNumber(overrides.aiAllotted) ?? base.ai.allotted;
	const aiUsed =
		clamp(coerceNumber(overrides.aiUsed), aiAllotted) ?? base.ai.used;
	const leadsAllotted =
		coerceNumber(overrides.leadsAllotted) ?? base.leads.allotted;
	const leadsUsed =
		clamp(coerceNumber(overrides.leadsUsed), leadsAllotted) ?? base.leads.used;
	const skipAllotted =
		coerceNumber(overrides.skipAllotted) ?? base.skipTraces.allotted;
	const skipUsed =
		clamp(coerceNumber(overrides.skipUsed), skipAllotted) ??
		base.skipTraces.used;

	return {
		ai: { ...base.ai, allotted: aiAllotted, used: aiUsed },
		leads: { ...base.leads, allotted: leadsAllotted, used: leadsUsed },
		skipTraces: {
			...base.skipTraces,
			allotted: skipAllotted,
			used: skipUsed,
		},
	};
};

export interface NormalizeTierInput {
	readonly tier?: unknown;
	readonly fallback?: SubscriptionTier;
}

export const normalizeTier = ({
	tier,
	fallback,
}: NormalizeTierInput): SubscriptionTier => {
	if (typeof tier === "string" && tier.trim()) {
		return ensureValidTier(tier);
	}
	return fallback ?? ensureValidTier(undefined);
};

export interface ResolveLogoUrlInput {
	readonly demoConfig?: Nullable<DemoConfig>;
	readonly fallback?: Nullable<string>;
}

export const resolveDemoLogoUrl = ({
	demoConfig,
	fallback,
}: ResolveLogoUrlInput): string | undefined => {
	const logo = demoConfig?.companyLogo ?? fallback ?? undefined;
	if (!logo) return undefined;
	const trimmed = logo.trim();
	if (!trimmed) return undefined;

	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	if (trimmed.startsWith("/")) {
		return trimmed;
	}

	try {
		const url = new URL(trimmed);
		if (url.protocol === "http:" || url.protocol === "https:") {
			return url.href;
		}
	} catch (_error) {
		// Ignore invalid URLs
	}

	return undefined;
};
