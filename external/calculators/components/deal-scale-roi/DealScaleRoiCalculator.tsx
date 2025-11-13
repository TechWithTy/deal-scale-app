"use client";

import { useMemo, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/_utils";
import {
	computeDealScaleManualRoi,
	computeDealScaleProfileRoi,
	dealScaleBenchmarkPresets,
	dealScalePlanPricing,
	estimateDealValue,
	estimateDealsPerMonth,
	normalizeTierToPlanId,
} from "../../utils/dealScaleRoi";
import type { DealScaleBenchmarkKey } from "../../utils/dealScaleRoi";
import type { DealScalePlanId } from "../../constants/dealScalePricing";
import {
	type DealScaleRoiCalculatorProps,
	type ManualInputsState,
	type ProfileInputsState,
} from "./types";
import { ManualRoiTab } from "./ManualRoiTab";
import { ProfileRoiTab } from "./ProfileRoiTab";

function sanitizeNumericInput(value: string): string {
	if (value === "") return "";
	const allowed = value.replace(/[^\d.]/g, "");
	const [integer, ...rest] = allowed.split(".");
	return rest.length > 0 ? `${integer}.${rest.join("")}` : integer;
}

function parseNumeric(value: string, fallback = 0): number {
	if (!value) return fallback;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function DealScaleRoiCalculator({
	session,
	className,
}: DealScaleRoiCalculatorProps) {
	const personaId = session?.quickStartDefaults?.personaId ?? undefined;
	const goalId = session?.quickStartDefaults?.goalId ?? undefined;
	const tierLabel = session?.tier ?? "Basic";
	const planForTier =
		dealScalePlanPricing[normalizeTierToPlanId(session?.tier)];

	const defaultPlan: DealScalePlanId = normalizeTierToPlanId(session?.tier);
	const [manualInputs, setManualInputs] = useState<ManualInputsState>({
		plan: defaultPlan,
		leadsGenerated: "500",
		conversionRate: "20",
		avgDealValue: "5000",
		callsMade: "200",
		smsThreads: "300",
		socialThreads: "100",
	});

	const [profileInputs, setProfileInputs] = useState<ProfileInputsState>({
		dealsPerMonth: estimateDealsPerMonth(personaId, goalId).toString(),
		avgDealValue: estimateDealValue(personaId).toString(),
		months: "12",
		profitMarginPercent: "65",
		monthlyOverhead: "3000",
		hoursPerDeal: "12",
	});
	const [avgDaysToClose, setAvgDaysToClose] = useState<string>("45");
	const [selectedBenchmark, setSelectedBenchmark] =
		useState<DealScaleBenchmarkKey | null>(null);

	const manualMetrics = useMemo(
		() =>
			computeDealScaleManualRoi({
				plan: manualInputs.plan,
				leadsGenerated: parseNumeric(manualInputs.leadsGenerated),
				conversionRate: parseNumeric(manualInputs.conversionRate),
				avgDealValue: parseNumeric(manualInputs.avgDealValue),
				callsMade: parseNumeric(manualInputs.callsMade),
				smsThreads: parseNumeric(manualInputs.smsThreads),
				socialThreads: parseNumeric(manualInputs.socialThreads),
			}),
		[manualInputs],
	);

	const profileMetrics = useMemo(
		() =>
			computeDealScaleProfileRoi({
				personaId,
				goalId,
				tier: session?.tier,
				dealsPerMonth: parseNumeric(profileInputs.dealsPerMonth, 0),
				avgDealValue: parseNumeric(profileInputs.avgDealValue, 0),
				months: parseNumeric(profileInputs.months, 12),
				profitMarginPercent: parseNumeric(
					profileInputs.profitMarginPercent,
					65,
				),
				monthlyOverhead: parseNumeric(profileInputs.monthlyOverhead, 3000),
				hoursPerDeal: parseNumeric(profileInputs.hoursPerDeal, 12),
			}),
		[goalId, personaId, profileInputs, session?.tier],
	);

	const handleManualInputChange = (
		field: keyof ManualInputsState,
		rawValue: string,
	) => {
		if (field === "plan") return;
		const sanitized = sanitizeNumericInput(rawValue);
		let nextValue = sanitized;
		if (field === "conversionRate" && sanitized !== "") {
			const numeric = Math.min(Math.max(parseNumeric(sanitized, 0), 0), 100);
			nextValue = numeric.toString();
		}
		setManualInputs((previous) => ({ ...previous, [field]: nextValue }));
	};

	const handleProfileInputChange = (
		field: keyof ProfileInputsState,
		rawValue: string,
	) => {
		const sanitized = sanitizeNumericInput(rawValue);
		if (sanitized === "") {
			setProfileInputs((previous) => ({ ...previous, [field]: "" }));
			return;
		}
		let numeric = parseNumeric(sanitized, 0);
		if (field === "profitMarginPercent") {
			numeric = Math.min(Math.max(numeric, 0), 100);
		}
		if (field === "months") {
			numeric = Math.min(Math.max(Math.round(numeric), 1), 36);
		}
		if (field === "hoursPerDeal") {
			numeric = Math.min(Math.max(numeric, 0), 200);
		}
		setProfileInputs((previous) => ({
			...previous,
			[field]: numeric.toString(),
		}));
	};

	const handleBenchmarkSelect = (key: DealScaleBenchmarkKey) => {
		const preset = dealScaleBenchmarkPresets[key];
		setSelectedBenchmark(key);
		setProfileInputs({
			dealsPerMonth: preset.dealsPerMonth.toString(),
			avgDealValue: preset.dealValue.toString(),
			months: profileInputs.months || "12",
			profitMarginPercent: preset.profitMargin.toString(),
			monthlyOverhead: preset.overhead.toString(),
			hoursPerDeal: preset.hoursPerDeal.toString(),
		});
		setAvgDaysToClose(preset.daysToClose.toString());
	};

	const personaLabel = personaId ? personaId.replace(/_/g, " ") : "";
	const goalLabel = goalId ? goalId.replace(/_/g, " ") : "";

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Calculator className="h-5 w-5" />
					</div>
					<div>
						<CardTitle>ROI Calculator</CardTitle>
						<CardDescription>
							Compare manual scenarios with profile-based automation to quantify
							return on investment.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="profile" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="profile">Profile-Based ROI</TabsTrigger>
						<TabsTrigger value="manual">Manual Calculator</TabsTrigger>
					</TabsList>

					<TabsContent value="profile" className="mt-6 space-y-6">
						<ProfileRoiTab
							personaLabel={personaLabel}
							goalLabel={goalLabel}
							tierLabel={tierLabel}
							inputs={profileInputs}
							avgDaysToClose={avgDaysToClose}
							onAvgDaysChange={(value) => {
								const sanitized = sanitizeNumericInput(value);
								setAvgDaysToClose(sanitized);
							}}
							onInputsChange={handleProfileInputChange}
							onSelectBenchmark={handleBenchmarkSelect}
							selectedBenchmark={selectedBenchmark}
							metrics={profileMetrics}
							planPricing={planForTier}
							benchmarkPresets={dealScaleBenchmarkPresets}
						/>
					</TabsContent>

					<TabsContent value="manual" className="mt-6 space-y-6">
						<ManualRoiTab
							currentTierLabel={tierLabel}
							inputs={manualInputs}
							onInputsChange={handleManualInputChange}
							onPlanChange={(plan) =>
								setManualInputs((previous) => ({ ...previous, plan }))
							}
							metrics={manualMetrics}
							selectedPlan={manualInputs.plan}
						/>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
