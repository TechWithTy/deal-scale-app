/**
 * Syncs user profile data to QuickStart defaults
 *
 * This ensures that when a user's clientType is set in their company profile,
 * the QuickStart wizard automatically knows their persona preference.
 */

import { useEffect } from "react";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { createQuickStartDefaults } from "./setPersonaDefaults";

/**
 * React hook that automatically syncs clientType to quickStartDefaults
 *
 * Add this hook to your root layout or a high-level component to ensure
 * the QuickStart wizard always has the latest persona defaults.
 *
 * @example
 * ```tsx
 * // In your layout or app shell component:
 * export function AppShell() {
 *   useSyncClientTypeToQuickStartDefaults();
 *
 *   return (
 *     // ... your app content
 *   );
 * }
 * ```
 */
export function useSyncClientTypeToQuickStartDefaults() {
	const userProfile = useUserProfileStore((state) => state.userProfile);
	const updateUserProfile = useUserProfileStore(
		(state) => state.updateUserProfile,
	);

	useEffect(() => {
		if (!userProfile) return;

		const clientType = userProfile.companyInfo?.clientType;
		const currentDefaults = userProfile.quickStartDefaults;

		// If no clientType, nothing to sync
		if (!clientType) return;

		// Create new defaults based on clientType
		const newDefaults = createQuickStartDefaults(clientType);

		if (!newDefaults) return;

		// Only update if:
		// 1. No existing defaults, OR
		// 2. Existing personaId doesn't match the clientType
		const shouldUpdate =
			!currentDefaults || currentDefaults.personaId !== newDefaults.personaId;

		if (shouldUpdate) {
			// Preserve existing goalId if present
			updateUserProfile({
				quickStartDefaults: {
					...newDefaults,
					goalId: currentDefaults?.goalId,
				},
			});
		}
	}, [userProfile?.companyInfo?.clientType, userProfile, updateUserProfile]);
}

/**
 * Standalone function to sync clientType to quickStartDefaults
 *
 * Use this when you want to manually trigger the sync, for example:
 * - After user completes onboarding
 * - After importing user data
 * - In a migration script
 *
 * @example
 * ```ts
 * import { syncClientTypeToQuickStartDefaults } from '@/lib/utils/quickstart/syncProfileToDefaults';
 * import { useUserProfileStore } from '@/lib/stores/user/userProfile';
 *
 * const profile = useUserProfileStore.getState().userProfile;
 * const update = useUserProfileStore.getState().updateUserProfile;
 *
 * syncClientTypeToQuickStartDefaults(profile, update);
 * ```
 */
export function syncClientTypeToQuickStartDefaults(
	userProfile: ReturnType<typeof useUserProfileStore.getState>["userProfile"],
	updateUserProfile: ReturnType<
		typeof useUserProfileStore.getState
	>["updateUserProfile"],
): boolean {
	if (!userProfile) return false;

	const clientType = userProfile.companyInfo?.clientType;
	const currentDefaults = userProfile.quickStartDefaults;

	if (!clientType) return false;

	const newDefaults = createQuickStartDefaults(clientType);

	if (!newDefaults) return false;

	const shouldUpdate =
		!currentDefaults || currentDefaults.personaId !== newDefaults.personaId;

	if (shouldUpdate) {
		updateUserProfile({
			quickStartDefaults: {
				...newDefaults,
				goalId: currentDefaults?.goalId,
			},
		});

		return true;
	}

	return false;
}
