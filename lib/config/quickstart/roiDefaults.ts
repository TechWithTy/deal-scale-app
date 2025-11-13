"use client";

import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import type { DealScaleProfileInputs } from "@/external/calculators/utils/dealScaleRoi";

export interface QuickStartROIHighlights {
	hoursSavedPerWeek: number;
	responseRateIncrease: number;
	conversionMultiplier: number;
}

export interface QuickStartROIPreset {
	profileInputs: DealScaleProfileInputs;
	highlights: QuickStartROIHighlights;
}

type PresetKey = QuickStartGoalId | QuickStartPersonaId | "default";

const MONTHS_IN_YEAR = 12;

const BASE_PRESET: QuickStartROIPreset = {
	profileInputs: {
		personaId: undefined,
		goalId: undefined,
		tier: "basic",
		dealsPerMonth: 6,
		avgDealValue: 25000,
		months: MONTHS_IN_YEAR,
		profitMarginPercent: 22,
		monthlyOverhead: 2500,
		hoursPerDeal: 18,
	},
	highlights: {
		hoursSavedPerWeek: 6,
		responseRateIncrease: 16,
		conversionMultiplier: 1.6,
	},
};

const PERSONA_PRESETS: Partial<
	Record<QuickStartPersonaId, QuickStartROIPreset>
> = {
	investor: {
		profileInputs: {
			...BASE_PRESET.profileInputs,
			personaId: "investor",
			dealsPerMonth: 7,
			avgDealValue: 45000,
			profitMarginPercent: 28,
			hoursPerDeal: 20,
		},
		highlights: {
			hoursSavedPerWeek: 10,
			responseRateIncrease: 20,
			conversionMultiplier: 1.9,
		},
	},
	wholesaler: {
		profileInputs: {
			...BASE_PRESET.profileInputs,
			personaId: "wholesaler",
			dealsPerMonth: 9,
			avgDealValue: 15000,
			profitMarginPercent: 30,
			hoursPerDeal: 22,
		},
		highlights: {
			hoursSavedPerWeek: 11,
			responseRateIncrease: 18,
			conversionMultiplier: 2.1,
		},
	},
	agent: {
		profileInputs: {
			...BASE_PRESET.profileInputs,
			personaId: "agent",
			dealsPerMonth: 5,
			avgDealValue: 600000,
			profitMarginPercent: 17,
			hoursPerDeal: 16,
		},
		highlights: {
			hoursSavedPerWeek: 7,
			responseRateIncrease: 24,
			conversionMultiplier: 1.8,
		},
	},
	lender: {
		profileInputs: {
			...BASE_PRESET.profileInputs,
			personaId: "loan_officer",
			dealsPerMonth: 14,
			avgDealValue: 5000,
			profitMarginPercent: 35,
			hoursPerDeal: 14,
		},
		highlights: {
			hoursSavedPerWeek: 12,
			responseRateIncrease: 26,
			conversionMultiplier: 2.4,
		},
	},
};

const GOAL_PRESETS: Partial<Record<QuickStartGoalId, QuickStartROIPreset>> = {
	"investor-pipeline": {
		profileInputs: {
			...PERSONA_PRESETS.investor?.profileInputs,
			goalId: "investor-pipeline",
			dealsPerMonth: 8,
			avgDealValue: 48000,
			months: MONTHS_IN_YEAR,
		},
		highlights: {
			hoursSavedPerWeek: 11,
			responseRateIncrease: 22,
			conversionMultiplier: 2.0,
		},
	},
	"investor-market": {
		profileInputs: {
			...PERSONA_PRESETS.investor?.profileInputs,
			goalId: "investor-market",
			dealsPerMonth: 6,
			avgDealValue: 42000,
			months: MONTHS_IN_YEAR,
		},
		highlights: {
			hoursSavedPerWeek: 9,
			responseRateIncrease: 18,
			conversionMultiplier: 1.7,
		},
	},
	"wholesaler-dispositions": {
		profileInputs: {
			...PERSONA_PRESETS.wholesaler?.profileInputs,
			goalId: "wholesaler-dispositions",
			dealsPerMonth: 10,
			avgDealValue: 16000,
		},
		highlights: {
			hoursSavedPerWeek: 12,
			responseRateIncrease: 21,
			conversionMultiplier: 2.2,
		},
	},
	"wholesaler-acquisitions": {
		profileInputs: {
			...PERSONA_PRESETS.wholesaler?.profileInputs,
			goalId: "wholesaler-acquisitions",
			dealsPerMonth: 8,
			avgDealValue: 14000,
		},
		highlights: {
			hoursSavedPerWeek: 10,
			responseRateIncrease: 19,
			conversionMultiplier: 1.9,
		},
	},
	"agent-sphere": {
		profileInputs: {
			...PERSONA_PRESETS.agent?.profileInputs,
			goalId: "agent-sphere",
			dealsPerMonth: 6,
			avgDealValue: 650000,
		},
		highlights: {
			hoursSavedPerWeek: 8,
			responseRateIncrease: 25,
			conversionMultiplier: 2.0,
		},
	},
	"agent-expansion": {
		profileInputs: {
			...PERSONA_PRESETS.agent?.profileInputs,
			goalId: "agent-expansion",
			dealsPerMonth: 7,
			avgDealValue: 620000,
		},
		highlights: {
			hoursSavedPerWeek: 9,
			responseRateIncrease: 23,
			conversionMultiplier: 1.9,
		},
	},
	"lender-fund-fast": {
		profileInputs: {
			...PERSONA_PRESETS.lender?.profileInputs,
			goalId: "lender-fund-fast",
			dealsPerMonth: 16,
			avgDealValue: 5500,
		},
		highlights: {
			hoursSavedPerWeek: 14,
			responseRateIncrease: 27,
			conversionMultiplier: 2.5,
		},
	},
};

function clonePreset(preset: QuickStartROIPreset): QuickStartROIPreset {
	return {
		profileInputs: { ...preset.profileInputs },
		highlights: { ...preset.highlights },
	};
}

export const getQuickStartROIPreset = (
	personaId?: QuickStartPersonaId | null,
	goalId?: QuickStartGoalId | null,
): QuickStartROIPreset => {
	const keySequence: PresetKey[] = [
		goalId ?? "default",
		personaId ?? "default",
		"default",
	];

	for (const key of keySequence) {
		if (key && GOAL_PRESETS[key as QuickStartGoalId]) {
			return clonePreset(GOAL_PRESETS[key as QuickStartGoalId]!);
		}
		if (key && PERSONA_PRESETS[key as QuickStartPersonaId]) {
			return clonePreset(PERSONA_PRESETS[key as QuickStartPersonaId]!);
		}
		if (key === "default") {
			return clonePreset(BASE_PRESET);
		}
	}

	return clonePreset(BASE_PRESET);
};
