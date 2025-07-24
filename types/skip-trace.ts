import type { InputField } from "./skip-trace/enrichment";

export interface Header {
	csvHeader: string;
	mappedTo: InputField | null;
	type:
		| "property_address"
		| "property_city"
		| "property_state"
		| "property_zip"
		| "owner_name"
		| "owner_mailing_address";
}
