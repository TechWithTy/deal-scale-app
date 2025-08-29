import type { InputField } from "@/types/skip-trace/enrichment";

/**
 * @description Maps InputField values to human-readable labels for UI display.
 * * Using `type InputField` for import because it's a type alias, not an enum.
 */
export const fieldLabels: Record<InputField, string> = {
	firstName: "First Name",
	lastName: "Last Name",
	address: "Address",
	email: "Email",
	phone: "Phone Number",
	knownPhone: "Known Phone Number",
	domain: "Domain",
	socialTag: "Social Tag",
	facebookUrl: "Facebook URL",
	linkedinUrl: "LinkedIn URL",
	socialHandle: "Social Media Handle",
	socialSummary: "Social Media Summary",
	isIphone: "Is iPhone",
	communicationPreferences: "Communication Preferences",
	dncList: "DNC List",
};
