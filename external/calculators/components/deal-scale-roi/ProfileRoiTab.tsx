import { Bot, ChevronDown, Info, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/_utils";
import type { ProfileRoiTabProps } from "./types";

const profileFields: Array<{
	id: keyof ProfileRoiTabProps["inputs"];
	label: string;
	hint?: string;
}> = [
	{
		id: "dealsPerMonth",
		label: "Average Deals / Month",
		hint: "Based on persona defaults; adjust for your pipeline.",
	},
	{ id: "avgDealValue", label: "Average Deal Value ($)" },
	{ id: "profitMarginPercent", label: "Profit Margin (%)" },
	{ id: "months", label: "Time Period (Months)" },
	{ id: "hoursPerDeal", label: "Hours per Deal (Manual)" },
	{ id: "monthlyOverhead", label: "Monthly Overhead ($)" },
];

export function ProfileRoiTab({
	personaLabel,
	goalLabel,
	tierLabel,
	inputs,
	avgDaysToClose,
	onAvgDaysChange,
	onInputsChange,
	onSelectBenchmark,
	selectedBenchmark,
	metrics,
	planPricing,
	benchmarkPresets,
}: ProfileRoiTabProps) {
	const isPositiveROI = metrics.roi > 0;

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="space-y-4">
				<div className="rounded-lg bg-muted p-3 text-sm">
					<p className="font-medium">Your Profile</p>
					<ul className="mt-2 space-y-1 text-muted-foreground text-xs">
						<li>
							<span className="font-medium text-foreground">Persona:</span>{" "}
							<span className="capitalize">{personaLabel || "Not set"}</span>
						</li>
						<li>
							<span className="font-medium text-foreground">Goal:</span>{" "}
							<span className="capitalize">
								{goalLabel ? goalLabel.replace(/-/g, " ") : "Not set"}
							</span>
						</li>
						<li>
							<span className="font-medium text-foreground">Tier:</span>{" "}
							<span className="capitalize">{tierLabel || "Basic"}</span>
						</li>
					</ul>
				</div>

				<div className="space-y-2">
					<p className="font-medium text-sm">Quick Benchmarks (Team Size)</p>
					<div className="grid grid-cols-3 gap-2">
						{(
							Object.entries(benchmarkPresets) as Array<
								[
									keyof typeof benchmarkPresets,
									(typeof benchmarkPresets)[keyof typeof benchmarkPresets],
								]
							>
						).map(([key, preset]) => (
							<button
								key={key}
								type="button"
								onClick={() => onSelectBenchmark(key)}
								className={cn(
									"rounded-lg border-2 p-3 text-center transition-all",
									selectedBenchmark === key
										? "border-primary bg-primary/10 shadow-sm"
										: "border-muted hover:border-primary hover:bg-primary/5",
								)}
							>
								<p className="font-semibold text-sm">{preset.badge}</p>
								<p className="mt-1 text-muted-foreground text-xs">
									{preset.sublabel}
								</p>
							</button>
						))}
					</div>
					{selectedBenchmark && (
						<div className="flex items-center gap-2 text-xs text-primary">
							<span className="inline-flex items-center gap-1 rounded bg-primary/20 px-2 py-1 font-medium capitalize">
								<span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
								{benchmarkPresets[selectedBenchmark].badge} benchmark active
							</span>
						</div>
					)}
				</div>

				<div className="grid grid-cols-3 gap-3">
					{profileFields.map(({ id, label, hint }) => (
						<div key={id} className="col-span-3 space-y-2 sm:col-span-1">
							<Label className="text-xs uppercase" htmlFor={`profile-${id}`}>
								{label}
							</Label>
							<Input
								id={`profile-${id}`}
								type="text"
								inputMode="numeric"
								value={inputs[id]}
								onChange={(event) => onInputsChange(id, event.target.value)}
							/>
							{hint && (
								<p className="text-muted-foreground text-[11px]">{hint}</p>
							)}
						</div>
					))}
					<div className="col-span-3 space-y-2 sm:col-span-1">
						<Label className="text-xs uppercase" htmlFor="profile-days">
							Average Days to Close
						</Label>
						<Input
							id="profile-days"
							type="text"
							inputMode="numeric"
							value={avgDaysToClose}
							onChange={(event) => onAvgDaysChange(event.target.value)}
						/>
					</div>
				</div>

				<div className="rounded-lg border p-3 text-sm">
					<p className="font-medium">Projected Activity</p>
					<div className="mt-2 grid gap-2 text-xs text-muted-foreground">
						<p>
							Total Deals:{" "}
							<span className="font-semibold text-foreground">
								{metrics.totalDeals.toLocaleString()}
							</span>
						</p>
						<p>
							Follow-up Touches:{" "}
							<span className="font-semibold text-foreground">
								{metrics.totalTouches.toLocaleString()}
							</span>
						</p>
						<p>
							Time Saved:{" "}
							<span className="font-semibold text-blue-600 dark:text-blue-500">
								{metrics.totalTimeSaved.toLocaleString("en-US", {
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								})}
								h
							</span>{" "}
							(70% automation)
						</p>
					</div>
				</div>

				<Collapsible>
					<CollapsibleTrigger className="flex w-full items-center justify-center gap-2 py-2 text-muted-foreground text-xs transition-colors hover:text-foreground">
						<Info className="h-3 w-3" />
						View tier pricing & enrichment costs
						<ChevronDown className="h-3 w-3" />
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div className="mt-2 grid gap-3 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
							<p className="font-semibold text-foreground">
								{tierLabel || "Basic"} Communication Costs
							</p>
							<div className="grid grid-cols-2 gap-x-4 gap-y-1">
								<p>Monthly: ${planPricing.monthlyPrice.toLocaleString()}</p>
								<p>Call (5 min): ${planPricing.callCostPer5Min.toFixed(2)}</p>
								<p>
									SMS (10 msgs): ${planPricing.smsCostPerMessage.toFixed(2)}
								</p>
								<p>
									Social (10 msgs): ${planPricing.socialResponseCost.toFixed(2)}
								</p>
							</div>
							<p className="font-semibold text-foreground">Data Enrichment</p>
							<div className="grid grid-cols-2 gap-x-4 gap-y-1">
								<p>
									Phone Validation: ${planPricing.phoneValidation.toFixed(3)}
								</p>
								<p>Contact Verify: ${planPricing.realContact.toFixed(3)}</p>
								<p>Reverse Phone: ${planPricing.reversePhone.toFixed(3)}</p>
								<p>Address Lookup: ${planPricing.reverseAddress.toFixed(3)}</p>
							</div>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>

			<div className="space-y-4">
				<div className="rounded-lg border-2 border-green-500/40 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:from-green-950/20 dark:to-emerald-950/20">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Bot className="h-5 w-5 text-primary" />
							<div>
								<p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
									Automated ROI
								</p>
								<p className="text-xs text-muted-foreground">
									Based on profile & campaign automation
								</p>
							</div>
						</div>
						<span
							className={cn(
								"font-bold text-4xl",
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

				<div className="space-y-2 rounded-lg bg-muted p-4">
					<div className="mb-2 flex items-center justify-between border-b border-border pb-2 text-xs uppercase text-muted-foreground">
						<span className="font-semibold">Financial Breakdown</span>
						<span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
							{tierLabel || "Basic"} Tier
						</span>
					</div>
					<div className="grid gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Gross Revenue</span>
							<span className="font-semibold">
								${metrics.totalRevenue.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Deal Profit ({inputs.profitMarginPercent || 0}%)
							</span>
							<span className="font-semibold text-green-600 dark:text-green-500">
								${metrics.actualProfit.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total Costs</span>
							<span className="font-semibold text-red-600 dark:text-red-500">
								${metrics.totalCost.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Campaign Overages</span>
							<span className="font-semibold">
								$
								{metrics.campaignOverage.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Included Credits</span>
							<span className="font-semibold">
								${metrics.includedCredits.toLocaleString()}
							</span>
						</div>
						<div className="h-px bg-border" />
						<div className="flex items-center justify-between">
							<span className="font-medium">Net Profit</span>
							<span
								className={cn(
									"font-bold text-xl",
									metrics.netProfit >= 0
										? "text-green-600 dark:text-green-500"
										: "text-red-600 dark:text-red-500",
								)}
							>
								${metrics.netProfit.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-lg border p-3">
						<p className="text-xs uppercase text-muted-foreground">
							Cost per Lead
						</p>
						<p className="mt-1 font-bold text-lg">
							${metrics.costPerLead.toFixed(2)}
						</p>
					</div>
					<div className="rounded-lg border p-3">
						<p className="text-xs uppercase text-muted-foreground">
							Cost per Deal
						</p>
						<p className="mt-1 font-bold text-lg">
							${metrics.costPerConversion.toFixed(2)}
						</p>
					</div>
					<div className="rounded-lg border p-3">
						<p className="text-xs uppercase text-muted-foreground">
							Deal Cycle Length
						</p>
						<p className="mt-1 font-bold text-lg">{avgDaysToClose || "0"}d</p>
					</div>
					<div className="rounded-lg border p-3">
						<p className="text-xs uppercase text-muted-foreground">
							Time Saved / Deal
						</p>
						<p className="mt-1 font-bold text-lg text-blue-600 dark:text-blue-500">
							{(
								(Number.parseFloat(inputs.hoursPerDeal || "0") || 0) * 0.7
							).toFixed(1)}
							h
						</p>
					</div>
				</div>

				<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-800 dark:bg-amber-950/30">
					<strong className="text-amber-600 dark:text-amber-400">Tip:</strong>{" "}
					Nurturing campaigns with consistent follow-ups can save{" "}
					{(metrics.totalTimeSaved / 8).toLocaleString("en-US", {
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					})}{" "}
					work days while maximizing conversions.
				</div>
			</div>
		</div>
	);
}
