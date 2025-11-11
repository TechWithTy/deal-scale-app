"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

import {
	type QuickStartGoalId,
	type QuickStartPersonaId,
	getGoalDefinition,
	getPersonaDefinition,
} from "@/lib/config/quickstart/wizardFlows";
import type { DealScaleProfileInputs } from "@/external/calculators/utils/dealScaleRoi";
import { normalizeTierToPlanId } from "@/external/calculators/utils/dealScaleRoi";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";

const MONTHS_IN_YEAR = 12;

interface ROIProfileOverrides {
	profile: Partial<DealScaleProfileInputs>;
	metadata: {
		personaId: QuickStartPersonaId | null;
		goalId: QuickStartGoalId | null;
		personaTitle: string | null;
		goalTitle: string | null;
		companySizeLabel: string | null;
		teamSize: number | null;
		crmName: string | null;
		avgLeadsPerMonth: number | null;
		tier: string | null;
	};
}

const deriveCompanySizeLabel = (teamSize: number | null): string | null => {
	if (!teamSize || teamSize <= 0) return null;
	if (teamSize === 1) return "Solo operator";
	if (teamSize <= 5) return `${teamSize}-person growth team`;
	if (teamSize <= 15) return "Scaling revenue team";
	return "Enterprise-scale operation";
};

const deriveCrmName = (connectedAccounts?: Record<string, unknown>) => {
	if (!connectedAccounts) return null;
	if (connectedAccounts.goHighLevel) {
		return "GoHighLevel";
	}
	if (connectedAccounts.hubSpot || connectedAccounts.hubspot) {
		return "HubSpot";
	}
	if (connectedAccounts.salesforce) {
		return "Salesforce";
	}
	if (connectedAccounts.loftyCRM) {
		return "Lofty CRM";
	}
	return null;
};

const coalescePersona = (
	wizardPersona: QuickStartPersonaId | null,
	profilePersona: QuickStartPersonaId | null,
	sessionPersona: QuickStartPersonaId | null,
): QuickStartPersonaId | null => {
	return wizardPersona ?? sessionPersona ?? profilePersona ?? null;
};

const coalesceGoal = (
	wizardGoal: QuickStartGoalId | null,
	sessionGoal: QuickStartGoalId | null,
): QuickStartGoalId | null => {
	return wizardGoal ?? sessionGoal ?? null;
};

export const useQuickStartROIProfile = (): ROIProfileOverrides => {
	const { personaId: wizardPersona, goalId: wizardGoal } =
		useQuickStartWizardDataStore();
	const userProfile = useUserProfileStore((state) => state.userProfile);
	const { data: session } = useSession();

	const resolvedPersona = coalescePersona(
		wizardPersona,
		userProfile?.quickStartDefaults?.personaId ??
			(userProfile?.companyInfo?.clientType === "loan_officer"
				? "lender"
				: ((userProfile?.companyInfo?.clientType as
						| QuickStartPersonaId
						| undefined) ?? null)),
		session?.user.quickStartDefaults?.personaId ?? null,
	);

	const resolvedGoal = coalesceGoal(
		wizardGoal,
		session?.user.quickStartDefaults?.goalId ?? null,
	);

	const roiConfig =
		session?.user.demoConfig?.roiProfile ??
		userProfile?.roiProfileOverrides ??
		null;

	return useMemo<ROIProfileOverrides>(() => {
		const personaDefinition = resolvedPersona
			? getPersonaDefinition(resolvedPersona)
			: null;
		const goalDefinition = resolvedGoal
			? getGoalDefinition(resolvedGoal)
			: null;

		const teamSize = userProfile?.teamMembers?.length ?? null;
		const companySizeLabel = deriveCompanySizeLabel(teamSize);

		const crmName =
			deriveCrmName(userProfile?.connectedAccounts) ??
			session?.user.subscription?.planDetails ??
			null;

		const subscription =
			userProfile?.subscription ?? session?.user.subscription ?? null;

		const tier =
			subscription?.name?.toLowerCase() ??
			(session?.user.tier ? session.user.tier.toLowerCase() : null) ??
			null;

		const leadsAllowance = subscription?.leads?.allotted ?? null;
		const leadsTypeMultiplier =
			subscription?.type === "yearly"
				? 12
				: subscription?.type === "monthly"
					? 1
					: null;
		const avgLeadsPerMonth =
			leadsAllowance && leadsTypeMultiplier
				? Math.round(leadsAllowance / leadsTypeMultiplier)
				: null;

		const profileOverrides: Partial<DealScaleProfileInputs> = {};

		if (resolvedPersona) {
			profileOverrides.personaId = resolvedPersona;
		}

		if (resolvedGoal) {
			profileOverrides.goalId = resolvedGoal;
		}

		if (tier) {
			profileOverrides.tier = normalizeTierToPlanId(tier);
		}

		if (teamSize && teamSize > 0) {
			const teamScalingFactor = Math.min(2, 1 + teamSize / 12);
			const baseDeals = profileOverrides.dealsPerMonth ?? 6;
			profileOverrides.dealsPerMonth = Math.round(
				baseDeals * teamScalingFactor,
			);
			profileOverrides.months = MONTHS_IN_YEAR;
		}

		if (avgLeadsPerMonth && avgLeadsPerMonth > 0) {
			const impliedDeals = Math.max(1, Math.round(avgLeadsPerMonth / 5));
			profileOverrides.dealsPerMonth = impliedDeals;
		}

		if (roiConfig?.dealsPerMonth !== undefined) {
			profileOverrides.dealsPerMonth = Math.max(1, roiConfig.dealsPerMonth);
		}

		if (roiConfig?.avgDealValue !== undefined) {
			profileOverrides.avgDealValue = Math.max(0, roiConfig.avgDealValue);
		}

		if (roiConfig?.months !== undefined) {
			profileOverrides.months = Math.max(1, Math.min(roiConfig.months, 36));
		}

		if (roiConfig?.profitMarginPercent !== undefined) {
			profileOverrides.profitMarginPercent = Math.min(
				Math.max(roiConfig.profitMarginPercent, 0),
				100,
			);
		}

		if (roiConfig?.monthlyOverhead !== undefined) {
			profileOverrides.monthlyOverhead = Math.max(0, roiConfig.monthlyOverhead);
		}

		if (roiConfig?.hoursPerDeal !== undefined) {
			profileOverrides.hoursPerDeal = Math.max(0, roiConfig.hoursPerDeal);
		}

		if (userProfile?.leadPreferences?.maxBudget) {
			const inferredDealValue =
				Math.max(userProfile.leadPreferences.maxBudget, 5000) * 5;
			profileOverrides.avgDealValue = inferredDealValue;
		}

		if (userProfile?.companyInfo?.GHLID?.subAccountId) {
			profileOverrides.monthlyOverhead = 3500;
		}

		return {
			profile: profileOverrides,
			metadata: {
				personaId: resolvedPersona ?? null,
				goalId: resolvedGoal ?? null,
				personaTitle: personaDefinition?.title ?? null,
				goalTitle: goalDefinition?.title ?? null,
				companySizeLabel,
				teamSize,
				crmName,
				avgLeadsPerMonth,
				tier,
			},
		};
	}, [
		resolvedPersona,
		resolvedGoal,
		userProfile,
		roiConfig,
		session?.user.subscription,
		session?.user.quickStartDefaults,
		session?.user.tier,
	]);
};
