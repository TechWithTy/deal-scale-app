/**
 * QuickStart Wizard URL Parameter Utilities
 *
 * Enables deep linking and auto-selection via URL parameters:
 * - ?quickstart_persona=investor
 * - ?quickstart_goal=investor-pipeline
 * - ?quickstart_open=true
 *
 * SSR-safe and fully validated.
 */

import {
	getGoalDefinition,
	getPersonaDefinition,
	type QuickStartPersonaId,
	type QuickStartGoalId,
} from "@/lib/config/quickstart/wizardFlows";

/**
 * URL parameter keys for QuickStart wizard
 */
export const QUICKSTART_URL_PARAMS = {
	PERSONA: "quickstart_persona",
	GOAL: "quickstart_goal",
	OPEN: "quickstart_open",
	TEMPLATE: "quickstart_template",
} as const;

/**
 * Valid persona IDs that can be passed via URL
 */
const VALID_PERSONA_IDS: readonly QuickStartPersonaId[] = [
	"investor",
	"wholesaler",
	"agent",
	"lender",
] as const;

/**
 * Valid goal IDs that can be passed via URL
 */
const VALID_GOAL_IDS: readonly QuickStartGoalId[] = [
	"investor-pipeline",
	"investor-market",
	"wholesaler-dispositions",
	"wholesaler-acquisitions",
	"agent-sphere",
	"agent-expansion",
	"lender-fund-fast",
] as const;

/**
 * Parsed QuickStart URL parameters
 */
export interface QuickStartUrlParams {
	personaId: QuickStartPersonaId | null;
	goalId: QuickStartGoalId | null;
	shouldOpen: boolean;
	templateId: string | null;
}

/**
 * Validates a persona ID from URL parameter
 *
 * @returns Valid persona ID or null if invalid
 */
export function validatePersonaIdParam(
	value: string | null | undefined,
): QuickStartPersonaId | null {
	if (!value) return null;

	const normalized = value.toLowerCase().trim();

	if (VALID_PERSONA_IDS.includes(normalized as QuickStartPersonaId)) {
		return normalized as QuickStartPersonaId;
	}

	console.warn(`[QuickStart URL] Invalid persona ID: ${value}`);
	return null;
}

/**
 * Validates a goal ID from URL parameter
 *
 * @returns Valid goal ID or null if invalid
 */
export function validateGoalIdParam(
	value: string | null | undefined,
): QuickStartGoalId | null {
	if (!value) return null;

	const normalized = value.toLowerCase().trim();

	if (VALID_GOAL_IDS.includes(normalized as QuickStartGoalId)) {
		// Double-check that the goal actually exists
		const definition = getGoalDefinition(normalized as QuickStartGoalId);
		if (definition) {
			return normalized as QuickStartGoalId;
		}
	}

	console.warn(`[QuickStart URL] Invalid goal ID: ${value}`);
	return null;
}

/**
 * Validates boolean parameter (for shouldOpen flag)
 */
export function validateBooleanParam(
	value: string | null | undefined,
): boolean {
	if (!value) return false;

	const normalized = value.toLowerCase().trim();
	return normalized === "true" || normalized === "1" || normalized === "yes";
}

/**
 * Parses all QuickStart-related URL parameters
 *
 * SSR-safe: Can be called on server or client
 *
 * @example
 * ```ts
 * // Client-side with useSearchParams
 * const searchParams = useSearchParams();
 * const params = parseQuickStartUrlParams(searchParams);
 *
 * // Server-side with Next.js searchParams
 * const params = parseQuickStartUrlParams(searchParams);
 * ```
 */
export function parseQuickStartUrlParams(
	searchParams:
		| URLSearchParams
		| ReadonlyURLSearchParams
		| Record<string, string | string[] | undefined>
		| null
		| undefined,
): QuickStartUrlParams {
	if (!searchParams) {
		return {
			personaId: null,
			goalId: null,
			shouldOpen: false,
			templateId: null,
		};
	}

	// Handle both URLSearchParams and plain objects
	const get = (key: string): string | null => {
		if (searchParams instanceof URLSearchParams) {
			return searchParams.get(key);
		}

		// Plain object (Next.js searchParams)
		const value = searchParams[key];
		if (Array.isArray(value)) {
			return value[0] ?? null;
		}
		return value ?? null;
	};

	const personaId = validatePersonaIdParam(get(QUICKSTART_URL_PARAMS.PERSONA));
	const goalId = validateGoalIdParam(get(QUICKSTART_URL_PARAMS.GOAL));
	const shouldOpen = validateBooleanParam(get(QUICKSTART_URL_PARAMS.OPEN));
	const templateId = get(QUICKSTART_URL_PARAMS.TEMPLATE);

	// Validate goal matches persona if both are present
	if (personaId && goalId) {
		const goalDef = getGoalDefinition(goalId);
		if (goalDef && goalDef.personaId !== personaId) {
			console.warn(
				`[QuickStart URL] Goal/Persona mismatch: ${goalId} belongs to ${goalDef.personaId}, not ${personaId}. Using goal's persona.`,
			);
			// Use goal's persona since it's more specific
			return {
				personaId: goalDef.personaId,
				goalId,
				shouldOpen,
				templateId,
			};
		}
	}

	return {
		personaId,
		goalId,
		shouldOpen,
		templateId,
	};
}

/**
 * Builds a QuickStart wizard URL with parameters
 *
 * @example
 * ```ts
 * const url = buildQuickStartUrl('/dashboard', {
 *   personaId: 'investor',
 *   goalId: 'investor-pipeline',
 *   shouldOpen: true
 * });
 * // Result: "/dashboard?quickstart_persona=investor&quickstart_goal=investor-pipeline&quickstart_open=true"
 * ```
 */
export function buildQuickStartUrl(
	basePath: string,
	options: {
		personaId?: QuickStartPersonaId | null;
		goalId?: QuickStartGoalId | null;
		shouldOpen?: boolean;
		templateId?: string | null;
	},
): string {
	const params = new URLSearchParams();

	if (options.personaId) {
		params.set(QUICKSTART_URL_PARAMS.PERSONA, options.personaId);
	}

	if (options.goalId) {
		params.set(QUICKSTART_URL_PARAMS.GOAL, options.goalId);
	}

	if (options.shouldOpen) {
		params.set(QUICKSTART_URL_PARAMS.OPEN, "true");
	}

	if (options.templateId) {
		params.set(QUICKSTART_URL_PARAMS.TEMPLATE, options.templateId);
	}

	const queryString = params.toString();
	return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Clears QuickStart URL parameters
 *
 * Use this after the wizard is opened to clean up the URL
 */
export function clearQuickStartUrlParams(
	currentSearchParams: URLSearchParams,
): URLSearchParams {
	const cleaned = new URLSearchParams(currentSearchParams);

	cleaned.delete(QUICKSTART_URL_PARAMS.PERSONA);
	cleaned.delete(QUICKSTART_URL_PARAMS.GOAL);
	cleaned.delete(QUICKSTART_URL_PARAMS.OPEN);
	cleaned.delete(QUICKSTART_URL_PARAMS.TEMPLATE);

	return cleaned;
}
