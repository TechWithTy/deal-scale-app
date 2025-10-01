import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	{ name: "zipCodeField", label: "Zip Code", optional: true },
	{ name: "phone1Field", label: "Phone 1", optional: true },
	{ name: "phone2Field", label: "Phone 2", optional: true },
	{ name: "facebookField", label: "Facebook", optional: true },
	{ name: "linkedinField", label: "LinkedIn", optional: true },
	{ name: "instagramField", label: "Instagram", optional: true },
	{ name: "twitterField", label: "Twitter", optional: true },
	{ name: "dncStatusField", label: "DNC Status" },
	{ name: "dncSourceField", label: "DNC Source", optional: true },
	{ name: "tcpaOptedInField", label: "TCPA Opted In" },
	{ name: "socialSummary", label: "Social Summary", optional: true },
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
		(fieldName: string) => !!selectedHeaders[fieldName],
	);

	React.useEffect(() => {
		if (onCanProceedChange) onCanProceedChange(allRequiredFieldsMapped);
	}, [allRequiredFieldsMapped, onCanProceedChange]);

	const headerOptions = headers.map((header, idx) => ({
		key: `${header}__${idx}`,
		label: header,
		name: header,
		idx,
	}));

	const labelLookup = fieldConfigs.reduce<Record<string, string>>(
		(acc, config) => {
			acc[config.name] = config.label;
			return acc;
		},
		{},
	);
	const missingRequiredLabels = REQUIRED_FIELD_MAPPING_KEYS.filter(
		(fieldName: string) => !selectedHeaders[fieldName],
	).map((fieldName: string) => labelLookup[fieldName] ?? fieldName);

	const getAvailableHeaderOptions = (currentField: string) => {
		const selected = Object.entries(selectedHeaders)
			.filter(([field]) => field !== currentField)
			.map(([, value]) => value)
			.filter(Boolean);
		return headerOptions.filter(
			(option) =>
				!selected.includes(option.key) ||
				selectedHeaders[currentField] === option.key,
		);
	};

	if (headers.length === 0) {
		return (
			<div className="col-span-full py-8 text-center">
				<p className="text-sm font-medium">No CSV headers available</p>
				<p className="mt-1 text-xs text-muted-foreground">
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
							className="block text-sm font-semibold leading-tight text-foreground"
						>
							{label}
							<span
								className={cn(
									optional
										? "ml-1 text-xs font-normal text-muted-foreground"
										: "ml-0.5 text-destructive",
								)}
							>
								{optional ? "(Optional)" : "*"}
							</span>
						</label>
						<Select
							value={selectedHeaders[name] ?? ""}
							onValueChange={(value) => onHeaderSelect(name, value)}
							disabled={!headers.length}
						>
							<SelectTrigger
								id={selectId}
								className="min-h-[44px] w-full border border-border bg-background text-sm text-foreground shadow-sm transition hover:border-ring/50 hover:shadow-sm focus:border-ring dark:bg-slate-900 dark:text-slate-100"
							>
								<SelectValue placeholder="Select header" />
							</SelectTrigger>
							<SelectContent className="bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
								<SelectItem value="">None</SelectItem>
								{availableHeaderOptions.map((opt) => (
									<SelectItem key={opt.key} value={opt.key}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors[name]?.message && (
							<p className="text-sm text-destructive">
								{errors[name]?.message}
							</p>
						)}
					</div>
				);
			})}

			{missingRequiredLabels.length > 0 && (
				<div className="md:col-span-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
					Map required fields: {missingRequiredLabels.join(", ")}
				</div>
			)}
		</div>
	);
};

export default FieldMappingStep;

export { fieldConfigs as FIELD_MAPPING_CONFIGS };
