/**
 * Utility functions for setting QuickStart wizard defaults based on user profile data
 *
 * This ensures that when users open the QuickStart wizard, their ICP type (persona)
 * and goal are pre-selected if we have that information in their profile.
 */

import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import type { ClientType } from "@/types/user";
import type { QuickStartDefaults } from "@/types/userProfile";

/**
 * Maps ClientType to QuickStart PersonaId
 *
 * ClientType is used in test users and demo configurations.
 * This mapping ensures consistency between different parts of the app.
 */
export function clientTypeToPersonaId(
	clientType: ClientType | undefined | null,
): QuickStartPersonaId | null {
	if (!clientType) return null;

	const mapping: Record<ClientType, QuickStartPersonaId> = {
		investor: "investor",
		wholesaler: "wholesaler",
		agent: "agent",
		loan_officer: "loan_officer", // Loan officer persona mapping
	};

	return mapping[clientType] ?? null;
}

/**
 * Maps QuickStart PersonaId back to ClientType
 * Useful for syncing data in the opposite direction
 */
export function personaIdToClientType(
	personaId: QuickStartPersonaId | undefined | null,
): ClientType | null {
	if (!personaId) return null;

	const mapping: Record<QuickStartPersonaId, ClientType> = {
		investor: "investor",
		wholesaler: "wholesaler",
		agent: "agent",
		loan_officer: "loan_officer",
	};

	return mapping[personaId] ?? null;
}

/**
 * Creates QuickStartDefaults from ClientType
 *
 * This sets the personaId based on ClientType.
 * goalId is left as undefined to allow users to choose their specific goal.
 *
 * @example
 * ```ts
 * const defaults = createQuickStartDefaults('investor');
 * // Result: { personaId: 'investor', goalId: undefined }
 * ```
 */
export function createQuickStartDefaults(
	clientType: ClientType | undefined | null,
): QuickStartDefaults | undefined {
	const personaId = clientTypeToPersonaId(clientType);

	if (!personaId) return undefined;

	return {
		personaId,
		// Don't set goalId - let user choose their specific goal
		// Or optionally set a default goal if there's only one for this persona
	};
}

/**
 * Creates QuickStartDefaults with both persona and goal
 *
 * Use this when you know both the user's ICP type and their specific goal.
 *
 * @example
 * ```ts
 * const defaults = createQuickStartDefaultsWithGoal('investor', 'investor-build-pipeline');
 * // Result: { personaId: 'investor', goalId: 'investor-build-pipeline' }
 * ```
 */
export function createQuickStartDefaultsWithGoal(
	personaId: QuickStartPersonaId | undefined | null,
	goalId: QuickStartGoalId | undefined | null,
): QuickStartDefaults | undefined {
	if (!personaId) return undefined;

	return {
		personaId,
		goalId: goalId ?? undefined,
	};
}

/**
 * Updates user profile with QuickStart defaults
 *
 * Call this function when you want to save the user's ICP type preference.
 *
 * @example
 * ```ts
 * import { useUserProfileStore } from '@/lib/stores/user/userProfile';
 *
 * // In your onboarding component:
 * const updateProfile = useUserProfileStore(state => state.updateUserProfile);
 *
 * const handlePersonaSelect = (clientType: ClientType) => {
 *   const defaults = createQuickStartDefaults(clientType);
 *   if (defaults) {
 *     updateProfile({ quickStartDefaults: defaults });
 *   }
 * };
 * ```
 */
export function updateProfileWithQuickStartDefaults(
	updateProfile: (
		data: Partial<{ quickStartDefaults: QuickStartDefaults }>,
	) => void,
	clientType: ClientType | undefined | null,
): void {
	const defaults = createQuickStartDefaults(clientType);

	if (defaults) {
		updateProfile({ quickStartDefaults: defaults });
	}
}
