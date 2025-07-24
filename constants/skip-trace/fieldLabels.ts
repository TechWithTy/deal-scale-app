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
	domain: "Domain",
	socialTag: "Social Media Handle",
};
