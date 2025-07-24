// * Defines the possible input fields for a skip trace
export type InputField =
	| "firstName"
	| "lastName"
	| "address"
	| "email"
	| "phone"
	| "domain"
	| "socialTag";

// * Represents required fields as a flat array. All listed fields must be present.
// * e.g., ['firstName', 'lastName'] means firstName AND lastName are required.
export type RequiredFields = InputField[];

export interface EnrichmentOption {
	id: string;
	title: string;
	description: string;
	features: string[];
	isFree: boolean;
	cost: number;
	badge?: {
		text: string;
		bgColor: string;
		textColor: string;
	};
	// * Defines the data required to use this enrichment tool
	requiredFields: RequiredFields;
	// * Defines optional data that can enhance the results
	optionalFields: InputField[];
}
