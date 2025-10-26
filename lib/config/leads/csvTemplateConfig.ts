import type { LeadTypeGlobal } from "@/types/_dashboard/leads";

export type LeadCsvTemplateFieldName =
	| "firstNameField"
	| "lastNameField"
	| "streetAddressField"
	| "cityField"
	| "stateField"
	| "zipCodeField"
	| "phone1Field"
	| "phone2Field"
	| "emailField"
	| "possibleEmailsField"
	| "facebookField"
	| "linkedinField"
	| "instagramField"
	| "twitterField"
	| "tiktokField"
	| "youtubeField"
	| "dncStatusField"
	| "dncSourceField"
	| "tcpaOptedInField"
	| "tcpaSourceField"
	| "socialSummary"
	| "bedroomsField"
	| "communicationPreferencesField"
	| "isIphoneField"
	| "companyField"
	| "domainField"
	| "jobTitleField"
	| "anniversaryField";

export interface LeadCsvTemplateFieldConfig {
	readonly name: LeadCsvTemplateFieldName;
	readonly label: string;
	readonly optional?: boolean;
	readonly example: string;
	readonly description?: string;
}

export const LEAD_CSV_TEMPLATE_FIELDS: readonly LeadCsvTemplateFieldConfig[] = [
	{
		name: "firstNameField",
		label: "First Name",
		example: "Alex",
	},
	{
		name: "lastNameField",
		label: "Last Name",
		example: "Johnson",
	},
	{
		name: "streetAddressField",
		label: "Street Address",
		example: "123 Main St",
	},
	{
		name: "cityField",
		label: "City",
		example: "Austin",
	},
	{
		name: "stateField",
		label: "State",
		example: "TX",
	},
	{
		name: "zipCodeField",
		label: "Zip Code",
		example: "78701",
	},
	{
		name: "phone1Field",
		label: "Phone 1",
		optional: true,
		example: "5125550199",
	},
	{
		name: "phone2Field",
		label: "Phone 2",
		optional: true,
		example: "5125550123",
	},
	{
		name: "emailField",
		label: "Primary Email",
		optional: true,
		example: "alex@example.com",
	},
	{
		name: "possibleEmailsField",
		label: "Possible Emails",
		optional: true,
		example: "alex.alt@example.com",
	},
	{
		name: "facebookField",
		label: "Facebook",
		optional: true,
		example: "https://facebook.com/alex.johnson",
	},
	{
		name: "linkedinField",
		label: "LinkedIn",
		optional: true,
		example: "https://linkedin.com/in/alexjohnson",
	},
	{
		name: "instagramField",
		label: "Instagram",
		optional: true,
		example: "@alex.johnson",
	},
	{
		name: "twitterField",
		label: "Twitter",
		optional: true,
		example: "@alex_johnson",
	},
	{
		name: "tiktokField",
		label: "TikTok",
		optional: true,
		example: "@alex.johnson",
	},
	{
		name: "youtubeField",
		label: "YouTube",
		optional: true,
		example: "https://youtube.com/@alexjohnson",
	},
	{
		name: "dncStatusField",
		label: "DNC Status",
		example: "false",
	},
	{
		name: "dncSourceField",
		label: "DNC Source (Required if DNC)",
		example: "Consumer opt-out",
	},
	{
		name: "tcpaOptedInField",
		label: "TCPA Opted In",
		example: "true",
	},
	{
		name: "tcpaSourceField",
		label: "TCPA Source (Required if Opted In)",
		example: "Web form consent",
	},
	{
		name: "socialSummary",
		label: "Social Summary",
		optional: true,
		example: "Engages with seller finance content",
	},
	{
		name: "bedroomsField",
		label: "Bedrooms",
		optional: true,
		example: "3",
	},
	{
		name: "communicationPreferencesField",
		label: "Communication Preferences",
		optional: true,
		example: "sms,email",
	},
	{
		name: "isIphoneField",
		label: "Is iPhone",
		optional: true,
		example: "true",
	},
	{
		name: "companyField",
		label: "Company",
		optional: true,
		example: "Sunrise Ventures",
	},
	{
		name: "domainField",
		label: "Domain Name",
		optional: true,
		example: "sunriseventures.com",
	},
	{
		name: "jobTitleField",
		label: "Job Title",
		optional: true,
		example: "Acquisitions Manager",
	},
	{
		name: "anniversaryField",
		label: "Anniversary",
		optional: true,
		example: "2020-06-15",
	},
] as const;

export const REQUIRED_LEAD_CSV_FIELDS: readonly LeadCsvTemplateFieldName[] =
	LEAD_CSV_TEMPLATE_FIELDS.filter((field) => !field.optional).map(
		(field) => field.name,
	);

export const LEAD_CSV_TEMPLATE_HEADERS: readonly string[] =
	LEAD_CSV_TEMPLATE_FIELDS.map((field) => field.label);

export const LEAD_CSV_TEMPLATE_EXAMPLE_ROW: readonly string[] =
	LEAD_CSV_TEMPLATE_FIELDS.map((field) => field.example);

export type LeadCsvTemplateExample = Pick<
	LeadTypeGlobal,
	| "socialSummary"
	| "company"
	| "domain"
	| "jobTitle"
	| "anniversary"
	| "communicationPreferences"
	| "isIphone"
> & {
	readonly contactInfo: LeadTypeGlobal["contactInfo"];
	readonly address1: LeadTypeGlobal["address1"];
	readonly dncList?: LeadTypeGlobal["dncList"];
	readonly dncSource?: LeadTypeGlobal["dncSource"];
	readonly tcpaOptedIn?: LeadTypeGlobal["tcpaOptedIn"];
	readonly tcpaSource?: LeadTypeGlobal["tcpaSource"];
};
