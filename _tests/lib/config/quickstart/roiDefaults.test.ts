import { describe, expect, it } from "vitest";

import { getQuickStartROIPreset } from "@/lib/config/quickstart/roiDefaults";

describe("getQuickStartROIPreset", () => {
	it("returns goal-specific overrides when available", () => {
		const preset = getQuickStartROIPreset("loan_officer", "lender-fund-fast");

		expect(preset.profileInputs.goalId).toBe("lender-fund-fast");
		expect(preset.profileInputs.dealsPerMonth).toBeGreaterThan(10);
		expect(preset.highlights.hoursSavedPerWeek).toBeGreaterThanOrEqual(10);
	});

	it("falls back to persona defaults when goal is not mapped", () => {
		const preset = getQuickStartROIPreset("investor", "agent-expansion");

		expect(preset.profileInputs.personaId).toBe("agent");
		expect(preset.profileInputs.avgDealValue).toBeGreaterThan(40000);
	});

	it("uses base preset when persona and goal are unknown", () => {
		const preset = getQuickStartROIPreset(null, null);

		expect(preset.profileInputs.dealsPerMonth).toBeGreaterThan(0);
		expect(preset.highlights.conversionMultiplier).toBeGreaterThan(1);
	});
});

