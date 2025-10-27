import { enrichmentOptions } from "@/constants/skip-trace/enrichmentOptions";
import type { LeadCsvTemplateFieldName } from "@/lib/config/leads/csvTemplateConfig";
import type { InputField } from "@/types/skip-trace/enrichment";

export type SelectedHeaderMap = Record<string, string | undefined>;

type FieldInputMapping = Partial<
	Record<LeadCsvTemplateFieldName, InputField[]>
>;

export const FIELD_TO_INPUT_FIELDS: FieldInputMapping = {
	firstNameField: ["firstName"],
	lastNameField: ["lastName"],
	streetAddressField: ["address"],
	cityField: [],
	stateField: [],
	zipCodeField: [],
	phone1Field: ["phone", "knownPhone"],
	phone2Field: ["phone"],
	emailField: ["email"],
	possibleEmailsField: ["email"],
	domainField: ["domain"],
	facebookField: ["facebookUrl", "socialTag"],
	linkedinField: ["linkedinUrl", "socialTag"],
	instagramField: ["socialHandle", "socialTag"],
	twitterField: ["socialHandle", "socialTag"],
	dncStatusField: ["dncList"],
	dncSourceField: [],
	tcpaOptedInField: ["communicationPreferences"],
	socialSummary: ["socialSummary"],
};

const addInputsForField = (
	available: Set<InputField>,
	fieldName: string,
	selectedHeaders: SelectedHeaderMap,
) => {
	if (!selectedHeaders[fieldName]) return;
	const inputs = FIELD_TO_INPUT_FIELDS[fieldName as LeadCsvTemplateFieldName];
	if (!inputs) return;
	for (const input of inputs) {
		if (input) available.add(input);
	}
};

export const deriveAvailableInputFields = (
	selectedHeaders: SelectedHeaderMap,
): Set<InputField> => {
	const available = new Set<InputField>();

	if (
		selectedHeaders.streetAddressField &&
		selectedHeaders.cityField &&
		selectedHeaders.stateField
	) {
		available.add("address");
	}

	for (const fieldName of Object.keys(FIELD_TO_INPUT_FIELDS)) {
		addInputsForField(available, fieldName, selectedHeaders);
	}

	return available;
};

const sortByCostAsc = (
	options: typeof enrichmentOptions,
): typeof enrichmentOptions =>
	[...options].sort((left, right) => (left.cost ?? 0) - (right.cost ?? 0));

export const deriveRecommendedEnrichmentOptions = (
	selectedHeaders: SelectedHeaderMap,
): string[] => {
	const availableInputs = deriveAvailableInputFields(selectedHeaders);
	if (availableInputs.size === 0) {
		return [];
	}

	const viableOptions = enrichmentOptions.filter((option) =>
		option.requiredFields.every((field) => availableInputs.has(field)),
	);

	if (viableOptions.length === 0) {
		return [];
	}

	const freeOptions = viableOptions.filter(
		(option) => option.isFree || (option.cost ?? 0) === 0,
	);
	if (freeOptions.length > 0) {
		return freeOptions.map((option) => option.id);
	}

	const sortedByCost = sortByCostAsc(viableOptions);
	const cheapestCost = sortedByCost[0]?.cost ?? 0;

	return sortedByCost
		.filter((option) => (option.cost ?? 0) === cheapestCost)
		.map((option) => option.id);
};
