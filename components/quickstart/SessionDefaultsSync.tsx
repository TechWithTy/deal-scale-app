"use client";

import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Syncs quickStartDefaults from session to QuickStart wizard store
 *
 * This ensures that when users log in, their persona preferences
 * from the mock database flow through to the wizard.
 */
export function SessionDefaultsSync() {
	const { data: session } = useSession();
	const { personaId, goalId, isCompleting, selectGoal, selectPersona } =
		useQuickStartWizardDataStore();

	useEffect(() => {
		console.log("🔄 [SESSION SYNC] Effect triggered:", {
			personaId,
			goalId,
			isCompleting,
			hasSessionDefaults: !!session?.user?.quickStartDefaults,
			sessionDefaults: session?.user?.quickStartDefaults,
		});

		// Don't sync if wizard is completing (prevents interference with modal opening)
		if (isCompleting) {
			console.log("🔄 [SESSION SYNC] Skipping - wizard is completing");
			return;
		}
		// Only sync if wizard doesn't already have values set by user
		if (personaId || goalId) {
			console.log("🔄 [SESSION SYNC] Skipping - wizard already has values:", {
				personaId,
				goalId,
			});
			return;
		}

		const sessionDefaults = session?.user?.quickStartDefaults;

		if (sessionDefaults?.goalId || sessionDefaults?.personaId) {
			console.log(
				"🔄 [SESSION SYNC] Scheduling sync in 100ms:",
				sessionDefaults,
			);
			// Use a small delay to prevent rapid re-syncing after reset
			const timeoutId = setTimeout(() => {
				// Double-check we still need to sync (might have been set by another effect)
				const currentState = useQuickStartWizardDataStore.getState();
				console.log("🔄 [SESSION SYNC] Checking if sync still needed:", {
					currentPersonaId: currentState.personaId,
					currentGoalId: currentState.goalId,
					isCompleting: currentState.isCompleting,
				});

				if (
					!currentState.personaId &&
					!currentState.goalId &&
					!currentState.isCompleting
				) {
					// Use selectGoal/selectPersona instead of reset() to preserve session defaults
					// This ensures the values are actually set, not just reset to null
					if (sessionDefaults.goalId) {
						console.log(
							"🔄 [SESSION SYNC] Calling selectGoal:",
							sessionDefaults.goalId,
						);
						selectGoal(sessionDefaults.goalId as any);
					} else if (sessionDefaults.personaId) {
						console.log(
							"🔄 [SESSION SYNC] Calling selectPersona:",
							sessionDefaults.personaId,
						);
						selectPersona(sessionDefaults.personaId as any);
					}
				} else {
					console.log(
						"🔄 [SESSION SYNC] Sync no longer needed - state changed",
					);
				}
			}, 100);

			return () => {
				console.log("🔄 [SESSION SYNC] Cleaning up timeout");
				clearTimeout(timeoutId);
			};
		} else {
			console.log("🔄 [SESSION SYNC] No session defaults to sync");
		}
	}, [
		session?.user?.quickStartDefaults,
		personaId,
		goalId,
		isCompleting,
		selectGoal,
		selectPersona,
	]);

	return null;
}
