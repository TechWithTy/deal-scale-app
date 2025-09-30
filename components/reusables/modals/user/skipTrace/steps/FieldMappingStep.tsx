import { cn } from "@/lib/_utils";
import type { FC } from "react";
import React from "react";

type FieldConfig = {
	name: string;
	label: string;
	optional?: boolean;
};

interface FieldMappingStepProps {
	headers: string[];
	selectedHeaders: Record<string, string | undefined>;
	onHeaderSelect: (fieldName: string, value: string) => void;
	errors: Record<string, { message?: string }>;
}

const fieldConfigs: FieldConfig[] = [
	{ name: "firstNameField", label: "First Name" },
	{ name: "lastNameField", label: "Last Name" },
	{ name: "streetAddressField", label: "Street Address" },
	{ name: "cityField", label: "City" },
	{ name: "stateField", label: "State" },
	{ name: "zipCodeField", label: "Zip Code" },
	{ name: "phone1Field", label: "Phone 1" },
	{ name: "phone2Field", label: "Phone 2" },
	{ name: "emailField", label: "Email" },
	{ name: "facebookField", label: "Facebook (Optional)", optional: true },
	{ name: "linkedinField", label: "LinkedIn (Optional)", optional: true },
	{ name: "instagramField", label: "Instagram (Optional)", optional: true },
	{ name: "twitterField", label: "Twitter (Optional)", optional: true },
	{ name: "dncStatusField", label: "DNC Status (Optional)", optional: true },
	{ name: "dncSourceField", label: "DNC Source (Optional)", optional: true },
	{
		name: "tcpaOptedInField",
		label: "TCPA Opted In (Optional)",
		optional: true,
	},
];

export const REQUIRED_FIELD_MAPPING_KEYS = fieldConfigs
	.filter((config) => !config.optional)
	.map((config) => config.name);

const FieldMappingStep: FC<
	FieldMappingStepProps & { onCanProceedChange?: (canProceed: boolean) => void }
> = ({
	headers,
	selectedHeaders,
	onHeaderSelect,
	errors,
	onCanProceedChange,
}) => {
	const allRequiredFieldsMapped = REQUIRED_FIELD_MAPPING_KEYS.every(
		(fieldName) => !!selectedHeaders[fieldName],
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

	// Show message when no headers are available
	if (headers.length === 0) {
		return (
			<div className="col-span-full py-8 text-center">
				<div className="mb-2 text-muted-foreground">
					<svg
						className="mx-auto h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<p className="font-medium text-sm">No CSV headers available</p>
				<p className="mt-1 text-muted-foreground text-xs">
					Please upload a CSV file to map columns to fields
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{fieldConfigs.map(({ name, label, optional }) => {
				const selectId = `field-mapping-select-${name}`;
				const availableHeaderOptions = getAvailableHeaderOptions(name);
				return (
					<div key={name} className="space-y-3">
						<label
							htmlFor={selectId}
							className="block font-semibold text-foreground text-sm leading-tight"
						>
							{label}
							<span className={cn("text-destructive", !optional && "ml-0.5")}>
								{optional ? "(Optional)" : "*"}
							</span>
						</label>
						<select
							id={selectId}
							className="min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-foreground text-sm shadow-sm transition-all duration-200 hover:border-ring/50 hover:shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
							<p className="text-destructive text-sm">
								{errors[name]?.message}
							</p>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default FieldMappingStep;
