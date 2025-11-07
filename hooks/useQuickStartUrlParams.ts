/**
 * Client-side hook for QuickStart URL parameters
 *
 * Uses nuqs for optimal Next.js App Router compatibility
 * Handles URL params like ?quickstart_persona=investor&quickstart_goal=investor-pipeline
 */

import {
	QUICKSTART_URL_PARAMS,
	type QuickStartUrlParams,
	validateGoalIdParam,
	validatePersonaIdParam,
} from "@/lib/utils/quickstart/urlParams";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { useMemo } from "react";

/**
 * Hook to read and manage QuickStart URL parameters
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { params, clearParams } = useQuickStartUrlParams();
 *
 *   if (params.shouldOpen) {
 *     // Auto-open wizard
 *   }
 *
 *   if (params.goalId) {
 *     // Pre-select goal
 *   }
 * }
 * ```
 */
export function useQuickStartUrlParams() {
	const [urlState, setUrlState] = useQueryStates(
		{
			[QUICKSTART_URL_PARAMS.PERSONA]: parseAsString.withDefault(""),
			[QUICKSTART_URL_PARAMS.GOAL]: parseAsString.withDefault(""),
			[QUICKSTART_URL_PARAMS.OPEN]: parseAsBoolean.withDefault(false),
			[QUICKSTART_URL_PARAMS.TEMPLATE]: parseAsString.withDefault(""),
		},
		{
			// Shallow routing - don't trigger full page navigation
			shallow: true,
			// Don't scroll on param change
			scroll: false,
		},
	);

	// Parse and validate the URL parameters
	const params: QuickStartUrlParams = useMemo(() => {
		const personaId = validatePersonaIdParam(
			urlState[QUICKSTART_URL_PARAMS.PERSONA] || null,
		);
		const goalId = validateGoalIdParam(
			urlState[QUICKSTART_URL_PARAMS.GOAL] || null,
		);
		const shouldOpen = urlState[QUICKSTART_URL_PARAMS.OPEN];
		const templateId = urlState[QUICKSTART_URL_PARAMS.TEMPLATE] || null;

		return {
			personaId,
			goalId,
			shouldOpen,
			templateId,
		};
	}, [urlState]);

	/**
	 * Clears all QuickStart URL parameters
	 * Use this after wizard opens to clean up the URL
	 */
	const clearParams = () => {
		setUrlState({
			[QUICKSTART_URL_PARAMS.PERSONA]: null,
			[QUICKSTART_URL_PARAMS.GOAL]: null,
			[QUICKSTART_URL_PARAMS.OPEN]: null,
			[QUICKSTART_URL_PARAMS.TEMPLATE]: null,
		});
	};

	/**
	 * Updates QuickStart URL parameters
	 */
	const setParams = (updates: Partial<QuickStartUrlParams>) => {
		setUrlState({
			...(updates.personaId !== undefined && {
				[QUICKSTART_URL_PARAMS.PERSONA]: updates.personaId,
			}),
			...(updates.goalId !== undefined && {
				[QUICKSTART_URL_PARAMS.GOAL]: updates.goalId,
			}),
			...(updates.shouldOpen !== undefined && {
				[QUICKSTART_URL_PARAMS.OPEN]: updates.shouldOpen,
			}),
			...(updates.templateId !== undefined && {
				[QUICKSTART_URL_PARAMS.TEMPLATE]: updates.templateId,
			}),
		});
	};

	return {
		params,
		urlState,
		clearParams,
		setParams,
	};
}

/**
 * Helper to check if any QuickStart URL params are present
 */
export function hasQuickStartUrlParams(params: QuickStartUrlParams): boolean {
	return Boolean(
		params.personaId || params.goalId || params.shouldOpen || params.templateId,
	);
}
