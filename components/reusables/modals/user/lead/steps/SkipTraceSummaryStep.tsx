"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { enrichmentOptions } from "@/constants/skip-trace/enrichmentOptions";
import type { InputField } from "@/types/skip-trace/enrichment";
import { cn } from "@/lib/_utils";
import { FIELD_MAPPING_CONFIGS } from "../../skipTrace/steps/FieldMappingStep";
import { EnrichmentCard } from "../../skipTrace/steps/enrichment/EnrichmentCard";
import { useUserStore } from "@/lib/stores/userStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const FIELD_TO_INPUT_FIELDS: Record<string, InputField[] | undefined> = {
	firstNameField: ["firstName"],
	lastNameField: ["lastName"],
	streetAddressField: ["address"],
	cityField: [],
	stateField: [],
	zipCodeField: [],
	phone1Field: ["phone", "knownPhone"],
	phone2Field: ["phone"],
	emailField: ["email"],
	facebookField: ["facebookUrl", "socialTag"],
	linkedinField: ["linkedinUrl", "socialTag"],
	instagramField: ["socialHandle", "socialTag"],
	twitterField: ["socialHandle", "socialTag"],
	dncStatusField: ["dncList"],
	dncSourceField: [],
	tcpaOptedInField: ["communicationPreferences"],
	socialSummary: ["socialSummary"],
};

const INPUT_FIELD_LABELS: Record<InputField, string> = {
	firstName: "First Name",
	lastName: "Last Name",
	address: "Address",
	email: "Email",
	phone: "Phone",
	knownPhone: "Secondary Phone",
	domain: "Domain",
	socialTag: "Social Handle",
	facebookUrl: "Facebook URL",
	linkedinUrl: "LinkedIn URL",
	socialHandle: "Social Handle",
	socialSummary: "Social Summary",
	isIphone: "iPhone Flag",
	communicationPreferences: "TCPA Opted In",
	dncList: "DNC Status",
};

interface SkipTraceSummaryStepProps {
	selectedHeaders: Record<string, string | undefined>;
	selectedOptions: string[];
	onToggleOption: (optionId: string) => void;
	leadCount: number;
	onCostDetailsChange?: (details: {
		availableCredits: number;
		estimatedCredits: number;
		premiumCostPerLead: number;
		hasEnoughCredits: boolean;
	}) => void;
	isLaunching?: boolean;
}

export function SkipTraceSummaryStep({
	selectedHeaders,
	selectedOptions,
	onToggleOption,
	leadCount,
	onCostDetailsChange,
	isLaunching = false,
}: SkipTraceSummaryStepProps) {
	const mappedFields = FIELD_MAPPING_CONFIGS.map((config) => {
		const value = selectedHeaders[config.name];
		const headerLabel = value ? value.split("__")[0] : "";
		return {
			...config,
			headerLabel,
			mapped: Boolean(headerLabel),
		};
	});

	const availableInputs = new Set<InputField>();

	const hasStreet = Boolean(selectedHeaders["streetAddressField"]);
	const hasCity = Boolean(selectedHeaders["cityField"]);
	const hasState = Boolean(selectedHeaders["stateField"]);

	if (hasStreet && hasCity && hasState) {
		availableInputs.add("address");
	}

	for (const { name, mapped } of mappedFields) {
		if (!mapped) continue;
		const inputs = FIELD_TO_INPUT_FIELDS[name];
		if (!inputs) continue;
		for (const input of inputs) {
			if (input) availableInputs.add(input);
		}
	}

	const userInputForCards = Array.from(availableInputs).reduce(
		(acc, field) => {
			acc[field] = "1";
			return acc;
		},
		{} as Record<InputField, string>,
	);

	const toolAvailability = enrichmentOptions.map((option) => {
		const missing = option.requiredFields.filter(
			(field) => !availableInputs.has(field),
		);
		return { option, missing };
	});

	const availableCredits = useUserStore((state) => {
		const allotted = state.credits.skipTraces.allotted ?? 0;
		const used = state.credits.skipTraces.used ?? 0;
		return Math.max(0, allotted - used);
	});

	const selectedToolDetails = enrichmentOptions.filter((option) =>
		selectedOptions.includes(option.id),
	);
	const premiumTools = selectedToolDetails.filter((option) => !option.isFree);
	const freeTools = selectedToolDetails.filter((option) => option.isFree);
	const premiumCostPerLead = premiumTools.reduce(
		(total, option) => total + (option.cost ?? 0),
		0,
	);
	const estimatedCredits = leadCount > 0 ? leadCount * premiumCostPerLead : 0;
	const leadCountLabel =
		leadCount > 0 ? leadCount.toLocaleString() : "Pending upload";
	const estimatedCreditsLabel =
		premiumCostPerLead > 0
			? leadCount > 0
				? estimatedCredits.toLocaleString()
				: "Pending upload"
			: "0";
	const estimatedCreditsDisplay =
		estimatedCreditsLabel === "Pending upload"
			? estimatedCreditsLabel
			: `${estimatedCreditsLabel} credits`;
	const premiumPerLeadDisplay = `${premiumCostPerLead.toLocaleString()} credits`;
	const hasEnoughCredits =
		estimatedCredits === 0 || availableCredits >= estimatedCredits;
	const creditsShortfall = Math.max(0, estimatedCredits - availableCredits);
	const creditsShortfallDisplay = creditsShortfall.toLocaleString();

	useEffect(() => {
		onCostDetailsChange?.({
			availableCredits,
			estimatedCredits,
			premiumCostPerLead,
			hasEnoughCredits,
		});
	}, [
		availableCredits,
		estimatedCredits,
		premiumCostPerLead,
		hasEnoughCredits,
		onCostDetailsChange,
	]);

	return (
		<div className="space-y-6">
			<section className="rounded-lg border border-border bg-card">
				<header className="border-b border-border px-4 py-3">
					<h3 className="text-base font-semibold">Mapped CSV Fields</h3>
					<p className="text-xs text-muted-foreground">
						Review which lead fields were matched to your CSV columns. Any field
						marked with an asterisk is required to continue.
					</p>
				</header>
				<div className="grid gap-4 px-4 py-3 md:grid-cols-2">
					{mappedFields.map(
						({ name, label, optional, headerLabel, mapped }) => (
							<div key={name} className="space-y-1">
								<p className="text-sm font-medium text-foreground">
									{label}
									<span
										className={cn(
											optional
												? "ml-1 text-xs font-normal text-muted-foreground"
												: "ml-0.5 text-destructive",
										)}
									>
										{optional ? "(Optional)" : "*"}
									</span>
								</p>
								<p
									className={cn(
										"rounded-md border px-2 py-1 text-sm",
										mapped
											? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200"
											: "border-border bg-muted text-muted-foreground",
									)}
								>
									{mapped ? headerLabel : "Not mapped"}
								</p>
							</div>
						),
					)}
				</div>
			</section>

			<TooltipProvider>
				<section className="rounded-lg border border-border bg-card">
					<header className="border-b border-border px-4 py-3">
						<h3 className="text-base font-semibold">Choose Skip Trace Tools</h3>
						<p className="text-xs text-muted-foreground">
							Pick the automations to run on your mapped list. Tools that need
							more data will be disabled until required fields are mapped.
						</p>
					</header>
					<div className="grid gap-4 px-4 py-4 md:grid-cols-2">
						{toolAvailability.map(({ option }) => (
							<div key={option.id} className="space-y-2">
								<EnrichmentCard
									enrichment={option}
									isSelected={selectedOptions.includes(option.id)}
									onToggle={() => onToggleOption(option.id)}
									userInput={userInputForCards}
								/>
							</div>
						))}
						{toolAvailability.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No enrichment tools available yet. Map additional fields to
								unlock automations.
							</p>
						)}
					</div>
				</section>
			</TooltipProvider>

			<section className="rounded-lg border border-border bg-card">
				<header className="border-b border-border px-4 py-3">
					<h3 className="text-base font-semibold">Automation Cost Summary</h3>
					<p className="text-xs text-muted-foreground">
						Preview the credits required before launching enrichment. Premium
						tools charge per lead; free tools remain included at no cost.
					</p>
				</header>
				<div className="grid gap-4 px-4 py-4 md:grid-cols-2">
					<div className="rounded-md border border-border bg-muted/40 p-4">
						<p className="text-xs text-muted-foreground">Total Leads</p>
						<p className="text-lg font-semibold text-foreground">
							{leadCountLabel}
						</p>
					</div>
					<div className="rounded-md border border-border bg-muted/40 p-4">
						<p className="text-xs text-muted-foreground">Tools Selected</p>
						<p className="text-lg font-semibold text-foreground">
							{selectedToolDetails.length.toLocaleString()}
						</p>
					</div>
					<div className="rounded-md border border-border bg-muted/40 p-4">
						<p className="text-xs text-muted-foreground">
							Premium Cost Per Lead
						</p>
						<p className="text-lg font-semibold text-foreground">
							{premiumPerLeadDisplay}
						</p>
					</div>
					<div className="rounded-md border border-border bg-muted/40 p-4">
						<p className="text-xs text-muted-foreground">Estimated Credits</p>
						<p className="text-lg font-semibold text-foreground">
							{estimatedCreditsDisplay}
						</p>
					</div>
				</div>
				<div className="space-y-3 px-4 pb-4">
					<div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
						<p>
							Available credits:{" "}
							<span className="font-semibold text-foreground">
								{availableCredits.toLocaleString()}
							</span>
						</p>
						{premiumCostPerLead > 0 && (
							<p className="mt-1 text-[11px]">
								Final credits are calculated as leads × premium tools selected.
							</p>
						)}
					</div>
					{premiumTools.length > 0 ? (
						<p className="text-xs text-muted-foreground">
							Premium tools: {premiumTools.map((tool) => tool.title).join(", ")}
						</p>
					) : (
						<p className="text-xs text-muted-foreground">
							No premium tools selected. Choose a premium option to estimate
							credits.
						</p>
					)}
					{freeTools.length > 0 && (
						<p className="text-xs text-muted-foreground">
							Free inclusions: {freeTools.map((tool) => tool.title).join(", ")}
						</p>
					)}
					{!hasEnoughCredits && estimatedCredits > 0 && (
						<p className="text-xs text-destructive">
							Need {creditsShortfallDisplay} more skip trace credits to launch
							this suite.
						</p>
					)}
					{isLaunching && selectedToolDetails.length > 0 && (
						<div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>
								Launching enrichment on{" "}
								{leadCountLabel === "Pending upload"
									? "your list"
									: `${leadCountLabel} contacts`}
								...
							</span>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}

export default SkipTraceSummaryStep;
