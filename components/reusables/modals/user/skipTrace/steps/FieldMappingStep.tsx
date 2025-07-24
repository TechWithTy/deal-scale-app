import type { FC } from "react";

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

const FieldMappingStep: FC<FieldMappingStepProps> = ({
	headers,
	selectedHeaders,
	onHeaderSelect,
	errors,
}) => {
	return (
		<div className="grid grid-cols-2 gap-4">
			{fields.map(({ name, label }) => {
				const selectId = `field-mapping-select-${name}`;
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
							{headers.map((header) => (
								<option key={header} value={header}>
									{header}
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
