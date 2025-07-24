import { useSkipTraceStore } from "@/lib/stores/user/skipTraceStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import type {
	EnrichmentOption,
	InputField,
} from "@/types/skip-trace/enrichment";
import { enrichmentOptions } from "@/constants/skip-trace/enrichmentOptions";
import { fieldLabels } from "@/constants/skip-trace/fieldLabels";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { EnrichmentCard } from "./enrichment/EnrichmentCard";

// * Helper function to check if an enrichment option should be disabled
const isEnrichmentDisabled = (
	option: EnrichmentOption,
	userInput: Record<InputField, string>,
): boolean => {
	// * An option is disabled if any required field is missing
	return option.requiredFields.some((field: InputField) => !userInput[field]);
};

const getMissingFields = (
	option: EnrichmentOption,
	userInput: Record<InputField, string>,
): InputField[] => {
	return option.requiredFields.filter((field: InputField) => !userInput[field]);
};

interface EnrichmentStepProps {
	onNext: (
		selectedOptions: string[],
		userInput: Record<InputField, string>,
	) => void;
	onBack: () => void;
}

export function EnrichmentStep({ onNext, onBack }: EnrichmentStepProps) {
	const {
		leadCount,
		userInput,
		setUserInput,
		selectedEnrichmentOptions: selectedOptions,
		setSelectedEnrichmentOptions,
	} = useSkipTraceStore();
	const { userProfile } = useUserProfileStore();

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

	const creditCost = selectedOptions.reduce((total, optionId) => {
		const option = enrichmentOptions.find((opt) => opt.id === optionId);
		if (option && !option.isFree) {
			return total + leadCount;
		}
		return total;
	}, 0);

	const availableCredits =
		(userProfile?.subscription?.skipTraces.allotted ?? 0) -
		(userProfile?.subscription?.skipTraces.used ?? 0);

	const hasEnoughCredits = availableCredits >= creditCost;

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
							const isDisabled = isEnrichmentDisabled(enrichment, userInput);
							const missingFields = isDisabled
								? getMissingFields(enrichment, userInput)
								: [];

							return (
								<EnrichmentCard
									key={enrichment.id}
									enrichment={enrichment}
									isSelected={selectedOptions.includes(enrichment.id)}
									onToggle={() => handleSelectOption(enrichment.id)}
									userInput={userInput}
								/>
							);
						})}
					</div>
				</ScrollArea>
			</TooltipProvider>

			<div className="mt-auto pt-4">
				<div className="mb-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-900/50">
					<p className="font-medium text-blue-800 text-sm dark:text-blue-200">
						Available Credits: {availableCredits.toLocaleString()}
					</p>
				</div>
				{creditCost > 0 && (
					<div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-center dark:border-yellow-800 dark:bg-yellow-900/50">
						<p className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
							Estimated Cost: {creditCost.toLocaleString()} credits
						</p>
					</div>
				)}
				<div className="flex justify-between">
					<Button variant="outline" onClick={onBack}>
						Back
					</Button>
					<Button
						onClick={() => onNext(selectedOptions, userInput)}
						disabled={!hasEnoughCredits || selectedOptions.length === 0}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
