"use client";

import type React from "react";
import { useState } from "react";
import Papa, { type ParseResult } from "papaparse";

interface CsvRow {
	[key: string]: string;
}

interface UploadStepProps {
	onFileSelect: (
		file: File,
		headers: string[],
		name: string,
		data: CsvRow[],
	) => void;
	onBack: () => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onFileSelect, onBack }) => {
	const [listName, setListName] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		if (selectedFile.type !== "text/csv") {
			setError("Please upload a valid CSV file.");
			setFile(null);
			return;
		}

		setFile(selectedFile);
		setError("");
	};

	const handleContinue = async () => {
		if (!file || !listName.trim()) {
			setError("Please provide a list name and select a file.");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			Papa.parse<CsvRow>(file, {
				header: true,
				skipEmptyLines: true,
				complete: (results: ParseResult<CsvRow>) => {
					if (results.errors.length > 0) {
						setError(
							`Error parsing CSV: ${results.errors[0]?.message || "Unknown error"}`,
						);
						return;
					}

					if (!results.meta.fields || results.meta.fields.length === 0) {
						setError("The uploaded file doesn't contain any headers or data.");
						return;
					}

					onFileSelect(
						file,
						results.meta.fields,
						listName.trim(),
						results.data,
					);
				},
				error: (error: Error) => {
					setError(`Error processing file: ${error.message}`);
				},
			});
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An unknown error occurred while processing the file.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4 p-4">
			<div>
				<label
					htmlFor="listName"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					List Name
				</label>
				<input
					type="text"
					id="listName"
					value={listName}
					onChange={(e) => setListName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					placeholder="e.g., High Equity Leads"
					aria-required="true"
					aria-invalid={!listName.trim()}
				/>
			</div>
			<div>
				<label
					htmlFor="fileUpload"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					Upload CSV
				</label>
				<input
					type="file"
					id="fileUpload"
					accept=".csv"
					onChange={handleFileChange}
					className="mt-1 block w-full text-gray-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
					aria-describedby="fileHelp"
					disabled={isLoading}
				/>
				<p id="fileHelp" className="mt-1 text-gray-500 text-xs">
					Upload a CSV file with headers in the first row
				</p>
			</div>
			{error && (
				<div
					role="alert"
					className="rounded-md bg-red-50 p-3 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400"
				>
					{error}
				</div>
			)}
			<div className="flex justify-between">
				<button
					type="button"
					onClick={onBack}
					className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
					disabled={isLoading}
				>
					Back
				</button>
				<button
					type="button"
					onClick={handleContinue}
					disabled={!file || !listName.trim() || isLoading}
					className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					aria-busy={isLoading}
				>
					{isLoading ? "Processing..." : "Continue"}
				</button>
			</div>
		</div>
	);
};

export default UploadStep;
