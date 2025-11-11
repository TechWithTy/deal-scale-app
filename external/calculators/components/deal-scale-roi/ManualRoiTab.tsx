import { TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/_utils";
import type { ManualRoiTabProps } from "./types";

const manualFields: Array<{
	id: keyof ManualRoiTabProps["inputs"];
	label: string;
	placeholder?: string;
	hint?: string;
}> = [
	{ id: "leadsGenerated", label: "Leads Generated" },
	{
		id: "conversionRate",
		label: "Conversion Rate (%)",
		hint: "Ideal range: 10-25%",
	},
	{ id: "avgDealValue", label: "Average Deal Value ($)" },
	{ id: "callsMade", label: "Calls Made" },
	{
		id: "smsThreads",
		label: "SMS Threads",
		placeholder: "10 msgs per thread",
	},
	{
		id: "socialThreads",
		label: "Social Threads",
		placeholder: "10 msgs per thread",
	},
];

export function ManualRoiTab({
	currentTierLabel,
	inputs,
	onInputsChange,
	onPlanChange,
	metrics,
	selectedPlan,
}: ManualRoiTabProps) {
	const isPositiveROI = metrics.roi > 0;
	const conversions =
		(Number.parseFloat(inputs.leadsGenerated || "0") *
			Number.parseFloat(inputs.conversionRate || "0")) /
		100;

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="space-y-4">
				<div className="rounded-lg bg-muted p-3 text-sm">
					<p className="font-medium">Current Tier:</p>
					<p className="mt-1 text-muted-foreground">
						You are on the{" "}
						<span className="font-medium text-foreground capitalize">
							{currentTierLabel || "Basic"}
						</span>{" "}
						tier. Adjust the plan below to compare ROI scenarios.
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="manual-plan">Subscription Plan</Label>
					<Select
						value={selectedPlan}
						onValueChange={(value) =>
							onPlanChange(value as typeof selectedPlan)
						}
					>
						<SelectTrigger id="manual-plan">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="starter">Starter - $1,200/mo</SelectItem>
							<SelectItem value="basic">Basic - $2,400/mo</SelectItem>
							<SelectItem value="enterprise">Enterprise - $5,000/mo</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{manualFields.map(({ id, label, hint, placeholder }) => (
					<div key={id} className="space-y-2">
						<Label htmlFor={`manual-${id}`} className="text-xs uppercase">
							{label}
						</Label>
						<Input
							id={`manual-${id}`}
							type="text"
							inputMode="numeric"
							value={inputs[id]}
							placeholder={placeholder}
							onChange={(event) => onInputsChange(id, event.target.value)}
						/>
						{hint && (
							<p className="text-muted-foreground text-xs">
								<span className="font-medium">Tip:</span> {hint}
							</p>
						)}
					</div>
				))}
			</div>

			<div className="space-y-4">
				<div className="space-y-3 rounded-lg bg-muted p-4">
					<div className="mb-2 flex items-center justify-between border-b border-border pb-2">
						<span className="font-semibold text-muted-foreground text-xs uppercase">
							Financial Summary
						</span>
						<span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs capitalize">
							{selectedPlan} Tier
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Total Revenue</span>
						<span className="font-semibold text-lg text-green-600 dark:text-green-500">
							${metrics.totalRevenue.toLocaleString()}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Total Cost</span>
						<span className="font-semibold text-lg text-red-600 dark:text-red-500">
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
							<span className="font-semibold text-sm">ROI</span>
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
							<span className="text-muted-foreground">Cost per Lead</span>
							<span className="font-medium">
								${metrics.costPerLead.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Cost per Conversion</span>
							<span className="font-medium">
								${metrics.costPerConversion.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Expected Conversions
							</span>
							<span className="font-medium">
								{Number.isFinite(conversions) ? conversions.toFixed(0) : "0"}
							</span>
						</div>
					</div>
				</div>

				<div className="rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
					<strong>Tip:</strong> A positive ROI indicates profitable campaigns.
					Aim for ROI above 100% for sustainable growth.
				</div>
			</div>
		</div>
	);
}
