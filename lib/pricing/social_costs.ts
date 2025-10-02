// Types for social media pricing configuration
export interface SocialPricingPlan {
	internalCostPerTenMessages: number;
	customerPricePerTenMessages: number;
	margin: number;
	billableCredits: number;
}

export interface SocialPlatformConfig {
	internalCostPerTenMessages: number;
	customerPricePerTenMessages: number;
	billableCredits: number;
}

export interface SocialPricingScenarios {
	[key: string]: {
		internalCostMultiplier: number;
		customerPriceMultiplier: number;
	};
}

export interface SocialCostsConfig {
	plans: {
		basic: SocialPricingPlan;
		starter: SocialPricingPlan;
		enterprise: SocialPricingPlan;
	};
	default: SocialPricingPlan;
	platforms: {
		facebook: SocialPlatformConfig;
		linkedin: SocialPlatformConfig;
		instagram: SocialPlatformConfig;
	};
	scenarios?: SocialPricingScenarios;
}

// Calculate margin automatically
function calculateMargin(internalCost: number, customerPrice: number): number {
	return (
		Math.round(((customerPrice - internalCost) / customerPrice) * 100) / 100
	);
}

// Social media pricing configuration with automatic margin calculation
export const socialCosts: SocialCostsConfig = {
	plans: {
		basic: {
			internalCostPerTenMessages: 0.01, // $0.01 per 10 messages (API costs)
			customerPricePerTenMessages: 0.05,
			margin: calculateMargin(0.01, 0.05), // 80%
			billableCredits: 1.0,
		},
		starter: {
			internalCostPerTenMessages: 0.006,
			customerPricePerTenMessages: 0.03,
			margin: calculateMargin(0.006, 0.03), // 80%
			billableCredits: 1.0,
		},
		enterprise: {
			internalCostPerTenMessages: 0.004,
			customerPricePerTenMessages: 0.02,
			margin: calculateMargin(0.004, 0.02), // 80%
			billableCredits: 1.0,
		},
	},
	default: {
		internalCostPerTenMessages: 0.004,
		customerPricePerTenMessages: 0.02,
		margin: calculateMargin(0.004, 0.02), // 80%
		billableCredits: 1.0,
	},
	platforms: {
		facebook: {
			internalCostPerTenMessages: 0.005, // $0.005 per 10 messages
			customerPricePerTenMessages: 0.025,
			billableCredits: 1.0,
		},
		linkedin: {
			internalCostPerTenMessages: 0.007, // $0.007 per 10 messages (higher API costs)
			customerPricePerTenMessages: 0.035,
			billableCredits: 1.0,
		},
		instagram: {
			internalCostPerTenMessages: 0.006, // $0.006 per 10 messages
			customerPricePerTenMessages: 0.03,
			billableCredits: 1.0,
		},
	},
	scenarios: {
		verified: {
			internalCostMultiplier: 1.1,
			customerPriceMultiplier: 1.2,
		},
		premium: {
			internalCostMultiplier: 1.3,
			customerPriceMultiplier: 1.4,
		},
	},
};

// Export the configuration for use in the calculator
export default socialCosts;
