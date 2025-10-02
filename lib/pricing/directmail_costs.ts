// Types for direct mail pricing configuration
export interface DirectMailPricingPlan {
	internalCostPerEvent: number;
	customerPricePerEvent: number;
	margin: number;
	billableCredits: number;
}

export interface DirectMailTypeConfig {
	baseCost: number;
	billableCredits: number;
}

export interface DirectMailAiTriggeredConfig {
	qrCode: number;
	smsFollowUp: number;
	callFollowUp: number;
}

export interface DirectMailFeaturesConfig {
	webhooks: {
		basic: number;
		starter: number;
		enterprise: number;
	};
	mailTracking: boolean;
	analytics: boolean;
	integrations: boolean;
	userRoles: boolean;
	customEnvelopes: boolean;
	specialtyMailers: boolean;
	hipaaCompliant: boolean;
}

export interface DirectMailPricingScenarios {
	[key: string]: {
		internalCostMultiplier: number;
		customerPriceMultiplier: number;
	};
}

export interface DirectMailCostsConfig {
	plans: {
		basic: DirectMailPricingPlan;
		starter: DirectMailPricingPlan;
		enterprise: DirectMailPricingPlan;
	};
	default: DirectMailPricingPlan;
	types: {
		postcard: DirectMailTypeConfig;
		letter: DirectMailTypeConfig;
		check: DirectMailTypeConfig;
		ai_triggered: DirectMailAiTriggeredConfig;
	};
	features: DirectMailFeaturesConfig;
	scenarios?: DirectMailPricingScenarios;
}

// Calculate margin automatically
function calculateMargin(internalCost: number, customerPrice: number): number {
	return (
		Math.round(((customerPrice - internalCost) / customerPrice) * 100) / 100
	);
}

// Direct mail pricing configuration with automatic margin calculation
export const directMailCosts: DirectMailCostsConfig = {
	plans: {
		basic: {
			internalCostPerEvent: 0.02, // $0.02 internal cost per event
			customerPricePerEvent: 0.1,
			margin: calculateMargin(0.02, 0.1), // 80%
			billableCredits: 1.0,
		},
		starter: {
			internalCostPerEvent: 0.012,
			customerPricePerEvent: 0.06,
			margin: calculateMargin(0.012, 0.06), // 80%
			billableCredits: 1.0,
		},
		enterprise: {
			internalCostPerEvent: 0.01,
			customerPricePerEvent: 0.05,
			margin: calculateMargin(0.01, 0.05), // 80%
			billableCredits: 1.0,
		},
	},
	default: {
		internalCostPerEvent: 0.01,
		customerPricePerEvent: 0.05,
		margin: calculateMargin(0.01, 0.05), // 80%
		billableCredits: 1.0,
	},
	types: {
		postcard: {
			baseCost: 0.58, // Base printing/postage cost
			billableCredits: 1.0,
		},
		letter: {
			baseCost: 0.61,
			billableCredits: 1.0,
		},
		check: {
			baseCost: 1.01,
			billableCredits: 1.0,
		},
		ai_triggered: {
			qrCode: 0.05, // QR code generation cost
			smsFollowUp: 0.03, // SMS follow-up cost
			callFollowUp: 0.08, // Call follow-up cost
		},
	},
	features: {
		webhooks: {
			basic: 1,
			starter: 5,
			enterprise: 10,
		},
		mailTracking: true,
		analytics: true,
		integrations: false,
		userRoles: false,
		customEnvelopes: false,
		specialtyMailers: false,
		hipaaCompliant: false,
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
export default directMailCosts;
