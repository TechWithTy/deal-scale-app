/**
 * Validates QuickStart defaults to ensure goal matches persona
 *
 * This prevents invalid combinations that would cause the wizard to not pre-select properly.
 */

import {
	getGoalDefinition,
	type QuickStartPersonaId,
	type QuickStartGoalId,
} from "@/lib/config/quickstart/wizardFlows";
import type { QuickStartDefaults } from "@/types/userProfile";

/**
 * Validates that a goalId matches its expected personaId
 *
 * @returns true if valid, false if mismatch or invalid goalId
 */
export function isValidGoalForPersona(
	goalId: QuickStartGoalId | undefined | null,
	personaId: QuickStartPersonaId | undefined | null,
): boolean {
	if (!goalId || !personaId) return true; // If either is missing, no conflict

	const goalDefinition = getGoalDefinition(goalId);

	if (!goalDefinition) {
		console.warn(`[QuickStart] Invalid goalId: ${goalId}`);
		return false;
	}

	if (goalDefinition.personaId !== personaId) {
		console.warn(
			`[QuickStart] Goal/Persona mismatch: ${goalId} belongs to ${goalDefinition.personaId}, not ${personaId}`,
		);
		return false;
	}

	return true;
}

/**
 * Validates and sanitizes QuickStartDefaults
 *
 * If the goal doesn't match the persona, it removes the invalid goal
 * and logs a warning to help debug.
 */
export function validateQuickStartDefaults(
	defaults: QuickStartDefaults | undefined | null,
): QuickStartDefaults | undefined {
	if (!defaults) return undefined;

	// If no goalId, just return as-is
	if (!defaults.goalId) return defaults;

	// If goalId exists, verify it matches the persona
	const goalDefinition = getGoalDefinition(defaults.goalId);

	if (!goalDefinition) {
		console.warn(`[QuickStart] Removing invalid goalId: ${defaults.goalId}`);
		return {
			personaId: defaults.personaId,
			// Remove invalid goalId
		};
	}

	// Check if goal's persona matches the declared persona
	if (defaults.personaId && goalDefinition.personaId !== defaults.personaId) {
		console.warn(
			`[QuickStart] Goal mismatch: ${defaults.goalId} is for ${goalDefinition.personaId}, not ${defaults.personaId}. Using goal's persona.`,
		);

		// Use the persona from the goal (since goals are more specific)
		return {
			personaId: goalDefinition.personaId,
			goalId: defaults.goalId,
		};
	}

	return defaults;
}

/**
 * Get all valid goals for verification
 *
 * Useful for debugging and documentation
 */
export const VALID_GOAL_PERSONA_MAPPINGS = {
	investor: ["investor-pipeline", "investor-market"],
	wholesaler: ["wholesaler-dispositions", "wholesaler-acquisitions"],
	agent: ["agent-sphere", "agent-expansion"],
	lender: ["lender-fund-fast"],
} as const;
