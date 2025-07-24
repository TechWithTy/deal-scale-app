export type ContactFieldType =
	| "firstName"
	| "lastName"
	| "address"
	| "email"
	| "phone"
	| "social"
	| "domain";

export interface ContactField {
	id: string;
	type: ContactFieldType;
	value: string;
	label: string;
}
