/**
 * CSV Export Utility for Lookalike Candidates
 * Converts lead data to CSV format and triggers download
 * @module lookalike/utils
 */

import type { LookalikeCandidate } from "@/types/lookalike";

/**
 * Converts an array of objects to CSV format
 */
function convertToCSV(data: Record<string, any>[]): string {
	if (data.length === 0) return "";

	// Get headers from the first object
	const headers = Object.keys(data[0]);
	const csvHeaders = headers.join(",");

	// Convert each row
	const csvRows = data.map((row) => {
		return headers
			.map((header) => {
				const value = row[header];
				// Escape values that contain commas or quotes
				if (value === null || value === undefined) return "";
				const stringValue = String(value);
				if (stringValue.includes(",") || stringValue.includes('"')) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			})
			.join(",");
	});

	return [csvHeaders, ...csvRows].join("\n");
}

/**
 * Triggers a CSV file download in the browser
 */
function downloadCSV(csvContent: string, filename: string): void {
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");

	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}

export interface CsvExportOptions {
	includeEnrichedData?: boolean;
	filename?: string;
}

/**
 * Exports lookalike candidates to CSV format
 * @param candidates - Array of candidates to export
 * @param options - Export options
 */
export function exportCandidatesToCsv(
	candidates: LookalikeCandidate[],
	options: CsvExportOptions = {},
): void {
	const { includeEnrichedData = true, filename = "lookalike-leads.csv" } =
		options;

	if (candidates.length === 0) {
		throw new Error("No candidates to export");
	}

	// Map candidates to a flat structure for CSV
	const csvData = candidates.map((candidate) => {
		const baseData = {
			"Lead ID": candidate.leadId,
			"First Name": candidate.firstName,
			"Last Name": candidate.lastName,
			"Full Name": `${candidate.firstName} ${candidate.lastName}`,
			Address: candidate.address,
			City: candidate.city,
			State: candidate.state,
			"ZIP Code": candidate.zipCode,
			"Property Type": candidate.propertyType,
			"Similarity Score": `${candidate.similarityScore}%`,
		};

		// Add enriched data if requested
		if (includeEnrichedData) {
			return {
				...baseData,
				"Estimated Value": candidate.estimatedValue
					? `$${candidate.estimatedValue.toLocaleString()}`
					: "",
				Equity: candidate.equity ? `$${candidate.equity.toLocaleString()}` : "",
				"Ownership Duration": candidate.ownershipDuration || "",
				"Phone Number": candidate.phoneNumber || "",
				Email: candidate.email || "",
			};
		}

		return baseData;
	});

	// Generate CSV content
	const csvContent = convertToCSV(csvData);

	// Trigger download
	downloadCSV(csvContent, filename);
}

/**
 * Exports candidates with metadata header
 * Includes generation info and timestamp
 */
export function exportWithMetadata(
	candidates: LookalikeCandidate[],
	metadata: {
		seedListName: string;
		generatedAt?: string;
		totalCandidates: number;
		avgScore: number;
	},
	options: CsvExportOptions = {},
): void {
	const { includeEnrichedData = true, filename = "lookalike-leads.csv" } =
		options;

	if (candidates.length === 0) {
		throw new Error("No candidates to export");
	}

	// Create metadata header
	const metadataLines = [
		`"Lookalike Audience Export"`,
		`"Seed List: ${metadata.seedListName}"`,
		`"Generated: ${metadata.generatedAt || new Date().toISOString()}"`,
		`"Total Candidates: ${metadata.totalCandidates}"`,
		`"Average Similarity Score: ${metadata.avgScore.toFixed(1)}%"`,
		"", // Empty line separator
	];

	// Map candidates to CSV data
	const csvData = candidates.map((candidate) => {
		const baseData = {
			"Lead ID": candidate.leadId,
			"First Name": candidate.firstName,
			"Last Name": candidate.lastName,
			Address: candidate.address,
			City: candidate.city,
			State: candidate.state,
			"ZIP Code": candidate.zipCode,
			"Property Type": candidate.propertyType,
			"Similarity Score": `${candidate.similarityScore}%`,
		};

		if (includeEnrichedData) {
			return {
				...baseData,
				"Estimated Value": candidate.estimatedValue
					? `$${candidate.estimatedValue.toLocaleString()}`
					: "",
				Equity: candidate.equity ? `$${candidate.equity.toLocaleString()}` : "",
				"Ownership Duration": candidate.ownershipDuration || "",
				"Phone Number": candidate.phoneNumber || "",
				Email: candidate.email || "",
			};
		}

		return baseData;
	});

	// Generate CSV content with metadata
	const csvContent = convertToCSV(csvData);
	const fullContent = [...metadataLines, csvContent].join("\n");

	// Trigger download
	downloadCSV(fullContent, filename);
}
