"use client";

import type { Header } from "@/types/skip-trace";
import type React from "react";
import { useState } from "react";

interface MapHeadersStepProps {
	headers: string[];
	onSubmit: (headers: Header[]) => void;
	onBack: () => void;
}

const availableFields: Array<{ value: Header["type"]; label: string }> = [
	{ value: "property_address", label: "Property Address" },
	{ value: "property_city", label: "Property City" },
	{ value: "property_state", label: "Property State" },
	{ value: "property_zip", label: "Property Zip" },
	{ value: "owner_name", label: "Owner Name" },
	{ value: "owner_mailing_address", label: "Owner Mailing Address" },
	{ value: "firstName", label: "First Name" },
	{ value: "lastName", label: "Last Name" },
	{ value: "phone", label: "Phone" },
	{ value: "facebookUrl", label: "Facebook URL" },
	{ value: "linkedinUrl", label: "LinkedIn URL" },
	{ value: "socialHandle", label: "Social Media Handle" },
	{ value: "socialSummary", label: "Social Media Summary" },
	{ value: "isIphone", label: "Is iPhone" },
	{ value: "communicationPreferences", label: "Communication Preferences" },
	{ value: "dncList", label: "DNC List (optional)" },
	{ value: "bestContactTime", label: "Best Time to Contact" },
	{ value: "leadNotes", label: "Lead Notes" },
];

const MapHeadersStep: React.FC<MapHeadersStepProps> = ({
	headers,
	onSubmit,
	onBack,
}) => {
	const [selectedHeaders, setSelectedHeaders] = useState<Header[]>([]);

	const handleSelectChange = (csvHeader: string, selectedType: string) => {
		const newSelection: Header = {
			csvHeader,
			type: selectedType as Header["type"],
			mappedTo: selectedType as Header["mappedTo"],
		};
		setSelectedHeaders((prev) => [
			...prev.filter((h) => h.csvHeader !== csvHeader),
			newSelection,
		]);
	};

	return (
		<div className="space-y-4 p-4 text-foreground">
			<h3 className="text-lg font-medium">Map Your Headers</h3>
			<p className="text-sm text-muted-foreground">
				Match the columns from your file to the corresponding fields.
			</p>
			<div className="space-y-3">
				{headers.map((header) => (
					<div key={header} className="grid grid-cols-2 items-center gap-4">
						<span className="font-medium">{header}</span>
						<select
							onChange={(e) => handleSelectChange(header, e.target.value)}
							className="block w-full rounded-md border border-border bg-background text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">Select a field...</option>
							{availableFields.map((field) => (
								<option key={field.value} value={field.value}>
									{field.label}
								</option>
							))}
						</select>
					</div>
				))}
			</div>
			<div className="flex justify-between">
				<button
					type="button"
					onClick={onBack}
					className="rounded-md border border-border bg-background px-4 py-2 font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
				>
					Back
				</button>
				<button
					type="button"
					onClick={() => onSubmit(selectedHeaders)}
					className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
				>
					Continue
				</button>
			</div>
		</div>
	);
};

export default MapHeadersStep;
