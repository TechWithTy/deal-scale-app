import { ensureValidTier } from "@/constants/subscription/tiers";
import {
	getGoalDefinition,
	getGoalsForPersona,
	quickStartGoals,
	quickStartPersonas,
	type QuickStartGoalId,
	type QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import {
	mergeQuotaOverrides,
	normalizeTesterFlags,
} from "@/lib/demo/normalizeDemoPayload";
import type {
	DemoCRMProvider,
	DemoConfig,
	DemoROIProfileConfig,
	UserRole,
} from "@/types/user";
import type { QuickStartDefaults } from "@/types/userProfile";
import { getPermissionsForRole, type EditableUser } from "./userHelpers";

type Nullable<T> = T | null | undefined;

const BOOLEAN_TRUE = new Set(["true", "1", "yes", "on"]);
const BOOLEAN_FALSE = new Set(["false", "0", "no", "off"]);

const ROLE_ALIASES: Record<string, UserRole> = {
	admin: "admin",
	manager: "manager",
	member: "member",
	support: "support",
	"support-agent": "support",
	"platform-admin": "platform_admin",
	"platform-admins": "platform_admin",
	platformadmin: "platform_admin",
	"platform-support": "platform_support",
	platformsupport: "platform_support",
};

const CLIENT_TYPE_ALIASES: Record<string, DemoConfig["clientType"]> = {
	investor: "investor",
	wholesaler: "wholesaler",
	agent: "agent",
	realtor: "agent",
	"loan-officer": "loan_officer",
	lender: "loan_officer",
};

const CRM_PROVIDER_ALIASES: Record<string, DemoCRMProvider> = {
	gohighlevel: "gohighlevel",
	"go-high-level": "gohighlevel",
	ghl: "gohighlevel",
	salesforce: "salesforce",
	sf: "salesforce",
	hubspot: "hubspot",
	hub: "hubspot",
	close: "close",
	closecrm: "close",
	zoho: "zoho",
	other: "other",
};

const SOCIAL_KEYS = new Set([
	"facebook",
	"instagram",
	"linkedin",
	"twitter",
	"x",
	"youtube",
	"tiktok",
]);

const hasRelevantParams = (params: URLSearchParams): boolean => {
	const relevantKeys = [
		"demoUser",
		"user",
		"target",
		"email",
		"name",
		"role",
		"tier",
		"beta",
		"pilot",
		"persona",
		"goal",
		"company",
		"companyName",
		"logo",
		"website",
		"industry",
		"crm",
		"crmProvider",
		"phone",
		"phoneNumber",
		"address",
		"city",
		"state",
		"zip",
		"zipCode",
		"notes",
		"roiDealsPerMonth",
		"roiAvgDealValue",
		"roiMonths",
		"roiProfitMargin",
		"roiMonthlyOverhead",
		"roiHoursPerDeal",
		"aiAllotted",
		"aiUsed",
		"leadsAllotted",
		"leadsUsed",
		"skipAllotted",
		"skipUsed",
		"config",
		"config64",
		"autoLogin",
		"seed",
	];

	return relevantKeys.some((key) => params.has(key));
};

const coerceBoolean = (value: Nullable<string>): boolean | undefined => {
	if (value === null || value === undefined) return undefined;
	const normalized = value.trim().toLowerCase();
	if (BOOLEAN_TRUE.has(normalized)) return true;
	if (BOOLEAN_FALSE.has(normalized)) return false;
	return undefined;
};

const coerceNumber = (value: Nullable<string>): number | undefined => {
	if (value === null || value === undefined) return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const normalizeString = (value: Nullable<string>): string | undefined => {
	if (value === null || value === undefined) return undefined;
	const trimmed = value.trim();
	return trimmed.length ? trimmed : undefined;
};

export interface DemoLinkOverrides {
	readonly targetEmail?: string;
	readonly targetId?: string;
	readonly seedId?: string;
	readonly name?: string;
	readonly email?: string;
	readonly role?: UserRole;
	readonly tier?: string;
	readonly isBetaTester?: boolean;
	readonly isPilotTester?: boolean;
	readonly quickStartDefaults?: QuickStartDefaults;
	readonly demoConfig?: Partial<DemoConfig>;
	readonly quotas?: {
		readonly aiAllotted?: number;
		readonly aiUsed?: number;
		readonly leadsAllotted?: number;
		readonly leadsUsed?: number;
		readonly skipAllotted?: number;
		readonly skipUsed?: number;
	};
	readonly autoLogin?: boolean;
	readonly password?: string;
}

const resolveRole = (value: Nullable<string>): UserRole | undefined => {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	return ROLE_ALIASES[normalized];
};

const resolveClientType = (
	value: Nullable<string>,
): DemoConfig["clientType"] | undefined => {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	return CLIENT_TYPE_ALIASES[normalized];
};

const resolveCrmProvider = (
	value: Nullable<string>,
): DemoCRMProvider | undefined => {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	return CRM_PROVIDER_ALIASES[normalized];
};

const resolvePersona = (
	value: Nullable<string>,
): QuickStartPersonaId | undefined => {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	const directMatch = quickStartPersonas.find(
		(persona) => persona.id === normalized,
	);
	return directMatch?.id;
};

const resolveGoal = (value: Nullable<string>): QuickStartGoalId | undefined => {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();

	const directMatch = quickStartGoals.find(
		(goal) =>
			goal.id.toLowerCase() === normalized ||
			goal.title.toLowerCase() === normalized,
	);
	return directMatch?.id;
};

const decodeBase64 = (value: string): string | null => {
	try {
		if (typeof atob === "function") {
			return atob(value);
		}
	} catch (_error) {
		// Ignore and try fallback
	}

	if (typeof Buffer !== "undefined") {
		try {
			return Buffer.from(value, "base64").toString("utf-8");
		} catch (_error) {
			return null;
		}
	}

	return null;
};

const decodeConfigPayload = (
	params: URLSearchParams,
): Record<string, unknown> | null => {
	const raw = params.get("config") ?? params.get("config64");
	if (!raw) return null;

	const tryParse = (payload: string) => {
		try {
			const decoded = decodeURIComponent(payload);
			return JSON.parse(decoded) as Record<string, unknown>;
		} catch (_error) {
			return null;
		}
	};

	const parsedDirect = tryParse(raw);
	if (parsedDirect) return parsedDirect;

	const decoded = decodeBase64(raw);
	if (!decoded) return null;

	try {
		return JSON.parse(decoded) as Record<string, unknown>;
	} catch (_error) {
		return null;
	}
};

const mergeConfigPayload = (
	demoConfig: Partial<DemoConfig>,
	payload: Record<string, unknown>,
) => {
	for (const [key, value] of Object.entries(payload)) {
		if (value === undefined || value === null) continue;
		if (key === "social" && typeof value === "object") {
			const social = value as Record<string, unknown>;
			demoConfig.social = {
				...(demoConfig.social ?? {}),
				...Object.fromEntries(
					Object.entries(social).filter(
						([socialKey, socialValue]) =>
							SOCIAL_KEYS.has(socialKey) && typeof socialValue === "string",
					),
				),
			};
			continue;
		}
		if (key === "roiProfile" && typeof value === "object") {
			const roiPayload = value as Record<string, unknown>;
			const roiProfile: DemoROIProfileConfig = {
				...(demoConfig.roiProfile ?? {}),
			};
			for (const [roiKey, roiValue] of Object.entries(roiPayload)) {
				if (roiValue === undefined || roiValue === null) continue;
				const numeric =
					typeof roiValue === "number"
						? roiValue
						: Number.parseFloat(String(roiValue));
				if (Number.isFinite(numeric)) {
					roiProfile[roiKey as keyof DemoROIProfileConfig] = numeric;
				}
			}
			if (Object.keys(roiProfile).length > 0) {
				demoConfig.roiProfile = roiProfile;
			}
			continue;
		}
		if (key in demoConfig || key in (demoConfig as DemoConfig)) {
			(demoConfig as Record<string, unknown>)[key] = value;
		}
	}
};

export const parseDemoLinkOverrides = (
	params: URLSearchParams,
): DemoLinkOverrides | null => {
	if (!hasRelevantParams(params)) {
		return null;
	}

	const overrides: DemoLinkOverrides = {};
	const demoConfig: Partial<DemoConfig> = {};
	const quickStart: QuickStartDefaults = {};

	const target =
		params.get("demoUser") ?? params.get("user") ?? params.get("target");

	if (target) {
		const normalizedTarget = target.trim();
		if (normalizedTarget.includes("@")) {
			overrides.targetEmail = normalizedTarget.toLowerCase();
		} else {
			overrides.targetId = normalizedTarget;
		}
	}

	const seed = params.get("seed");
	if (seed) {
		overrides.seedId = seed.trim();
	}

	const name = normalizeString(params.get("name"));
	if (name) {
		overrides.name = name;
	}

	const email = normalizeString(params.get("email"));
	if (email) {
		overrides.email = email.toLowerCase();
	}

	const password = normalizeString(params.get("password"));
	if (password) {
		overrides.password = password;
	}

	const role = resolveRole(params.get("role"));
	if (role) {
		overrides.role = role;
	}

	const tier = normalizeString(params.get("tier"));
	if (tier) {
		overrides.tier = tier;
	}

	const beta = coerceBoolean(params.get("beta"));
	if (beta !== undefined) {
		overrides.isBetaTester = beta;
	}

	const pilot = coerceBoolean(params.get("pilot"));
	if (pilot !== undefined) {
		overrides.isPilotTester = pilot;
	}

	const personaId =
		resolvePersona(params.get("persona")) ??
		resolvePersona(params.get("quickstartPersona"));

	const goalId =
		resolveGoal(params.get("goal")) ??
		resolveGoal(params.get("quickstartGoal"));

	if (goalId) {
		const goalDefinition = getGoalDefinition(goalId);
		if (goalDefinition) {
			quickStart.personaId = goalDefinition.personaId;
			quickStart.goalId = goalDefinition.id;
			demoConfig.goal = goalDefinition.title;
			demoConfig.clientType =
				CLIENT_TYPE_ALIASES[goalDefinition.personaId] ?? demoConfig.clientType;
		}
	}

	if (personaId && !quickStart.personaId) {
		quickStart.personaId = personaId;
	}

	const clientTypeParam =
		params.get("clientType") ??
		params.get("client_type") ??
		params.get("segment");
	const resolvedClientType =
		resolveClientType(clientTypeParam) ??
		(quickStart.personaId
			? CLIENT_TYPE_ALIASES[quickStart.personaId]
			: undefined);

	if (resolvedClientType) {
		demoConfig.clientType = resolvedClientType;
	}

	const company =
		normalizeString(params.get("company")) ??
		normalizeString(params.get("companyName"));
	if (company) {
		demoConfig.companyName = company;
	}

	const logo = normalizeString(params.get("logo"));
	if (logo) {
		demoConfig.companyLogo = logo;
	}

	const website = normalizeString(params.get("website"));
	if (website) {
		demoConfig.website = website;
	}

	const industry = normalizeString(params.get("industry"));
	if (industry) {
		demoConfig.industry = industry;
	}

	const crmProviderParam =
		params.get("crmProvider") ??
		params.get("crm") ??
		params.get("crm_platform");
	const crmProvider = resolveCrmProvider(crmProviderParam);
	if (crmProvider) {
		demoConfig.crmProvider = crmProvider;
	}

	const roiDealsPerMonth = coerceNumber(params.get("roiDealsPerMonth"));
	const roiAvgDealValue = coerceNumber(params.get("roiAvgDealValue"));
	const roiMonths = coerceNumber(params.get("roiMonths"));
	const roiProfitMargin = coerceNumber(params.get("roiProfitMargin"));
	const roiMonthlyOverhead = coerceNumber(params.get("roiMonthlyOverhead"));
	const roiHoursPerDeal = coerceNumber(params.get("roiHoursPerDeal"));

	if (
		roiDealsPerMonth !== undefined ||
		roiAvgDealValue !== undefined ||
		roiMonths !== undefined ||
		roiProfitMargin !== undefined ||
		roiMonthlyOverhead !== undefined ||
		roiHoursPerDeal !== undefined
	) {
		const roiProfile: DemoROIProfileConfig = {
			...(demoConfig.roiProfile ?? {}),
		};

		if (roiDealsPerMonth !== undefined) {
			roiProfile.dealsPerMonth = roiDealsPerMonth;
		}
		if (roiAvgDealValue !== undefined) {
			roiProfile.avgDealValue = roiAvgDealValue;
		}
		if (roiMonths !== undefined) {
			roiProfile.months = roiMonths;
		}
		if (roiProfitMargin !== undefined) {
			roiProfile.profitMarginPercent = roiProfitMargin;
		}
		if (roiMonthlyOverhead !== undefined) {
			roiProfile.monthlyOverhead = roiMonthlyOverhead;
		}
		if (roiHoursPerDeal !== undefined) {
			roiProfile.hoursPerDeal = roiHoursPerDeal;
		}

		if (Object.keys(roiProfile).length > 0) {
			demoConfig.roiProfile = roiProfile;
		}
	}

	const phone =
		normalizeString(params.get("phone")) ??
		normalizeString(params.get("phoneNumber"));
	if (phone) {
		demoConfig.phoneNumber = phone;
	}

	const contactEmail = normalizeString(params.get("contactEmail"));
	if (contactEmail) {
		demoConfig.email = contactEmail;
	}

	const address = normalizeString(params.get("address"));
	if (address) {
		demoConfig.address = address;
	}

	const city = normalizeString(params.get("city"));
	if (city) {
		demoConfig.city = city;
	}

	const state = normalizeString(params.get("state"));
	if (state) {
		demoConfig.state = state;
	}

	const zip =
		normalizeString(params.get("zip")) ??
		normalizeString(params.get("zipCode"));
	if (zip) {
		demoConfig.zipCode = zip;
	}

	const notes = normalizeString(params.get("notes"));
	if (notes) {
		demoConfig.notes = notes;
	}

	for (const socialKey of SOCIAL_KEYS) {
		const value = normalizeString(params.get(socialKey));
		if (value) {
			demoConfig.social = {
				...(demoConfig.social ?? {}),
				[socialKey === "x" ? "twitter" : socialKey]: value,
			};
		}
	}

	const configPayload = decodeConfigPayload(params);
	if (configPayload) {
		mergeConfigPayload(demoConfig, configPayload);
	}

	if (Object.keys(demoConfig).length > 0) {
		overrides.demoConfig = demoConfig;
	}

	if (Object.keys(quickStart).length > 0) {
		overrides.quickStartDefaults = quickStart;
	}

	const aiAllotted = coerceNumber(params.get("aiAllotted"));
	const aiUsed = coerceNumber(params.get("aiUsed"));
	const leadsAllotted = coerceNumber(params.get("leadsAllotted"));
	const leadsUsed = coerceNumber(params.get("leadsUsed"));
	const skipAllotted = coerceNumber(params.get("skipAllotted"));
	const skipUsed = coerceNumber(params.get("skipUsed"));

	if (
		aiAllotted !== undefined ||
		aiUsed !== undefined ||
		leadsAllotted !== undefined ||
		leadsUsed !== undefined ||
		skipAllotted !== undefined ||
		skipUsed !== undefined
	) {
		overrides.quotas = {
			aiAllotted,
			aiUsed,
			leadsAllotted,
			leadsUsed,
			skipAllotted,
			skipUsed,
		};
	}

	const autoLogin = coerceBoolean(params.get("autoLogin"));
	if (autoLogin !== undefined) {
		overrides.autoLogin = autoLogin;
	}

	return overrides;
};

const cloneEditableUser = (user: EditableUser): EditableUser => {
	try {
		return structuredClone(user);
	} catch (_error) {
		return JSON.parse(JSON.stringify(user)) as EditableUser;
	}
};

export const applyDemoLinkOverrides = (
	baseUser: EditableUser,
	overrides: DemoLinkOverrides,
): EditableUser => {
	const user = cloneEditableUser(baseUser);

	if (overrides.name) {
		user.name = overrides.name;
	}

	if (overrides.email) {
		user.email = overrides.email;
	}

	if (overrides.password) {
		user.password = overrides.password;
	}

	if (overrides.role && overrides.role !== user.role) {
		user.role = overrides.role;
		const permissions = getPermissionsForRole(overrides.role);
		user.permissionList = [...permissions.list];
		user.permissions = permissions.matrix;
	}

	if (overrides.tier) {
		user.tier = ensureValidTier(overrides.tier);
	}

	if (
		overrides.isBetaTester !== undefined ||
		overrides.isPilotTester !== undefined
	) {
		const testerFlags = normalizeTesterFlags({
			isBetaTester: overrides.isBetaTester,
			isPilotTester: overrides.isPilotTester,
			fallback: {
				isBetaTester: user.isBetaTester,
				isPilotTester: user.isPilotTester,
			},
		});
		user.isBetaTester = testerFlags.isBetaTester;
		user.isPilotTester = testerFlags.isPilotTester;
	}

	if (overrides.demoConfig) {
		const nextDemoConfig: DemoConfig = {
			...(user.demoConfig ?? {}),
			...overrides.demoConfig,
		};
		if (overrides.demoConfig.social) {
			nextDemoConfig.social = {
				...(user.demoConfig?.social ?? {}),
				...overrides.demoConfig.social,
			};
		}
		if (overrides.demoConfig.roiProfile) {
			nextDemoConfig.roiProfile = {
				...(user.demoConfig?.roiProfile ?? {}),
				...overrides.demoConfig.roiProfile,
			};
		}
		user.demoConfig = nextDemoConfig;
	}

	if (overrides.quickStartDefaults) {
		user.quickStartDefaults = {
			...(user.quickStartDefaults ?? {}),
			...overrides.quickStartDefaults,
		};
	}

	if (overrides.quotas) {
		const merged = mergeQuotaOverrides({
			base: user.quotas,
			overrides: overrides.quotas,
		});
		user.quotas = merged;
		user.aiCredits = {
			...user.aiCredits,
			allotted: merged.ai.allotted,
			used: merged.ai.used,
		};
		user.leadsCredits = {
			...user.leadsCredits,
			allotted: merged.leads.allotted,
			used: merged.leads.used,
		};
		user.skipTracesCredits = {
			...user.skipTracesCredits,
			allotted: merged.skipTraces.allotted,
			used: merged.skipTraces.used,
		};
		user.subscription = {
			...user.subscription,
			aiCredits: {
				...user.subscription.aiCredits,
				allotted: merged.ai.allotted,
				used: merged.ai.used,
			},
			leads: {
				...user.subscription.leads,
				allotted: merged.leads.allotted,
				used: merged.leads.used,
			},
			skipTraces: {
				...user.subscription.skipTraces,
				allotted: merged.skipTraces.allotted,
				used: merged.skipTraces.used,
			},
		};
	}

	return user;
};

export const selectSeedUser = (
	users: readonly EditableUser[],
	overrides: DemoLinkOverrides,
): EditableUser | undefined => {
	if (!users.length) return undefined;
	const lowerCaseTargetEmail = overrides.targetEmail?.toLowerCase();

	if (lowerCaseTargetEmail) {
		const emailMatch = users.find(
			(user) => user.email.toLowerCase() === lowerCaseTargetEmail,
		);
		if (emailMatch) return emailMatch;
	}

	if (overrides.targetId) {
		const idMatch = users.find((user) => user.id === overrides.targetId);
		if (idMatch) return idMatch;
	}

	if (overrides.seedId) {
		const seedMatch =
			users.find((user) => user.id === overrides.seedId) ??
			users.find((user) => user.email === overrides.seedId);
		if (seedMatch) return seedMatch;
	}

	return users[0];
};
