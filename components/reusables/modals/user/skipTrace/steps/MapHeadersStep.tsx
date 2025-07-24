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
		<div className="space-y-4 p-4">
			<h3 className="font-medium text-lg">Map Your Headers</h3>
			<p className="text-gray-500 text-sm">
				Match the columns from your file to the corresponding fields.
			</p>
			<div className="space-y-3">
				{headers.map((header) => (
					<div key={header} className="grid grid-cols-2 items-center gap-4">
						<span className="font-medium text-gray-800 dark:text-gray-200">
							{header}
						</span>
						<select
							onChange={(e) => handleSelectChange(header, e.target.value)}
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
					className="rounded-md border bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				>
					Back
				</button>
				<button
					type="button"
					onClick={() => onSubmit(selectedHeaders)}
					className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Continue
				</button>
			</div>
		</div>
	);
};

export default MapHeadersStep;
