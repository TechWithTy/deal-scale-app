import {
	FIELD_MAPPING_CONFIGS,
	REQUIRED_FIELD_MAPPING_KEYS,
} from "../../skipTrace/steps/FieldMappingStep";

const normalizeHeaderValue = (value: string) =>
	value.toLowerCase().replace(/[^a-z0-9]/g, "");

const FIELD_AUTOMAP_SYNONYMS: Record<string, string[]> = {
	firstNameField: [
		"first name",
		"firstname",
		"first",
		"given name",
		"fname",
		"primary first name",
	],
	lastNameField: ["last name", "lastname", "surname", "lname", "family name"],
	streetAddressField: [
		"street address",
		"address",
		"address1",
		"address line 1",
		"mailing address",
		"street",
	],
	cityField: ["city", "town", "municipality"],
	stateField: [
		"state",
		"state code",
		"state abbreviation",
		"stateabbr",
		"province",
		"region",
	],
	zipCodeField: [
		"zip",
		"zipcode",
		"zip code",
		"postal",
		"postal code",
		"postalcode",
	],
	phone1Field: [
		"phone",
		"phone1",
		"primary phone",
		"mobile",
		"cell",
		"main phone",
		"phone number",
		"contact phone",
	],
	phone2Field: [
		"phone2",
		"secondary phone",
		"alternate phone",
		"alt phone",
		"backup phone",
		"other phone",
	],
	facebookField: [
		"facebook",
		"facebook url",
		"facebook profile",
		"fb",
		"fb profile",
	],
	linkedinField: ["linkedin", "linkedin url", "linkedin profile"],
	instagramField: ["instagram", "instagram handle", "ig", "insta"],
	twitterField: ["twitter", "twitter handle", "x", "x handle", "twitter url"],
	dncStatusField: [
		"dnc status",
		"do not call",
		"donotcall",
		"dnc",
		"dnc flag",
		"suppressed",
	],
	dncSourceField: [
		"dnc source",
		"dnc reason",
		"suppression source",
		"do not call source",
		"dnc origin",
	],
	tcpaOptedInField: [
		"tcpa",
		"tcpa optin",
		"tcpa opt in",
		"tcpa consent",
		"tcpa status",
		"tcpa opted in",
	],
	socialSummary: [
		"social summary",
		"profile summary",
		"bio",
		"about",
		"description",
	],
};

const REQUIRED_FIELD_SET = new Set(REQUIRED_FIELD_MAPPING_KEYS);

const FIELD_NAME_ORDER = [
	...REQUIRED_FIELD_MAPPING_KEYS,
	...FIELD_MAPPING_CONFIGS.map((config) => config.name).filter(
		(fieldName) => !REQUIRED_FIELD_SET.has(fieldName),
	),
];

const FIELD_MATCHER_LOOKUP: Record<string, string[]> =
	FIELD_MAPPING_CONFIGS.reduce(
		(acc, config) => {
			const configuredSynonyms = FIELD_AUTOMAP_SYNONYMS[config.name] ?? [];
			const uniqueSynonyms = new Set<string>([
				config.label,
				...configuredSynonyms,
			]);
			acc[config.name] = Array.from(uniqueSynonyms)
				.map((synonym) => normalizeHeaderValue(synonym))
				.filter(Boolean);
			return acc;
		},
		{} as Record<string, string[]>,
	);

export const autoMapCsvHeaders = (
	headers: string[],
	previous?: Record<string, string | undefined>,
): Record<string, string | undefined> => {
	if (!headers.length) {
		return {};
	}

	const headerOptions = headers.map((header, idx) => ({
		key: `${header}__${idx}`,
		normalized: normalizeHeaderValue(header),
	}));

	const usedKeys = new Set<string>();
	const mapping: Record<string, string | undefined> = {};

	const ensurePreviousMapping = (fieldName: string) => {
		if (!previous) return false;
		const existingKey = previous[fieldName];
		if (!existingKey) return false;
		const stillExists = headerOptions.some(
			(option) => option.key === existingKey,
		);
		if (!stillExists) return false;
		usedKeys.add(existingKey);
		mapping[fieldName] = existingKey;
		return true;
	};

	const matchForField = (fieldName: string) => {
		const matchers = FIELD_MATCHER_LOOKUP[fieldName] ?? [];
		if (matchers.length === 0) return;

		const availableOptions = headerOptions.filter(
			(option) => !usedKeys.has(option.key),
		);
		if (availableOptions.length === 0) return;

		const exactMatch = availableOptions.find((option) =>
			matchers.some((matcher) => option.normalized === matcher),
		);
		if (exactMatch) {
			usedKeys.add(exactMatch.key);
			mapping[fieldName] = exactMatch.key;
			return;
		}

		const partialMatch = availableOptions.find((option) =>
			matchers.some((matcher) => option.normalized.includes(matcher)),
		);
		if (partialMatch) {
			usedKeys.add(partialMatch.key);
			mapping[fieldName] = partialMatch.key;
		}
	};

	FIELD_NAME_ORDER.forEach((fieldName) => {
		if (ensurePreviousMapping(fieldName)) return;
		matchForField(fieldName);
	});

	return mapping;
};

export const areRequiredFieldsMapped = (
	mapping: Record<string, string | undefined>,
) => REQUIRED_FIELD_MAPPING_KEYS.every((key) => Boolean(mapping[key]));
