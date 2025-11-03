"use client";

import { useSession } from "next-auth/react";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { useEffect } from "react";

/**
 * Debug component to verify QuickStart defaults flow
 *
 * Add this to your layout/dashboard to see console logs
 * showing if the data is flowing correctly.
 */
export function QuickStartDebug() {
	const { data: session } = useSession();
	const wizardData = useQuickStartWizardDataStore();
	const userProfile = useUserProfileStore((state) => state.userProfile);

	useEffect(() => {
		console.group("🔍 QuickStart Defaults Debug");
		console.log("1️⃣ Session user:", session?.user);
		console.log(
			"2️⃣ Session quickStartDefaults:",
			session?.user?.quickStartDefaults,
		);
		console.log(
			"   ├─ personaId:",
			session?.user?.quickStartDefaults?.personaId,
		);
		console.log("   └─ goalId:", session?.user?.quickStartDefaults?.goalId);
		console.log(
			"3️⃣ UserProfile quickStartDefaults:",
			userProfile?.quickStartDefaults,
		);
		console.log("4️⃣ Wizard personaId:", wizardData.personaId);
		console.log("5️⃣ Wizard goalId:", wizardData.goalId);
		console.groupEnd();
	}, [session, wizardData, userProfile]);

	return null;
}
