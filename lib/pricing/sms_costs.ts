// Types for SMS pricing configuration
export interface SmsPricingPlan {
	internalCostPerTenMessages: number;
	customerPricePerTenMessages: number;
	margin: number;
	billableCredits: number;
}

export interface SmsPricingScenarios {
	[key: string]: {
		internalCostMultiplier: number;
		customerPriceMultiplier: number;
	};
}

export interface SmsMessageTypeConfig {
	plans: {
		basic: SmsPricingPlan;
		starter: SmsPricingPlan;
		enterprise: SmsPricingPlan;
	};
	default: SmsPricingPlan;
}

export interface SmsCostsConfig {
	sms: SmsMessageTypeConfig;
	imessage: SmsMessageTypeConfig;
	scenarios?: SmsPricingScenarios;
}

// Calculate margin automatically
function calculateMargin(internalCost: number, customerPrice: number): number {
	return (
		Math.round(((customerPrice - internalCost) / customerPrice) * 100) / 100
	);
}

// SMS pricing configuration with automatic margin calculation
export const smsCosts: SmsCostsConfig = {
	sms: {
		plans: {
			basic: {
				internalCostPerTenMessages: 0.005, // $0.005 per 10 messages
				customerPricePerTenMessages: 0.01,
				margin: calculateMargin(0.005, 0.01), // 50%
				billableCredits: 1.0,
			},
			starter: {
				internalCostPerTenMessages: 0.005,
				customerPricePerTenMessages: 0.01,
				margin: calculateMargin(0.005, 0.01), // 50%
				billableCredits: 1.0,
			},
			enterprise: {
				internalCostPerTenMessages: 0.005,
				customerPricePerTenMessages: 0.01,
				margin: calculateMargin(0.005, 0.01), // 50%
				billableCredits: 1.0,
			},
		},
		default: {
			internalCostPerTenMessages: 0.005,
			customerPricePerTenMessages: 0.01,
			margin: calculateMargin(0.005, 0.01), // 50%
			billableCredits: 1.0,
		},
	},
	imessage: {
		plans: {
			basic: {
				internalCostPerTenMessages: 0.175, // $0.175 per 10 messages (higher due to Apple fees)
				customerPricePerTenMessages: 0.35,
				margin: calculateMargin(0.175, 0.35), // 50%
				billableCredits: 1.5,
			},
			starter: {
				internalCostPerTenMessages: 0.15,
				customerPricePerTenMessages: 0.3,
				margin: calculateMargin(0.15, 0.3), // 50%
				billableCredits: 1.5,
			},
			enterprise: {
				internalCostPerTenMessages: 0.14,
				customerPricePerTenMessages: 0.28,
				margin: calculateMargin(0.14, 0.28), // 50%
				billableCredits: 1.5,
			},
		},
		default: {
			internalCostPerTenMessages: 0.15,
			customerPricePerTenMessages: 0.3,
			margin: calculateMargin(0.15, 0.3), // 50%
			billableCredits: 1.5,
		},
	},
	scenarios: {
		bulk: {
			internalCostMultiplier: 0.8,
			customerPriceMultiplier: 0.9,
		},
		premium: {
			internalCostMultiplier: 1.2,
			customerPriceMultiplier: 1.3,
		},
	},
};

// Export the configuration for use in the calculator
export default smsCosts;
