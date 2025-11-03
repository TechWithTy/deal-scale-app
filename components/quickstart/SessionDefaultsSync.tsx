"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

/**
 * Syncs quickStartDefaults from session to QuickStart wizard store
 *
 * This ensures that when users log in, their persona preferences
 * from the mock database flow through to the wizard.
 */
export function SessionDefaultsSync() {
	const { data: session } = useSession();
	const { personaId, goalId, reset } = useQuickStartWizardDataStore();

	useEffect(() => {
		// Only sync if wizard doesn't already have values set by user
		if (personaId || goalId) {
			return;
		}

		const sessionDefaults = session?.user?.quickStartDefaults;

		if (sessionDefaults?.personaId) {
			// Trigger a reset with the session defaults
			// The store will pick them up on next read
			reset();
		}
	}, [session?.user?.quickStartDefaults, personaId, goalId, reset]);

	return null;
}
