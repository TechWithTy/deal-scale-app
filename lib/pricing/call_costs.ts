// Types for call pricing configuration
export interface CallPricingPlan {
	internalCostPerFiveMinutes: number;
	customerPricePerFiveMinutes: number;
	margin: number;
	billableCredits: number;
}

export interface CallPricingScenarios {
	[key: string]: {
		internalCostMultiplier: number;
		customerPriceMultiplier: number;
	};
}

export interface CallCostsConfig {
	plans: {
		basic: CallPricingPlan;
		starter: CallPricingPlan;
		enterprise: CallPricingPlan;
	};
	default: CallPricingPlan;
	scenarios: CallPricingScenarios;
}

// Calculate margin automatically
function calculateMargin(internalCost: number, customerPrice: number): number {
	return (
		Math.round(((customerPrice - internalCost) / customerPrice) * 100) / 100
	);
}

// Call pricing configuration with automatic margin calculation
export const callCosts: CallCostsConfig = {
	plans: {
		basic: {
			internalCostPerFiveMinutes: 0.05,
			customerPricePerFiveMinutes: 0.25,
			margin: calculateMargin(0.05, 0.25), // 80%
			billableCredits: 1.0,
		},
		starter: {
			internalCostPerFiveMinutes: 0.04,
			customerPricePerFiveMinutes: 0.2,
			margin: calculateMargin(0.04, 0.2), // 80%
			billableCredits: 1.0,
		},
		enterprise: {
			internalCostPerFiveMinutes: 0.035,
			customerPricePerFiveMinutes: 0.18,
			margin: calculateMargin(0.035, 0.18), // ~80.6%
			billableCredits: 1.0,
		},
	},
	default: {
		internalCostPerFiveMinutes: 0.04,
		customerPricePerFiveMinutes: 0.2,
		margin: calculateMargin(0.04, 0.2), // 80%
		billableCredits: 1.0,
	},
	scenarios: {
		voicemail: {
			internalCostMultiplier: 0.5,
			customerPriceMultiplier: 0.5,
		},
		transfer: {
			internalCostMultiplier: 0.5,
			customerPriceMultiplier: 0.5,
		},
		weekend: {
			internalCostMultiplier: 1.2,
			customerPriceMultiplier: 1.2,
		},
		holiday: {
			internalCostMultiplier: 1.3,
			customerPriceMultiplier: 1.3,
		},
	},
};

// Export the configuration for use in the calculator
export default callCosts;
