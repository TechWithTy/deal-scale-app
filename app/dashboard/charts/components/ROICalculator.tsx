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
import { useState } from "react";
import { Calculator, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/_utils";
import type { SubscriptionPlan, ROIMetrics } from "../types/analytics";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";

const planCosts = {
	basic: {
		monthlyPrice: 2400,
		aiCreditsPerMonth: 2400,
		callCostPer5Min: 0.25,
		smsCostPerMessage: 0.03,
		directMailCostPerPiece: 0.61,
	},
	starter: {
		monthlyPrice: 1200,
		aiCreditsPerMonth: 1200,
		callCostPer5Min: 0.2,
		smsCostPerMessage: 0.025,
		directMailCostPerPiece: 0.58,
	},
	enterprise: {
		monthlyPrice: 5000,
		aiCreditsPerMonth: 5000,
		callCostPer5Min: 0.18,
		smsCostPerMessage: 0.02,
		directMailCostPerPiece: 0.55,
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
	const [mailSent, setMailSent] = useState<string | number>(100);

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

	const calculateROI = (): ROIMetrics => {
		const costs = planCosts[plan];

		// Convert inputs to numbers with defaults
		const leads = Number(leadsGenerated) || 0;
		const conversion = Number(conversionRate) || 0;
		const dealValue = Number(avgDealValue) || 0;
		const calls = Number(callsMade) || 0;
		const sms = Number(smsSent) || 0;
		const mail = Number(mailSent) || 0;

		// Calculate campaign costs
		const callCost = ((calls * 5) / 5) * costs.callCostPer5Min; // Assuming 5 min avg per call
		const smsCost = sms * costs.smsCostPerMessage;
		const mailCost = mail * costs.directMailCostPerPiece;

		// Total costs
		const totalCost = costs.monthlyPrice + callCost + smsCost + mailCost;

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

		const totalDeals = monthlyDeals * totalMonths;
		const grossRevenue = totalDeals * dealValue;

		// Apply profit margin to get actual profit from deals
		const revenueProfit = grossRevenue * (margin / 100);

		// Estimate campaign costs for follow-up nurturing
		// Assume 10 touches per lead, 30% calls, 50% SMS, 20% mail
		const leadsNeeded = totalDeals * 5; // 5 leads per deal (20% conversion)
		const touchesPerLead = 10;
		const totalTouches = leadsNeeded * touchesPerLead;

		const calls = Math.round(totalTouches * 0.3);
		const smsMessages = Math.round(totalTouches * 0.5);
		const mailPieces = Math.round(totalTouches * 0.2);

		const callCost = ((calls * 5) / 5) * costs.callCostPer5Min;
		const smsCost = smsMessages * costs.smsCostPerMessage;
		const mailCost = mailPieces * costs.directMailCostPerPiece;
		const subscriptionCost = costs.monthlyPrice * totalMonths;
		const overheadCost = overhead * totalMonths;

		const totalCost =
			subscriptionCost + callCost + smsCost + mailCost + overheadCost;
		const netProfit = revenueProfit - totalCost;
		const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
		const costPerLead = leadsNeeded > 0 ? totalCost / leadsNeeded : 0;
		const costPerConversion = totalDeals > 0 ? totalCost / totalDeals : 0;

		return {
			totalRevenue: grossRevenue,
			totalCost,
			roi,
			averageDealValue: dealValue,
			costPerLead,
			costPerConversion,
			netProfit,
			actualProfit: revenueProfit,
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

								<div className="grid grid-cols-2 gap-3">
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
								</div>
							</div>

							{/* Results Section */}
							<div className="space-y-4">
								<div className="rounded-lg bg-muted p-4 space-y-2">
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
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<TrendingUp
												className={cn(
													"h-4 w-4",
													isProfileROIPositive
														? "text-green-600 dark:text-green-500"
														: "text-red-600 dark:text-red-500",
												)}
											/>
											<span className="font-semibold">ROI</span>
										</div>
										<span
											className={cn(
												"font-bold text-2xl",
												isProfileROIPositive
													? "text-green-600 dark:text-green-500"
													: "text-red-600 dark:text-red-500",
											)}
										>
											{profileMetrics.roi.toFixed(1)}%
										</span>
									</div>
								</div>

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
										<p className="text-xs text-muted-foreground">Profit/Deal</p>
										<p className="font-bold text-lg text-green-600 dark:text-green-500">
											$
											{(
												profileMetrics.netProfit /
												((Number(profileDealsPerMonth) || 1) *
													(Number(profileMonthsToCalculate) || 1))
											).toFixed(0)}
										</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-xs text-muted-foreground">Deal Cycle</p>
										<p className="font-bold text-lg">
											{Number(avgDaysToClose) || 0}d
										</p>
									</div>
								</div>

								<div className="rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
									💡 <strong>Tip:</strong> Based on your profile, we estimate
									nurturing campaigns with consistent follow-up touchpoints for
									optimal conversions.
								</div>
							</div>
						</div>
					</TabsContent>

					{/* Manual Calculator Tab */}
					<TabsContent value="manual" className="mt-6">
						<div className="grid gap-6 md:grid-cols-2">
							{/* Input Section */}
							<div className="space-y-4">
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
											SMS Sent
										</Label>
										<Input
											id="sms"
											type="text"
											inputMode="numeric"
											value={smsSent}
											onChange={(e) =>
												setSmsSent(handleNumericInput(e.target.value))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="mail" className="text-xs">
											Mail Sent
										</Label>
										<Input
											id="mail"
											type="text"
											inputMode="numeric"
											value={mailSent}
											onChange={(e) =>
												setMailSent(handleNumericInput(e.target.value))
											}
										/>
									</div>
								</div>
							</div>

							{/* Results Section */}
							<div className="space-y-4">
								<div className="rounded-lg bg-muted p-4 space-y-3">
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
											{metrics.roi.toFixed(1)}%
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
