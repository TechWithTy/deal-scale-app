const PROFIT_MARGIN_MULTIPLIER = 2.2;

export type DealScalePlanId = "starter" | "basic" | "enterprise";

export interface DealScalePlanPricing {
	monthlyPrice: number;
	aiCreditsPerMonth: number;
	callCostPer5Min: number;
	smsCostPerMessage: number;
	socialResponseCost: number;
	phoneValidation: number;
	realContact: number;
	reversePhone: number;
	reverseAddress: number;
	callerIdApi: number;
	smartCnam: number;
	litigatorCheck: number;
	emailDeliverability: number;
	emailAgeScore: number;
}

const baseCosts = {
	voice: {
		callPer5Min: 0.29,
	},
	sms: {
		enterprise: 0.1,
		basic: 0.118,
		starter: 0.136,
	},
	social: {
		enterprise: 0.068,
		basic: 0.082,
		starter: 0.1,
	},
	tresle: {
		phoneValidation: 0.015,
		realContact: 0.03,
		reversePhone: 0.07,
		reverseAddress: 0.07,
		callerIdApi: 0.07,
		smartCnam: 0.015,
		litigatorCheck: 0.005,
		emailDeliverability: 0.005,
		emailAgeScore: 0.005,
	},
} as const;

export const dealScalePlanPricing: Record<
	DealScalePlanId,
	DealScalePlanPricing
> = {
	basic: {
		monthlyPrice: 2400,
		aiCreditsPerMonth: 2400,
		callCostPer5Min:
			baseCosts.voice.callPer5Min * PROFIT_MARGIN_MULTIPLIER * 1.1,
		smsCostPerMessage: baseCosts.sms.basic * PROFIT_MARGIN_MULTIPLIER,
		socialResponseCost: baseCosts.social.basic * PROFIT_MARGIN_MULTIPLIER,
		phoneValidation:
			baseCosts.tresle.phoneValidation * PROFIT_MARGIN_MULTIPLIER,
		realContact: baseCosts.tresle.realContact * PROFIT_MARGIN_MULTIPLIER,
		reversePhone: baseCosts.tresle.reversePhone * PROFIT_MARGIN_MULTIPLIER,
		reverseAddress: baseCosts.tresle.reverseAddress * PROFIT_MARGIN_MULTIPLIER,
		callerIdApi: baseCosts.tresle.callerIdApi * PROFIT_MARGIN_MULTIPLIER,
		smartCnam: baseCosts.tresle.smartCnam * PROFIT_MARGIN_MULTIPLIER,
		litigatorCheck: baseCosts.tresle.litigatorCheck * PROFIT_MARGIN_MULTIPLIER,
		emailDeliverability:
			baseCosts.tresle.emailDeliverability * PROFIT_MARGIN_MULTIPLIER,
		emailAgeScore: baseCosts.tresle.emailAgeScore * PROFIT_MARGIN_MULTIPLIER,
	},
	starter: {
		monthlyPrice: 1200,
		aiCreditsPerMonth: 1200,
		callCostPer5Min:
			baseCosts.voice.callPer5Min * PROFIT_MARGIN_MULTIPLIER * 1.2,
		smsCostPerMessage: baseCosts.sms.starter * PROFIT_MARGIN_MULTIPLIER,
		socialResponseCost: baseCosts.social.starter * PROFIT_MARGIN_MULTIPLIER,
		phoneValidation:
			baseCosts.tresle.phoneValidation * PROFIT_MARGIN_MULTIPLIER * 1.05,
		realContact: baseCosts.tresle.realContact * PROFIT_MARGIN_MULTIPLIER * 1.05,
		reversePhone:
			baseCosts.tresle.reversePhone * PROFIT_MARGIN_MULTIPLIER * 1.05,
		reverseAddress:
			baseCosts.tresle.reverseAddress * PROFIT_MARGIN_MULTIPLIER * 1.05,
		callerIdApi: baseCosts.tresle.callerIdApi * PROFIT_MARGIN_MULTIPLIER * 1.05,
		smartCnam: baseCosts.tresle.smartCnam * PROFIT_MARGIN_MULTIPLIER * 1.05,
		litigatorCheck:
			baseCosts.tresle.litigatorCheck * PROFIT_MARGIN_MULTIPLIER * 1.05,
		emailDeliverability:
			baseCosts.tresle.emailDeliverability * PROFIT_MARGIN_MULTIPLIER * 1.05,
		emailAgeScore:
			baseCosts.tresle.emailAgeScore * PROFIT_MARGIN_MULTIPLIER * 1.05,
	},
	enterprise: {
		monthlyPrice: 5000,
		aiCreditsPerMonth: 5000,
		callCostPer5Min: baseCosts.voice.callPer5Min * PROFIT_MARGIN_MULTIPLIER,
		smsCostPerMessage: baseCosts.sms.enterprise * PROFIT_MARGIN_MULTIPLIER,
		socialResponseCost: baseCosts.social.enterprise * PROFIT_MARGIN_MULTIPLIER,
		phoneValidation: baseCosts.tresle.phoneValidation * 2.0,
		realContact: baseCosts.tresle.realContact * 2.0,
		reversePhone: baseCosts.tresle.reversePhone * 2.0,
		reverseAddress: baseCosts.tresle.reverseAddress * 2.0,
		callerIdApi: baseCosts.tresle.callerIdApi * 2.0,
		smartCnam: baseCosts.tresle.smartCnam * 2.0,
		litigatorCheck: baseCosts.tresle.litigatorCheck * 2.0,
		emailDeliverability: baseCosts.tresle.emailDeliverability * 2.0,
		emailAgeScore: baseCosts.tresle.emailAgeScore * 2.0,
	},
};

export const dealScaleBenchmarkPresets = {
	small: {
		dealsPerMonth: 3.5,
		dealValue: 300000,
		profitMargin: 17.5,
		daysToClose: 35,
		hoursPerDeal: 30,
		overhead: 8000,
		badge: "Small Team",
		sublabel: "3-4 deals/mo",
	},
	medium: {
		dealsPerMonth: 6.5,
		dealValue: 375000,
		profitMargin: 20,
		daysToClose: 30,
		hoursPerDeal: 25,
		overhead: 16000,
		badge: "Medium Team",
		sublabel: "5-8 deals/mo",
	},
	enterprise: {
		dealsPerMonth: 12.5,
		dealValue: 500000,
		profitMargin: 25,
		daysToClose: 20,
		hoursPerDeal: 15,
		overhead: 40000,
		badge: "Enterprise",
		sublabel: "10-15 deals/mo",
	},
} as const;
