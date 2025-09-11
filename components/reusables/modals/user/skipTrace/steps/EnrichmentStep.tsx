import { useSkipTraceStore } from "@/lib/stores/user/skipTraceStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import type {
	EnrichmentOption,
	InputField,
} from "@/types/skip-trace/enrichment";
import { enrichmentOptions } from "@/constants/skip-trace/enrichmentOptions";
import { fieldLabels } from "@/constants/skip-trace/fieldLabels";
import { useUserStore } from "@/lib/stores/userStore";
import { EnrichmentCard } from "./enrichment/EnrichmentCard";

// * Helper functions that adapt to list vs single flow
const isEnrichmentDisabled = (
	option: EnrichmentOption,
	userInput: Record<InputField, string>,
	mappedTypes: Set<InputField> | null,
): boolean => {
	// If mappedTypes provided (list flow), validate against mapped header types
	if (mappedTypes) {
		return option.requiredFields.some(
			(field: InputField) => !mappedTypes.has(field),
		);
	}
	// Otherwise (single flow), validate against userInput
	return option.requiredFields.some((field: InputField) => !userInput[field]);
};

const getMissingFields = (
	option: EnrichmentOption,
	userInput: Record<InputField, string>,
	mappedTypes: Set<InputField> | null,
): InputField[] => {
	if (mappedTypes) {
		return option.requiredFields.filter(
			(field: InputField) => !mappedTypes.has(field),
		);
	}
	return option.requiredFields.filter((field: InputField) => !userInput[field]);
};

interface EnrichmentStepProps {
	onNext: (
		selectedOptions: string[],
		userInput: Record<InputField, string>,
	) => void;
	onBack: () => void;
	mappedTypesOverride?: Set<InputField> | null;
	leadCountOverride?: number;
}

export function EnrichmentStep({
	onNext,
	onBack,
	mappedTypesOverride = null,
	leadCountOverride,
}: EnrichmentStepProps) {
	const {
		leadCount,
		userInput,
		setUserInput,
		selectedEnrichmentOptions: selectedOptions,
		setSelectedEnrichmentOptions,
		selectedHeaders,
		uploadedFile,
	} = useSkipTraceStore();

	// Select credits from NextAuth-synced userStore
	const availableCredits = useUserStore((s) =>
		Math.max(
			0,
			(s.credits.skipTraces.allotted ?? 0) - (s.credits.skipTraces.used ?? 0),
		),
	);

	// Local submitting state for async submit UX
	const [submitting, setSubmitting] = useState(false);

	const handleInputChange = (field: InputField, value: string) => {
		const newUserInput = { ...userInput, [field]: value };
		setUserInput(newUserInput);
	};

	const handleSelectOption = (optionId: string) => {
		const newSelectedOptions = selectedOptions.includes(optionId)
			? selectedOptions.filter((id) => id !== optionId)
			: [...selectedOptions, optionId];
		setSelectedEnrichmentOptions(newSelectedOptions);
	};

	// Pricing policy: 1 credit per lead per paid tool
	const effectiveLeadCount =
		typeof leadCountOverride === "number" && leadCountOverride >= 0
			? leadCountOverride
			: leadCount;
	const premiumPerLead = new Set(["data_enrichment_suite", "domain_recon"]);
	const selectedPremiumCount = selectedOptions.filter((id) =>
		premiumPerLead.has(id),
	).length;
	const creditCost = effectiveLeadCount * selectedPremiumCount;

	const hasEnoughCredits = availableCredits >= creditCost;

	// Determine flow type and build a set of mapped types when in list flow
	const isListFlow = Boolean(uploadedFile) || Boolean(mappedTypesOverride);
	const mappedTypes: Set<InputField> | null = mappedTypesOverride
		? new Set(mappedTypesOverride)
		: uploadedFile
			? new Set(
					(selectedHeaders ?? [])
						.map((h) => h.type as InputField)
						.filter(Boolean),
				)
			: null;

	// Build userInput fed into EnrichmentCard: in list flow, mark mapped types as present
	const userInputForValidation: Record<InputField, string> = isListFlow
		? Array.from(mappedTypes ?? []).reduce(
				(acc, key) => {
					acc[key] = acc[key] || "1"; // any truthy marker
					return acc;
				},
				{ ...(userInput as Record<InputField, string>) } as Record<
					InputField,
					string
				>,
			)
		: userInput;

	return (
		<div className="flex h-full flex-col">
			<div className="mb-4">
				<h2 className="font-semibold text-lg">Choose Enrichments</h2>
				<p className="text-gray-500 text-sm">
					Select which data points you want to add to your list.
				</p>
			</div>

			<TooltipProvider>
				<ScrollArea className="h-72 flex-grow pr-4">
					<div className="grid grid-cols-2 gap-4 p-2">
						{enrichmentOptions.map((enrichment) => {
							const disabled = isEnrichmentDisabled(
								enrichment,
								userInputForValidation,
								mappedTypes,
							);
							const missingFields = disabled
								? getMissingFields(
										enrichment,
										userInputForValidation,
										mappedTypes,
									)
								: [];

							return (
								<EnrichmentCard
									key={enrichment.id}
									enrichment={enrichment}
									isSelected={selectedOptions.includes(enrichment.id)}
									onToggle={() => handleSelectOption(enrichment.id)}
									userInput={userInputForValidation}
								/>
							);
						})}
					</div>
				</ScrollArea>
			</TooltipProvider>

			<div className="mt-auto pt-4">
				{/* Total leads summary */}
				<div className="mb-2 rounded-md border border-gray-200 bg-muted p-3 text-center dark:border-gray-800 dark:bg-muted/30">
					<p className="font-medium text-sm">
						Total Leads: {effectiveLeadCount.toLocaleString()}
					</p>
				</div>
				<div className="mb-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-900/50">
					<p className="font-medium text-blue-800 text-sm dark:text-blue-200">
						Available Credits: {availableCredits.toLocaleString()}
					</p>
				</div>
				<div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-center dark:border-yellow-800 dark:bg-yellow-900/50">
					<p className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
						Estimated Cost: {creditCost.toLocaleString()} credits
					</p>
					<p className="mt-1 text-xs text-yellow-800 dark:text-yellow-200">
						Leads: {effectiveLeadCount.toLocaleString()} • Paid tools:{" "}
						{selectedPremiumCount}
					</p>
					<p className="text-xs text-yellow-800 dark:text-yellow-200">
						Estimated: {effectiveLeadCount.toLocaleString()} ×{" "}
						{selectedPremiumCount} = {creditCost.toLocaleString()}
					</p>
				</div>
				<div className="flex justify-between">
					<Button variant="outline" onClick={onBack}>
						Back
					</Button>
					<Button
						onClick={async () => {
							setSubmitting(true);
							try {
								await onNext(selectedOptions, userInput);
							} finally {
								setSubmitting(false);
							}
						}}
						disabled={!hasEnoughCredits || submitting}
					>
						{submitting ? "Submitting..." : "Submit"}
					</Button>
				</div>
			</div>
		</div>
	);
}
