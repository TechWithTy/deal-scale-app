import { describe, expect, it } from "vitest";

import {
	computeDealScaleManualRoi,
	computeDealScaleProfileRoi,
	dealScalePlanPricing,
} from "@/external/calculators/utils/dealScaleRoi";

describe("Deal Scale ROI utilities", () => {
	it("computes manual ROI metrics for the basic plan", () => {
		const result = computeDealScaleManualRoi({
			plan: "basic",
			leadsGenerated: 500,
			conversionRate: 20,
			avgDealValue: 5000,
			callsMade: 200,
			smsThreads: 300,
			socialThreads: 100,
		});

		expect(result.totalCost).toBeCloseTo(2636.28, 2);
		expect(result.totalRevenue).toBe(500000);
		expect(result.roi).toBeCloseTo(18866.12, 2);
		expect(result.costPerLead).toBeCloseTo(5.27, 2);
		expect(result.costPerConversion).toBeCloseTo(26.36, 2);
	});

	it("computes profile-based ROI metrics for an enterprise agent persona", () => {
		const result = computeDealScaleProfileRoi({
			personaId: "agent",
			goalId: "agent-sphere",
			months: 6,
			profitMarginPercent: 65,
			monthlyOverhead: 3000,
			hoursPerDeal: 12,
			tier: "Enterprise",
		});

		expect(result.totalRevenue).toBe(864000);
		expect(result.actualProfit).toBeCloseTo(561600, 0);
		expect(result.totalCost).toBe(48000);
		expect(result.netProfit).toBeCloseTo(513600, 0);
		expect(result.roi).toBeCloseTo(1070, 0);
		expect(result.costPerLead).toBeCloseTo(133.33, 2);
		expect(result.costPerConversion).toBeCloseTo(666.67, 2);
		expect(result.totalTimeSaved).toBeCloseTo(604.8, 1);
		expect(result.campaignCost).toBeCloseTo(1192.75, 2);
		expect(result.includedCredits).toBe(30000);
		expect(result.campaignOverage).toBe(0);
	});

	it("exposes the correct monthly pricing for each tier", () => {
		expect(dealScalePlanPricing.basic.monthlyPrice).toBe(2400);
		expect(dealScalePlanPricing.starter.monthlyPrice).toBe(1200);
		expect(dealScalePlanPricing.enterprise.monthlyPrice).toBe(5000);
	});
});

