import { describe, expect, it } from "vitest";

import {
	calculateBRRRR,
	calculateCommissionSplit,
	calculateDSCR,
	calculateFixFlipROI,
	calculateLTV,
	calculateRentalCashFlow,
	compareDeals,
	estimateClosingCosts,
	estimateOfferPrice,
} from "external/calculators/formulas";

describe("calculator formulas", () => {
	it("computes fix & flip ROI metrics", () => {
		const result = calculateFixFlipROI({
			arv: 350_000,
			purchasePrice: 200_000,
			rehabCost: 50_000,
			holdingCost: 15_000,
			sellingFees: 20_000,
		});

		expect(result.results.totalInvestment).toBe(285_000);
		expect(result.results.profit).toBe(65_000);
		expect(result.results.breakEvenARV).toBe(285_000);
		expect(result.results.roiPercent).toBeCloseTo(22.807, 3);
	});

	it("computes rental property cash flow metrics", () => {
		const result = calculateRentalCashFlow({
			monthlyRent: 2_500,
			vacancyRate: 5,
			monthlyExpenses: 800,
			loanPayment: 900,
			propertyValue: 320_000,
			downPayment: 64_000,
		});

		expect(result.results.effectiveRent).toBe(2_375);
		expect(result.results.monthlyCashFlow).toBe(675);
		expect(result.results.annualCashFlow).toBe(8_100);
		expect(result.results.capRate).toBeCloseTo(2.531, 3);
		expect(result.results.cashOnCashReturn).toBeCloseTo(11.773, 3);
	});

	it("computes BRRRR refinance outputs", () => {
		const result = calculateBRRRR({
			purchasePrice: 120_000,
			rehabCost: 40_000,
			rent: 1_800,
			arv: 250_000,
			refinanceLTV: 75,
			loanRate: 6.5,
			termYears: 30,
			closingCosts: 8_000,
		});

		expect(result.results.cashOut).toBe(19_500);
		expect(result.results.retainedEquity).toBe(62_500);
		expect(result.results.roiPercent).toBeCloseTo(11.607, 3);
		expect(result.results.monthlyPayment).toBeCloseTo(1_185.13, 2);
		expect(result.results.noi).toBe(14_040);
	});

	it("ranks deals by efficiency", () => {
		const ranked = compareDeals([
			{
				id: "deal-a",
				arv: 320_000,
				cost: 190_000,
				rent: 2_400,
				cashFlow: 7_000,
				roiPercent: 25,
				capRate: 7,
			},
			{
				id: "deal-b",
				arv: 340_000,
				cost: 210_000,
				rent: 2_600,
				cashFlow: 9_000,
				roiPercent: 18,
				capRate: 9,
			},
			{
				id: "deal-c",
				arv: 300_000,
				cost: 180_000,
				rent: 2_500,
				cashFlow: 8_500,
				roiPercent: 22,
				capRate: 8,
			},
		]);

		expect(ranked.results[0].id).toBe("deal-a");
		expect(ranked.results[1].id).toBe("deal-c");
		expect(ranked.results[2].id).toBe("deal-b");
		expect(ranked.results[0].efficiencyScore).toBeGreaterThan(
			ranked.results[1].efficiencyScore,
		);
	});

	it("estimates offer price with AI adjustment", async () => {
		const estimate = await estimateOfferPrice({
			comps: [{ price: 300_000 }, { price: 320_000 }, { price: 310_000 }],
			repairCost: 40_000,
			desiredProfit: 30_000,
			arv: 350_000,
			aiConfidence: 0.9,
		});

		expect(estimate.results.averageCompPrice).toBe(310_000);
		expect(estimate.results.baseMAO).toBeCloseTo(175_000, 2);
		expect(estimate.results.adjustedOffer).toBeCloseTo(176_750, 2);
	});

	it("computes loan to value", () => {
		const result = calculateLTV({
			loanAmount: 180_000,
			propertyValue: 300_000,
		});
		expect(result.results.ltvPercent).toBeCloseTo(60, 5);
	});

	it("computes DSCR", () => {
		const result = calculateDSCR({
			noi: 120_000,
			annualDebtService: 80_000,
		});
		expect(result.results.dscr).toBeCloseTo(1.5, 3);
	});

	it("computes commission split", () => {
		const result = calculateCommissionSplit({
			salePrice: 500_000,
			commissionRate: 6,
			agentSplit: 70,
			teamFee: 1_000,
		});
		expect(result.results.totalCommission).toBe(30_000);
		expect(result.results.agentCommission).toBe(20_000);
		expect(result.results.brokerCommission).toBe(10_000);
	});

	it("estimates closing costs", () => {
		const result = estimateClosingCosts({
			salePrice: 400_000,
			propertyTaxes: 4_500,
			titleFees: 1_200,
			transferTaxRate: 1.5,
			miscFees: 800,
		});

		expect(result.results.transferTax).toBe(6_000);
		expect(result.results.totalClosingCosts).toBe(12_500);
		expect(result.results.netProceeds).toBe(387_500);
	});
});

