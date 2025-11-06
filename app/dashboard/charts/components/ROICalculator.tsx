"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Calculator, TrendingUp, User, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/_utils";
import type { SubscriptionPlan, ROIMetrics } from "../types/analytics";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";

// Profit margin multiplier: 120% profit = 2.2x markup
const PROFIT_MARGIN_MULTIPLIER = 2.2;

// Base costs (before profit margin)
const baseCosts = {
	voice: {
		// Voice call costs based on actual 3m 23s call = $0.43
		callPer5Min: 0.29, // Base cost (to charge $0.64 with 2.2x = $0.64)
	},
	sms: {
		// SMS 10-message thread costs
		enterprise: 0.1, // Twilio ($0.075) + LLM ($0.08) + Platform ($0.06) + Analysis ($0.005) = $0.22 with 2.2x
		basic: 0.118, // Twilio ($0.08) + LLM ($0.09) + Platform ($0.07) + Analysis ($0.02) = $0.26 with 2.2x
		starter: 0.136, // Twilio ($0.08) + LLM ($0.10) + Platform ($0.08) + Analysis ($0.04) = $0.30 with 2.2x
	},
	social: {
		// Social 10-message thread costs (no telecom)
		enterprise: 0.068, // DeepSeek ($0.003) + Light Media ($0.02) + Platform ($0.03) + Analysis ($0.012) = $0.15 with 2.2x
		basic: 0.082, // DeepSeek ($0.003) + Light Media ($0.02) + Platform ($0.04) + Analysis ($0.015) = $0.18 with 2.2x
		starter: 0.1, // DeepSeek ($0.004) + Light Media ($0.03) + Platform ($0.05) + Analysis ($0.016) = $0.22 with 2.2x
	},
	tresle: {
		// Tresle skip tracing base costs
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
};

const planCosts = {
	basic: {
		monthlyPrice: 2400,
		aiCreditsPerMonth: 2400,
		callCostPer5Min:
			baseCosts.voice.callPer5Min * PROFIT_MARGIN_MULTIPLIER * 1.1, // 10% tier markup
		smsCostPerMessage: baseCosts.sms.basic * PROFIT_MARGIN_MULTIPLIER,
		socialResponseCost: baseCosts.social.basic * PROFIT_MARGIN_MULTIPLIER,
		// Tresle Skip Tracing
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
			baseCosts.voice.callPer5Min * PROFIT_MARGIN_MULTIPLIER * 1.2, // 20% tier markup
		smsCostPerMessage: baseCosts.sms.starter * PROFIT_MARGIN_MULTIPLIER,
		socialResponseCost: baseCosts.social.starter * PROFIT_MARGIN_MULTIPLIER,
		// Tresle Skip Tracing
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
		callCostPer5Min: baseCosts.voice.callPer5Min * PROFIT_MARGIN_MULTIPLIER, // Best rates
		smsCostPerMessage: baseCosts.sms.enterprise * PROFIT_MARGIN_MULTIPLIER,
		socialResponseCost: baseCosts.social.enterprise * PROFIT_MARGIN_MULTIPLIER,
		// Tresle Skip Tracing (volume discount - 2.0x instead of 2.2x)
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

/**
 * Estimate average deals per month based on persona and goal
 */
function getEstimatedDealsPerMonth(
	personaId?: string,
	goalId?: string,
): number {
	const personaBaseDeals: Record<string, number> = {
		wholesaler: 8,
		agent: 12,
		investor: 6,
		loan_officer: 15,
	};

	const goalMultipliers: Record<string, number> = {
		"wholesaler-deals": 1.2,
		"agent-sphere": 1.0,
		"investor-portfolio": 0.8,
		"loan-origination": 1.3,
	};

	const baseDeals =
		personaId && personaBaseDeals[personaId] ? personaBaseDeals[personaId] : 10;

	const multiplier =
		goalId && goalMultipliers[goalId] ? goalMultipliers[goalId] : 1.0;

	return Math.round(baseDeals * multiplier);
}

/**
 * Estimate average deal value based on persona type
 */
function getEstimatedDealValue(personaId?: string): number {
	const personaDealValues: Record<string, number> = {
		wholesaler: 8000,
		agent: 12000,
		investor: 45000,
		loan_officer: 6000,
	};

	return personaId && personaDealValues[personaId]
		? personaDealValues[personaId]
		: 10000;
}

export function ROICalculator() {
	const sessionUser = useSessionStore((state) => state.user);

	// Helper to validate numeric input
	const handleNumericInput = (value: string) => {
		// Allow empty string or valid numbers only
		if (value === "" || /^\d*\.?\d*$/.test(value)) {
			return value;
		}
		return value.replace(/[^\d.]/g, "");
	};

	// Manual calculator state
	const [plan, setPlan] = useState<SubscriptionPlan>("basic");
	const [leadsGenerated, setLeadsGenerated] = useState<string | number>(500);
	const [conversionRate, setConversionRate] = useState<string | number>(20);
	const [avgDealValue, setAvgDealValue] = useState<string | number>(5000);
	const [callsMade, setCallsMade] = useState<string | number>(200);
	const [smsSent, setSmsSent] = useState<string | number>(300);
	const [socialResponses, setSocialResponses] = useState<string | number>(100);

	// Profile-based calculator state (use string | number to allow empty inputs)
	const [profileDealsPerMonth, setProfileDealsPerMonth] = useState<
		string | number
	>(
		getEstimatedDealsPerMonth(
			sessionUser?.quickStartDefaults?.personaId,
			sessionUser?.quickStartDefaults?.goalId,
		),
	);
	const [profileAvgDealValue, setProfileAvgDealValue] = useState<
		string | number
	>(getEstimatedDealValue(sessionUser?.quickStartDefaults?.personaId));
	const [profileMonthsToCalculate, setProfileMonthsToCalculate] = useState<
		string | number
	>(12);
	const [profitMargin, setProfitMargin] = useState<string | number>(65);
	const [monthlyOverhead, setMonthlyOverhead] = useState<string | number>(3000);
	const [avgDaysToClose, setAvgDaysToClose] = useState<string | number>(45);
	const [hoursPerDealManual, setHoursPerDealManual] = useState<string | number>(
		12,
	);

	// Benchmark presets based on team size
	const applyBenchmark = (benchmarkType: "small" | "medium" | "enterprise") => {
		const benchmarks = {
			small: {
				dealsPerMonth: 3.5,
				dealValue: 300000,
				profitMargin: 17.5,
				daysToClose: 35,
				hoursPerDeal: 30,
				overhead: 8000,
			},
			medium: {
				dealsPerMonth: 6.5,
				dealValue: 375000,
				profitMargin: 20,
				daysToClose: 30,
				hoursPerDeal: 25,
				overhead: 16000,
			},
			enterprise: {
				dealsPerMonth: 12.5,
				dealValue: 500000,
				profitMargin: 25,
				daysToClose: 20,
				hoursPerDeal: 15,
				overhead: 40000,
			},
		};

		const benchmark = benchmarks[benchmarkType];
		setProfileDealsPerMonth(benchmark.dealsPerMonth);
		setProfileAvgDealValue(benchmark.dealValue);
		setProfitMargin(benchmark.profitMargin);
		setAvgDaysToClose(benchmark.daysToClose);
		setHoursPerDealManual(benchmark.hoursPerDeal);
		setMonthlyOverhead(benchmark.overhead);
	};

	const calculateROI = (): ROIMetrics => {
		const costs = planCosts[plan];

		// Convert inputs to numbers with defaults
		const leads = Number(leadsGenerated) || 0;
		const conversion = Number(conversionRate) || 0;
		const dealValue = Number(avgDealValue) || 0;
		const calls = Number(callsMade) || 0;
		const sms = Number(smsSent) || 0;
		const social = Number(socialResponses) || 0;

		// Calculate campaign costs
		const callCost = ((calls * 5) / 5) * costs.callCostPer5Min; // Assuming 5 min avg per call
		const smsCost = sms * costs.smsCostPerMessage;
		const socialCost = social * costs.socialResponseCost;

		// Total costs
		const totalCost = costs.monthlyPrice + callCost + smsCost + socialCost;

		// Calculate revenue
		const conversions = (leads * conversion) / 100;
		const totalRevenue = conversions * dealValue;

		// ROI calculation
		const roi =
			totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
		const costPerLead = leads > 0 ? totalCost / leads : 0;
		const costPerConversion = conversions > 0 ? totalCost / conversions : 0;

		return {
			totalRevenue,
			totalCost,
			roi,
			averageDealValue: dealValue,
			costPerLead,
			costPerConversion,
		};
	};

	const calculateProfileROI = (): ROIMetrics & {
		netProfit: number;
		actualProfit: number;
		totalTimeSaved: number;
	} => {
		// Get user's actual subscription tier
		const userTier = sessionUser?.tier?.toLowerCase() || "basic";
		const costs = planCosts[userTier as SubscriptionPlan] || planCosts.basic;

		// Calculate for profile-based nurturing - convert string inputs to numbers
		const monthlyDeals = Number(profileDealsPerMonth) || 0;
		const totalMonths = Number(profileMonthsToCalculate) || 1;
		const dealValue = Number(profileAvgDealValue) || 0;
		const margin = Number(profitMargin) || 0;
		const overhead = Number(monthlyOverhead) || 0;
		const hoursPerDeal = Number(hoursPerDealManual) || 0;

		const totalDeals = monthlyDeals * totalMonths;
		const grossRevenue = totalDeals * dealValue;

		// Apply profit margin to get actual profit from deals
		const revenueProfit = grossRevenue * (margin / 100);

		// Estimate campaign costs for follow-up nurturing
		// Assume 10 touches per lead, 30% calls, 50% SMS, 20% social
		const leadsNeeded = totalDeals * 5; // 5 leads per deal (20% conversion)
		const touchesPerLead = 10;
		const totalTouches = leadsNeeded * touchesPerLead;

		const calls = Math.round(totalTouches * 0.3);
		const smsMessages = Math.round(totalTouches * 0.5);
		const socialResponses = Math.round(totalTouches * 0.2);

		const callCost = ((calls * 5) / 5) * costs.callCostPer5Min;
		const smsCost = smsMessages * costs.smsCostPerMessage;
		const socialCost = socialResponses * costs.socialResponseCost;
		const subscriptionCost = costs.monthlyPrice * totalMonths;
		const overheadCost = overhead * totalMonths;

		const totalCost =
			subscriptionCost + callCost + smsCost + socialCost + overheadCost;
		const netProfit = revenueProfit - totalCost;
		const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
		const costPerLead = leadsNeeded > 0 ? totalCost / leadsNeeded : 0;
		const costPerConversion = totalDeals > 0 ? totalCost / totalDeals : 0;

		// Calculate time saved through automation
		// Automation saves 70% of manual time on follow-ups, scheduling, and admin tasks
		const totalTimeSaved = totalDeals * hoursPerDeal * 0.7;

		return {
			totalRevenue: grossRevenue,
			totalCost,
			roi,
			averageDealValue: dealValue,
			costPerLead,
			costPerConversion,
			netProfit,
			actualProfit: revenueProfit,
			totalTimeSaved,
		};
	};

	const metrics = calculateROI();
	const profileMetrics = calculateProfileROI();
	const isPositiveROI = metrics.roi > 0;
	const isProfileROIPositive = profileMetrics.roi > 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Calculator className="h-5 w-5 text-primary" />
					<CardTitle>ROI Calculator</CardTitle>
				</div>
				<CardDescription>
					Calculate your return on investment based on your subscription plan
					and campaign activity
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="profile" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="profile" className="flex items-center gap-2">
							<User className="h-4 w-4" />
							Profile-Based ROI
						</TabsTrigger>
						<TabsTrigger value="manual" className="flex items-center gap-2">
							<Calculator className="h-4 w-4" />
							Manual Calculator
						</TabsTrigger>
					</TabsList>

					{/* Profile-Based ROI Tab */}
					<TabsContent value="profile" className="mt-6">
						<div className="grid gap-6 md:grid-cols-2">
							{/* Input Section */}
							<div className="space-y-4">
								<div className="rounded-lg bg-muted p-3 text-sm">
									<p className="font-medium">Your Profile:</p>
									<p className="text-muted-foreground mt-1">
										Persona:{" "}
										<span className="font-medium text-foreground capitalize">
											{sessionUser?.quickStartDefaults?.personaId || "Not set"}
										</span>
									</p>
									<p className="text-muted-foreground">
										Goal:{" "}
										<span className="font-medium text-foreground capitalize">
											{sessionUser?.quickStartDefaults?.goalId?.replace(
												/-/g,
												" ",
											) || "Not set"}
										</span>
									</p>
									<p className="text-muted-foreground">
										Tier:{" "}
										<span className="font-medium text-foreground capitalize">
											{sessionUser?.tier || "Basic"}
										</span>
									</p>
								</div>

								{/* Benchmark Presets */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label className="text-sm font-medium">
											Quick Benchmarks (Team Size):
										</Label>
										<div className="rounded-md bg-primary/10 px-2 py-1">
											<span className="text-xs font-medium text-primary">
												Using {sessionUser?.tier || "Basic"} Tier Pricing
											</span>
										</div>
									</div>
									<div className="grid grid-cols-3 gap-2">
										<button
											type="button"
											onClick={() => applyBenchmark("small")}
											className="rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 p-3 text-center transition-colors"
										>
											<p className="font-semibold text-sm">Small Team</p>
											<p className="text-xs text-muted-foreground mt-1">
												3-4 deals/mo
											</p>
										</button>
										<button
											type="button"
											onClick={() => applyBenchmark("medium")}
											className="rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 p-3 text-center transition-colors"
										>
											<p className="font-semibold text-sm">Medium Team</p>
											<p className="text-xs text-muted-foreground mt-1">
												5-8 deals/mo
											</p>
										</button>
										<button
											type="button"
											onClick={() => applyBenchmark("enterprise")}
											className="rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 p-3 text-center transition-colors"
										>
											<p className="font-semibold text-sm">Enterprise</p>
											<p className="text-xs text-muted-foreground mt-1">
												10-15 deals/mo
											</p>
										</button>
									</div>

									{/* Benchmark Details Collapsible */}
									<Collapsible>
										<CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
											<Info className="h-3 w-3" />
											View benchmark details & tier pricing
											<ChevronDown className="h-3 w-3" />
										</CollapsibleTrigger>
										<CollapsibleContent className="mt-2">
											<div className="rounded-lg border bg-muted/50 p-3 text-xs space-y-3">
												{/* Tier Pricing Info */}
												<div className="rounded-md bg-primary/10 p-2 mb-2">
													<p className="font-semibold text-primary mb-1">
														Your Tier: {sessionUser?.tier || "Basic"}
													</p>
													<div className="space-y-2">
														<div>
															<p className="text-xs font-semibold text-primary uppercase">
																Communication
															</p>
															<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground text-xs">
																<p>
																	Monthly: $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.monthlyPrice.toLocaleString()}
																</p>
																<p>
																	Call (5 min): $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.callCostPer5Min.toFixed(2)}
																</p>
																<p>
																	SMS (10 msgs): $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.smsCostPerMessage.toFixed(2)}
																</p>
																<p>
																	Social (10 msgs): $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.socialResponseCost.toFixed(2)}
																</p>
															</div>
														</div>
														<div>
															<p className="text-xs font-semibold text-primary uppercase">
																Data Enrichment
															</p>
															<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground text-xs">
																<p>
																	Phone Validation: $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.phoneValidation.toFixed(3)}
																</p>
																<p>
																	Contact Verify: $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.realContact.toFixed(3)}
																</p>
																<p>
																	Reverse Phone: $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.reversePhone.toFixed(3)}
																</p>
																<p>
																	Address Lookup: $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.reverseAddress.toFixed(3)}
																</p>
																<p>
																	Caller ID: $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.callerIdApi.toFixed(3)}
																</p>
																<p>
																	Name Lookup: $
																	{planCosts[
																		(sessionUser?.tier?.toLowerCase() ||
																			"basic") as SubscriptionPlan
																	]?.smartCnam.toFixed(3)}
																</p>
															</div>
														</div>
													</div>
												</div>

												<div className="h-px bg-border" />

												{/* Benchmark Details */}
												<div>
													<p className="font-semibold text-foreground mb-1">
														Small Team (3-4 deals/mo)
													</p>
													<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
														<p>Avg Deal: $250k-$350k</p>
														<p>Margin: 15-20%</p>
														<p>Days to Close: 30-40d</p>
														<p>Hours/Deal: 25-35h</p>
														<p>Overhead: $6k-$10k/mo</p>
													</div>
												</div>
												<div>
													<p className="font-semibold text-foreground mb-1">
														Medium Team (5-8 deals/mo)
													</p>
													<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
														<p>Avg Deal: $300k-$450k</p>
														<p>Margin: 18-22%</p>
														<p>Days to Close: 25-35d</p>
														<p>Hours/Deal: 20-30h</p>
														<p>Overhead: $12k-$20k/mo</p>
													</div>
												</div>
												<div>
													<p className="font-semibold text-foreground mb-1">
														Enterprise (10-15 deals/mo)
													</p>
													<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
														<p>Avg Deal: $400k-$600k</p>
														<p>Margin: 20-30%</p>
														<p>Days to Close: 15-25d</p>
														<p>Hours/Deal: 10-20h</p>
														<p>Overhead: $30k-$50k+/mo</p>
													</div>
												</div>
											</div>
										</CollapsibleContent>
									</Collapsible>
								</div>

								<div className="space-y-2">
									<Label htmlFor="profileDeals">Average Deals Per Month</Label>
									<Input
										id="profileDeals"
										type="text"
										inputMode="numeric"
										value={profileDealsPerMonth}
										onChange={(e) =>
											setProfileDealsPerMonth(
												handleNumericInput(e.target.value),
											)
										}
									/>
									<p className="text-xs text-muted-foreground">
										Based on your{" "}
										{sessionUser?.quickStartDefaults?.personaId || "profile"}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label htmlFor="profileDealValue" className="text-xs">
											Avg Deal Value ($)
										</Label>
										<Input
											id="profileDealValue"
											type="text"
											inputMode="numeric"
											value={profileAvgDealValue}
											onChange={(e) =>
												setProfileAvgDealValue(
													handleNumericInput(e.target.value),
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="profitMargin" className="text-xs">
											Profit Margin (%)
										</Label>
										<Input
											id="profitMargin"
											type="text"
											inputMode="numeric"
											value={profitMargin}
											onChange={(e) => {
												const val = handleNumericInput(e.target.value);
												const num = Number(val);
												if (val === "" || (num >= 0 && num <= 100)) {
													setProfitMargin(val);
												}
											}}
										/>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-3">
									<div className="space-y-2">
										<Label htmlFor="months" className="text-xs">
											Time Period (Mo)
										</Label>
										<Input
											id="months"
											type="text"
											inputMode="numeric"
											value={profileMonthsToCalculate}
											onChange={(e) => {
												const val = handleNumericInput(e.target.value);
												const num = Number(val);
												if (val === "" || (num >= 1 && num <= 36)) {
													setProfileMonthsToCalculate(val);
												}
											}}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="daysToClose" className="text-xs">
											Avg Days to Close
										</Label>
										<Input
											id="daysToClose"
											type="text"
											inputMode="numeric"
											value={avgDaysToClose}
											onChange={(e) =>
												setAvgDaysToClose(handleNumericInput(e.target.value))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="hoursPerDeal" className="text-xs">
											Hours/Deal Manual
										</Label>
										<Input
											id="hoursPerDeal"
											type="text"
											inputMode="numeric"
											value={hoursPerDealManual}
											onChange={(e) =>
												setHoursPerDealManual(
													handleNumericInput(e.target.value),
												)
											}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="overhead" className="text-xs">
										Monthly Overhead ($)
									</Label>
									<Input
										id="overhead"
										type="text"
										inputMode="numeric"
										value={monthlyOverhead}
										onChange={(e) =>
											setMonthlyOverhead(handleNumericInput(e.target.value))
										}
									/>
									<p className="text-xs text-muted-foreground">
										Office, staff, utilities, etc.
									</p>
								</div>

								<div className="rounded-lg border p-3 text-sm">
									<p className="font-medium">Projected Activity:</p>
									<p className="text-muted-foreground mt-1">
										Total Deals:{" "}
										<span className="font-medium text-foreground">
											{(
												(Number(profileDealsPerMonth) || 0) *
												(Number(profileMonthsToCalculate) || 1)
											).toLocaleString()}
										</span>
									</p>
									<p className="text-muted-foreground">
										Follow-up Touches:{" "}
										<span className="font-medium text-foreground">
											{(
												(Number(profileDealsPerMonth) || 0) *
												(Number(profileMonthsToCalculate) || 1) *
												5 *
												10
											).toLocaleString()}
										</span>
									</p>
									<p className="text-muted-foreground">
										Time Saved:{" "}
										<span className="font-medium text-blue-600 dark:text-blue-500">
											{(
												(Number(profileDealsPerMonth) || 0) *
												(Number(profileMonthsToCalculate) || 1) *
												(Number(hoursPerDealManual) || 0) *
												0.7
											).toLocaleString("en-US", {
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											})}
											h
										</span>
										<span className="text-xs ml-1">(70% automation)</span>
									</p>
								</div>
							</div>

							{/* Results Section */}
							<div className="space-y-4">
								{/* ROI Highlight Card */}
								<div className="rounded-lg border-2 border-green-500/40 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<TrendingUp
												className={cn(
													"h-6 w-6",
													isProfileROIPositive
														? "text-green-600 dark:text-green-500"
														: "text-red-600 dark:text-red-500",
												)}
											/>
											<span className="font-semibold text-lg text-green-700 dark:text-green-400">
												ROI
											</span>
										</div>
										<span
											className={cn(
												"font-bold text-4xl",
												isProfileROIPositive
													? "text-green-600 dark:text-green-500"
													: "text-red-600 dark:text-red-500",
											)}
										>
											{profileMetrics.roi.toLocaleString("en-US", {
												minimumFractionDigits: 1,
												maximumFractionDigits: 1,
											})}
											%
										</span>
									</div>
								</div>

								{/* Financial Summary */}
								<div className="rounded-lg bg-muted p-4 space-y-2">
									<div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
										<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Financial Breakdown
										</span>
										<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
											{sessionUser?.tier || "Basic"} Tier
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Gross Revenue</span>
										<span className="font-semibold">
											${profileMetrics.totalRevenue.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											Deal Profit ({Number(profitMargin) || 0}%)
										</span>
										<span className="font-semibold text-green-600 dark:text-green-500">
											${profileMetrics.actualProfit.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Total Costs</span>
										<span className="font-semibold text-red-600 dark:text-red-500">
											${profileMetrics.totalCost.toLocaleString()}
										</span>
									</div>
									<Collapsible>
										<CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
											<ChevronDown className="h-3 w-3" />
											View cost breakdown
										</CollapsibleTrigger>
										<CollapsibleContent className="space-y-1 pt-1">
											<div className="flex items-center justify-between text-xs pl-4">
												<span className="text-muted-foreground">
													Subscription ({sessionUser?.tier || "Basic"}):
												</span>
												<span className="font-medium">
													$
													{(
														planCosts[
															(sessionUser?.tier?.toLowerCase() ||
																"basic") as SubscriptionPlan
														]?.monthlyPrice *
														(Number(profileMonthsToCalculate) || 1)
													).toLocaleString()}
												</span>
											</div>
											<div className="flex items-center justify-between text-xs pl-4">
												<span className="text-muted-foreground">
													Campaign Costs:
												</span>
												<span className="font-medium">
													$
													{(
														profileMetrics.totalCost -
														planCosts[
															(sessionUser?.tier?.toLowerCase() ||
																"basic") as SubscriptionPlan
														]?.monthlyPrice *
															(Number(profileMonthsToCalculate) || 1) -
														(Number(monthlyOverhead) || 0) *
															(Number(profileMonthsToCalculate) || 1)
													).toLocaleString()}
												</span>
											</div>
											<div className="flex items-center justify-between text-xs pl-4">
												<span className="text-muted-foreground">Overhead:</span>
												<span className="font-medium">
													$
													{(
														(Number(monthlyOverhead) || 0) *
														(Number(profileMonthsToCalculate) || 1)
													).toLocaleString()}
												</span>
											</div>
										</CollapsibleContent>
									</Collapsible>
									<div className="h-px bg-border my-2" />
									<div className="flex items-center justify-between">
										<span className="font-medium">Net Profit</span>
										<span
											className={cn(
												"font-bold text-xl",
												profileMetrics.netProfit >= 0
													? "text-green-600 dark:text-green-500"
													: "text-red-600 dark:text-red-500",
											)}
										>
											${profileMetrics.netProfit.toLocaleString()}
										</span>
									</div>
								</div>

								{/* Highlighted Metrics - Profit & Time Saved */}
								<div className="grid grid-cols-2 gap-4">
									<div className="rounded-lg border-2 border-green-500/30 bg-green-50 dark:bg-green-950/20 p-4">
										<p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
											💰 Profit/Deal
										</p>
										<p className="font-bold text-3xl text-green-600 dark:text-green-500 mt-2">
											$
											{(
												profileMetrics.netProfit /
												((Number(profileDealsPerMonth) || 1) *
													(Number(profileMonthsToCalculate) || 1))
											).toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</p>
									</div>
									<div className="rounded-lg border-2 border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 p-4">
										<p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
											⏱️ Time Saved
										</p>
										<p className="font-bold text-3xl text-blue-600 dark:text-blue-500 mt-2">
											{profileMetrics.totalTimeSaved.toLocaleString("en-US", {
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											})}
											h
										</p>
										<p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
											{(profileMetrics.totalTimeSaved / 8).toLocaleString(
												"en-US",
												{
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												},
											)}{" "}
											work days
										</p>
									</div>
								</div>

								{/* Additional Metrics */}
								<div className="grid grid-cols-2 gap-3">
									<div className="rounded-lg border p-3">
										<p className="text-xs text-muted-foreground">Cost/Lead</p>
										<p className="font-bold text-lg">
											${profileMetrics.costPerLead.toFixed(2)}
										</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-xs text-muted-foreground">Cost/Deal</p>
										<p className="font-bold text-lg">
											${profileMetrics.costPerConversion.toFixed(2)}
										</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-xs text-muted-foreground">Deal Cycle</p>
										<p className="font-bold text-lg">
											{Number(avgDaysToClose) || 0}d
										</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-xs text-muted-foreground">
											Time/Deal Saved
										</p>
										<p className="font-bold text-lg text-blue-600 dark:text-blue-500">
											{((Number(hoursPerDealManual) || 0) * 0.7).toFixed(1)}h
										</p>
									</div>
								</div>

								<div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-xs">
									<span className="text-amber-600 dark:text-amber-400">
										💡 <strong>Tip:</strong> Based on your profile, we estimate
										nurturing campaigns with consistent follow-up touchpoints
										will save you{" "}
										{(profileMetrics.totalTimeSaved / 8).toLocaleString(
											"en-US",
											{
												minimumFractionDigits: 0,
												maximumFractionDigits: 0,
											},
										)}{" "}
										work days while maximizing conversions.
									</span>
								</div>
							</div>
						</div>
					</TabsContent>

					{/* Manual Calculator Tab */}
					<TabsContent value="manual" className="mt-6">
						<div className="grid gap-6 md:grid-cols-2">
							{/* Input Section */}
							<div className="space-y-4">
								<div className="rounded-lg bg-muted p-3 text-sm mb-4">
									<p className="font-medium">Current Tier:</p>
									<p className="text-muted-foreground mt-1">
										You are on the{" "}
										<span className="font-medium text-foreground capitalize">
											{sessionUser?.tier || "Basic"}
										</span>{" "}
										tier. Select a different plan below to compare.
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="plan">Subscription Plan</Label>
									<Select
										value={plan}
										onValueChange={(v) => setPlan(v as SubscriptionPlan)}
									>
										<SelectTrigger id="plan">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="starter">
												Starter - $1,200/mo
											</SelectItem>
											<SelectItem value="basic">Basic - $2,400/mo</SelectItem>
											<SelectItem value="enterprise">
												Enterprise - $5,000/mo
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="leads">Leads Generated</Label>
									<Input
										id="leads"
										type="text"
										inputMode="numeric"
										value={leadsGenerated}
										onChange={(e) =>
											setLeadsGenerated(handleNumericInput(e.target.value))
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="conversion">Conversion Rate (%)</Label>
									<Input
										id="conversion"
										type="text"
										inputMode="numeric"
										value={conversionRate}
										onChange={(e) => {
											const val = handleNumericInput(e.target.value);
											const num = Number(val);
											if (val === "" || (num >= 0 && num <= 100)) {
												setConversionRate(val);
											}
										}}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="dealValue">Average Deal Value ($)</Label>
									<Input
										id="dealValue"
										type="text"
										inputMode="numeric"
										value={avgDealValue}
										onChange={(e) =>
											setAvgDealValue(handleNumericInput(e.target.value))
										}
									/>
								</div>

								<div className="grid grid-cols-3 gap-2">
									<div className="space-y-2">
										<Label htmlFor="calls" className="text-xs">
											Calls Made
										</Label>
										<Input
											id="calls"
											type="text"
											inputMode="numeric"
											value={callsMade}
											onChange={(e) =>
												setCallsMade(handleNumericInput(e.target.value))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="sms" className="text-xs">
											SMS Threads
										</Label>
										<Input
											id="sms"
											type="text"
											inputMode="numeric"
											value={smsSent}
											onChange={(e) =>
												setSmsSent(handleNumericInput(e.target.value))
											}
											placeholder="10 msgs each"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="social" className="text-xs">
											Social Threads
										</Label>
										<Input
											id="social"
											type="text"
											inputMode="numeric"
											value={socialResponses}
											onChange={(e) =>
												setSocialResponses(handleNumericInput(e.target.value))
											}
											placeholder="10 msgs each"
										/>
									</div>
								</div>
							</div>

							{/* Results Section */}
							<div className="space-y-4">
								<div className="rounded-lg bg-muted p-4 space-y-3">
									<div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
										<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Financial Summary
										</span>
										<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded capitalize">
											{plan} Tier
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Total Revenue</span>
										<span className="font-bold text-lg text-green-600 dark:text-green-500">
											${metrics.totalRevenue.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Total Cost</span>
										<span className="font-bold text-lg text-red-600 dark:text-red-500">
											${metrics.totalCost.toLocaleString()}
										</span>
									</div>
									<div className="h-px bg-border" />
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<TrendingUp
												className={cn(
													"h-4 w-4",
													isPositiveROI
														? "text-green-600 dark:text-green-500"
														: "text-red-600 dark:text-red-500",
												)}
											/>
											<span className="font-semibold">ROI</span>
										</div>
										<span
											className={cn(
												"font-bold text-2xl",
												isPositiveROI
													? "text-green-600 dark:text-green-500"
													: "text-red-600 dark:text-red-500",
											)}
										>
											{metrics.roi.toLocaleString("en-US", {
												minimumFractionDigits: 1,
												maximumFractionDigits: 1,
											})}
											%
										</span>
									</div>
								</div>

								<div className="space-y-2 rounded-lg border p-4">
									<h4 className="font-medium text-sm">Cost Metrics</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Cost per Lead
											</span>
											<span className="font-medium">
												${metrics.costPerLead.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Cost per Conversion
											</span>
											<span className="font-medium">
												${metrics.costPerConversion.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Expected Conversions
											</span>
											<span className="font-medium">
												{(
													((Number(leadsGenerated) || 0) *
														(Number(conversionRate) || 0)) /
													100
												).toFixed(0)}
											</span>
										</div>
									</div>
								</div>

								<div className="rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
									💡 <strong>Tip:</strong> A positive ROI indicates profitable
									campaigns. Aim for ROI above 100% for sustainable growth.
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
