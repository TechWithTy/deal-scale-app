"use client";

import { Compass } from "lucide-react";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
	type MarketTimelineOption,
	useQuickStartWizardDataStore,
} from "@/lib/stores/quickstartWizardData";

const MARKET_FILTERS = [
	"High Equity",
	"Absentee Owner",
	"Pre-Foreclosure",
	"Vacant",
	"Cash Buyer",
	"Senior Owner",
];

const TIMELINE_OPTIONS: Array<{
	value: MarketTimelineOption;
	label: string;
	description: string;
}> = [
	{
		value: "immediate",
		label: "Immediate Launch",
		description: "Activate within the next few days",
	},
	{
		value: "next-30-days",
		label: "Next 30 Days",
		description: "Campaign planned for this month",
	},
	{
		value: "this-quarter",
		label: "This Quarter",
		description: "Target go-live in the next 90 days",
	},
	{
		value: "later",
		label: "Future Backlog",
		description: "Collect insights but no imminent launch",
	},
];

const MarketDiscoveryStep = () => {
	const {
		marketFilters,
		toggleMarketFilter,
		budgetRange,
		setBudgetRange,
		timeline,
		setTimeline,
		marketNotes,
		setMarketNotes,
	} = useQuickStartWizardDataStore(
		(state) => ({
			marketFilters: state.marketFilters,
			toggleMarketFilter: state.toggleMarketFilter,
			budgetRange: state.budgetRange,
			setBudgetRange: state.setBudgetRange,
			timeline: state.timeline,
			setTimeline: state.setTimeline,
			marketNotes: state.marketNotes,
			setMarketNotes: state.setMarketNotes,
		}),
		shallow,
	);

	const formattedBudget = useMemo(
		() =>
			new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 0,
			}).format,
		[],
	);

	return (
		<div data-testid="market-discovery-step" className="space-y-6">
			<Card>
				<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<CardTitle className="text-xl">Signal Filters</CardTitle>
						<CardDescription>
							Choose the ownership or distress markers to emphasize in outreach.
						</CardDescription>
					</div>
					<Compass className="hidden h-10 w-10 text-primary sm:block" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2">
						{MARKET_FILTERS.map((filter) => (
							<Label
								key={filter}
								className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm shadow-sm hover:border-primary"
							>
								<Checkbox
									checked={marketFilters.includes(filter)}
									onCheckedChange={() => toggleMarketFilter(filter)}
								/>
								{filter}
							</Label>
						))}
					</div>
					<div className="flex flex-wrap gap-2">
						{marketFilters.map((filter) => (
							<Badge key={filter} variant="secondary">
								{filter}
							</Badge>
						))}
						{marketFilters.length === 0 && (
							<span className="text-muted-foreground text-xs">
								No filters selected yet.
							</span>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Budget & Timeline</CardTitle>
					<CardDescription>
						Dial in spend guardrails and launch expectations for this market.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label className="font-medium text-sm">Monthly spend range</Label>
						<Slider
							value={[...budgetRange]}
							onValueChange={(value) =>
								setBudgetRange([
									value[0] ?? budgetRange[0],
									value[1] ?? budgetRange[1],
								])
							}
							max={500000}
							step={5000}
						/>
						<p className="text-muted-foreground text-xs">
							{formattedBudget(budgetRange[0])} -{" "}
							{formattedBudget(budgetRange[1])}
						</p>
					</div>

					<div className="space-y-2">
						<Label className="font-medium text-sm">
							When do you plan to launch?
						</Label>
						<Select
							value={timeline}
							onValueChange={(value) =>
								setTimeline(value as MarketTimelineOption)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select timeline" />
							</SelectTrigger>
							<SelectContent>
								{TIMELINE_OPTIONS.map(({ value, label, description }) => (
									<SelectItem key={value} value={value}>
										<div className="flex flex-col">
											<span className="font-medium text-sm">{label}</span>
											<span className="text-muted-foreground text-xs">
												{description}
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Market Research Notes</CardTitle>
					<CardDescription>
						Document competitor intel, price pressures, or channel insights for
						this cohort.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						value={marketNotes}
						onChange={(event) => setMarketNotes(event.target.value)}
						placeholder="Example: Investors in East Austin respond best to SMS and ringless voicemail. Avoid weekdays after 6pm."
						className="min-h-[120px]"
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default MarketDiscoveryStep;
