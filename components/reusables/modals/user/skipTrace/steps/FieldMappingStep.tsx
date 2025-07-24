import type { FC } from "react";
import React from "react";
interface FieldMappingStepProps {
	headers: string[];
	selectedHeaders: Record<string, string | undefined>;
	onHeaderSelect: (fieldName: string, value: string) => void;
	errors: Record<string, { message?: string }>;
}

const fields = [
	{ name: "firstNameField", label: "First Name" },
	{ name: "lastNameField", label: "Last Name" },
	{ name: "streetAddressField", label: "Street Address" },
	{ name: "cityField", label: "City" },
	{ name: "stateField", label: "State" },
	{ name: "zipCodeField", label: "Zip Code" },
	{ name: "phone1Field", label: "Phone 1" },
	{ name: "phone2Field", label: "Phone 2" },
	{ name: "emailField", label: "Email" },
	{ name: "facebookField", label: "Facebook (Optional)" },
	{ name: "linkedinField", label: "LinkedIn (Optional)" },
	{ name: "instagramField", label: "Instagram (Optional)" },
	{ name: "twitterField", label: "Twitter (Optional)" },
];

const FieldMappingStep: FC<
	FieldMappingStepProps & { onCanProceedChange?: (canProceed: boolean) => void }
> = ({
	headers,
	selectedHeaders,
	onHeaderSelect,
	errors,
	onCanProceedChange,
}) => {
	// * Identify required (non-optional) fields
	const requiredFields = fields.filter((f) => !f.label.includes("Optional"));
	// * Compute if all required fields are mapped
	const allRequiredFieldsMapped = requiredFields.every(
		(f) => !!selectedHeaders[f.name],
	);

	// * Notify parent if prop provided (for parent-controlled Next button)
	React.useEffect(() => {
		if (onCanProceedChange) onCanProceedChange(allRequiredFieldsMapped);
	}, [allRequiredFieldsMapped, onCanProceedChange]);

	// todo: If rendering Next button here, use allRequiredFieldsMapped to enable/disable
	// ? Example usage (if needed):
	// <Button disabled={!allRequiredFieldsMapped}>Next</Button>

	// Build unique header options with index for duplicate headers
	const headerOptions = headers.map((header, idx) => ({
		key: `${header}__${idx}`,
		label: `${header} `,
		name: header,
		idx,
	}));

	// Utility: Get all selected header keys except for the current field
	const getAvailableHeaderOptions = (currentField: string) => {
		const selected = Object.entries(selectedHeaders)
			.filter(([field]) => field !== currentField)
			.map(([, value]) => value)
			.filter(Boolean);
		return headerOptions.filter(
			(h) =>
				!selected.includes(h.key) || selectedHeaders[currentField] === h.key,
		);
	};
	return (
		<div className="grid grid-cols-2 gap-4">
			{fields.map(({ name, label }) => {
				const selectId = `field-mapping-select-${name}`;
				const availableHeaderOptions = getAvailableHeaderOptions(name);
				return (
					<div key={name}>
						<label
							htmlFor={selectId}
							className="block font-medium text-sm dark:text-gray-300"
						>
							{label}
							{!label.includes("Optional") && "*"}
						</label>
						<select
							id={selectId}
							className="w-full rounded border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
							value={selectedHeaders[name] || ""}
							onChange={(e) => onHeaderSelect(name, e.target.value)}
							disabled={!headers.length}
						>
							<option value="">Select header</option>
							{availableHeaderOptions.map((opt) => (
								<option key={opt.key} value={opt.key}>
									{opt.label}
								</option>
							))}
						</select>
						{errors[name]?.message && (
							<p className="text-red-500 text-sm">{errors[name]?.message}</p>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default FieldMappingStep;
