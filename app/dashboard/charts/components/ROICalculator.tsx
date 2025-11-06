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
import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { cn } from "@/lib/_utils";
import type { SubscriptionPlan, ROIMetrics } from "../types/analytics";

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

export function ROICalculator() {
	const [plan, setPlan] = useState<SubscriptionPlan>("basic");
	const [leadsGenerated, setLeadsGenerated] = useState<number>(500);
	const [conversionRate, setConversionRate] = useState<number>(20);
	const [avgDealValue, setAvgDealValue] = useState<number>(5000);
	const [callsMade, setCallsMade] = useState<number>(200);
	const [smsSent, setSmsSent] = useState<number>(300);
	const [mailSent, setMailSent] = useState<number>(100);

	const calculateROI = (): ROIMetrics => {
		const costs = planCosts[plan];

		// Calculate campaign costs
		const callCost = ((callsMade * 5) / 5) * costs.callCostPer5Min; // Assuming 5 min avg per call
		const smsCost = smsSent * costs.smsCostPerMessage;
		const mailCost = mailSent * costs.directMailCostPerPiece;

		// Total costs
		const totalCost = costs.monthlyPrice + callCost + smsCost + mailCost;

		// Calculate revenue
		const conversions = (leadsGenerated * conversionRate) / 100;
		const totalRevenue = conversions * avgDealValue;

		// ROI calculation
		const roi =
			totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
		const costPerLead = leadsGenerated > 0 ? totalCost / leadsGenerated : 0;
		const costPerConversion = conversions > 0 ? totalCost / conversions : 0;

		return {
			totalRevenue,
			totalCost,
			roi,
			averageDealValue: avgDealValue,
			costPerLead,
			costPerConversion,
		};
	};

	const metrics = calculateROI();
	const isPositiveROI = metrics.roi > 0;

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
									<SelectItem value="starter">Starter - $1,200/mo</SelectItem>
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
								type="number"
								value={leadsGenerated}
								onChange={(e) => setLeadsGenerated(Number(e.target.value))}
								min={0}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="conversion">Conversion Rate (%)</Label>
							<Input
								id="conversion"
								type="number"
								value={conversionRate}
								onChange={(e) => setConversionRate(Number(e.target.value))}
								min={0}
								max={100}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="dealValue">Average Deal Value ($)</Label>
							<Input
								id="dealValue"
								type="number"
								value={avgDealValue}
								onChange={(e) => setAvgDealValue(Number(e.target.value))}
								min={0}
							/>
						</div>

						<div className="grid grid-cols-3 gap-2">
							<div className="space-y-2">
								<Label htmlFor="calls" className="text-xs">
									Calls Made
								</Label>
								<Input
									id="calls"
									type="number"
									value={callsMade}
									onChange={(e) => setCallsMade(Number(e.target.value))}
									min={0}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sms" className="text-xs">
									SMS Sent
								</Label>
								<Input
									id="sms"
									type="number"
									value={smsSent}
									onChange={(e) => setSmsSent(Number(e.target.value))}
									min={0}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="mail" className="text-xs">
									Mail Sent
								</Label>
								<Input
									id="mail"
									type="number"
									value={mailSent}
									onChange={(e) => setMailSent(Number(e.target.value))}
									min={0}
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
									<span className="text-muted-foreground">Cost per Lead</span>
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
										{((leadsGenerated * conversionRate) / 100).toFixed(0)}
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
			</CardContent>
		</Card>
	);
}
